<?php

require_once __DIR__ . '/../models/PeriodoNomina.php';
require_once __DIR__ . '/../models/LiquidacionNomina.php';
require_once __DIR__ . '/../models/ConceptoLiquidado.php';
require_once __DIR__ . '/../models/Novedad.php';
require_once __DIR__ . '/../middleware/JwtMiddleware.php';
require_once __DIR__ . '/../utils/PDFGenerator.php';
require_once __DIR__ . '/../utils/ExcelExporter.php';
require_once __DIR__ . '/../utils/EmailSender.php';

class NominaController
{
    // SMMLV y auxilio transporte 2025 (Colombia)
    private const SMMLV              = 1_423_500;
    private const AUXILIO_TRANSPORTE = 200_000;

    // ── Periodos ──────────────────────────────────────────────────────────────

    public static function listarPeriodos(array $params): void
    {
        $periodos = PeriodoNomina::findAll();
        self::ok($periodos);
    }

    public static function getPeriodo(array $params): void
    {
        $periodo = PeriodoNomina::findById((int)$params['id']);
        if (!$periodo) {
            self::error(404, 'Período no encontrado');
        }
        self::ok($periodo);
    }

    public static function crearPeriodo(array $params): void
    {
        $body = self::body();
        $required = ['anio', 'mes', 'quincena', 'fecha_inicial', 'fecha_final', 'fecha_pago'];

        foreach ($required as $field) {
            if (empty($body[$field])) {
                self::error(400, "El campo '{$field}' es requerido");
            }
        }

        if (!in_array((int)$body['quincena'], [1, 2], true)) {
            self::error(400, 'quincena debe ser 1 o 2');
        }

        try {
            $id      = PeriodoNomina::create($body);
            $periodo = PeriodoNomina::findById($id);
            http_response_code(201);
            self::ok($periodo, 'Período creado');
        } catch (\PDOException $e) {
            if ($e->getCode() === '23000') {
                self::error(409, 'Ya existe un período para ese año/mes/quincena');
            }
            throw $e;
        }
    }

    // ── Liquidación ───────────────────────────────────────────────────────────

    public static function liquidar(array $params): void
    {
        $periodoId = (int)$params['id'];
        $periodo   = PeriodoNomina::findById($periodoId);

        if (!$periodo) {
            self::error(404, 'Período no encontrado');
        }
        if ($periodo['estado'] !== 'abierto') {
            self::error(409, "El período ya está en estado '{$periodo['estado']}'");
        }

        // Obtener empleados activos del employee-service
        $empleados = self::getEmpleadosActivos();
        if ($empleados === null) {
            self::error(502, 'employee-service no disponible');
        }
        if (empty($empleados)) {
            self::error(400, 'No hay empleados activos para liquidar');
        }

        $totalNeto   = 0;
        $liquidadas  = 0;
        $errores     = [];

        foreach ($empleados as $emp) {
            try {
                $result     = self::liquidarEmpleado($emp, $periodoId, $periodo);
                $totalNeto += $result['neto_pagar'];
                $liquidadas++;
            } catch (\Throwable $e) {
                $errores[] = "Empleado {$emp['id']}: " . $e->getMessage();
                error_log("[NominaController::liquidar] " . end($errores));
            }
        }

        PeriodoNomina::updateEstadoYTotal($periodoId, 'liquidado', $totalNeto);

        self::ok([
            'periodo_id'  => $periodoId,
            'liquidadas'  => $liquidadas,
            'total_neto'  => $totalNeto,
            'errores'     => $errores,
        ], 'Nómina liquidada');
    }

    public static function aprobar(array $params): void
    {
        $periodoId = (int)$params['id'];
        $periodo   = PeriodoNomina::findById($periodoId);

        if (!$periodo) {
            self::error(404, 'Período no encontrado');
        }
        if ($periodo['estado'] !== 'liquidado') {
            self::error(409, "El período debe estar 'liquidado' para aprobar (estado actual: {$periodo['estado']})");
        }

        $userId = (int)JwtMiddleware::$user['userId'];
        PeriodoNomina::aprobar($periodoId, $userId);

        self::ok(['periodo_id' => $periodoId, 'estado' => 'aprobado'], 'Nómina aprobada');
    }

    public static function enviarDesprendibles(array $params): void
    {
        $periodoId = (int)$params['id'];
        $periodo   = PeriodoNomina::findById($periodoId);

        if (!$periodo) {
            self::error(404, 'Período no encontrado');
        }
        if (!in_array($periodo['estado'], ['aprobado', 'liquidado'], true)) {
            self::error(409, 'El período debe estar aprobado o liquidado para enviar desprendibles');
        }

        $liquidaciones = LiquidacionNomina::findByPeriodo($periodoId);
        $periodoLabel  = "Q{$periodo['quincena']}-{$periodo['mes']}/{$periodo['anio']}";
        $enviados      = 0;
        $errores       = [];

        foreach ($liquidaciones as $liq) {
            try {
                $emp      = self::getEmpleado((int)$liq['empleado_id']);
                $email    = $emp['email'] ?? null;
                if (!$email) {
                    continue;
                }

                $conceptos = ConceptoLiquidado::findByLiquidacion((int)$liq['id']);
                $html      = PDFGenerator::desprendible($liq, $conceptos, $emp, $periodo);

                $sent = EmailSender::sendDesprendible($email, $emp['nombre'] ?? '', $html, $periodoLabel);
                if ($sent) {
                    $enviados++;
                } else {
                    $errores[] = "No se pudo enviar a empleado {$liq['empleado_id']}";
                }
            } catch (\Throwable $e) {
                $errores[] = "Empleado {$liq['empleado_id']}: " . $e->getMessage();
            }
        }

        self::ok([
            'enviados' => $enviados,
            'errores'  => $errores,
        ], "{$enviados} desprendibles enviados");
    }

    // ── Resultado ─────────────────────────────────────────────────────────────

    public static function getResultado(array $params): void
    {
        $periodoId = (int)$params['id'];
        $periodo   = PeriodoNomina::findById($periodoId);

        if (!$periodo) {
            self::error(404, 'Período no encontrado');
        }

        $liquidaciones = LiquidacionNomina::findByPeriodo($periodoId);

        foreach ($liquidaciones as &$liq) {
            $liq['conceptos'] = ConceptoLiquidado::findByLiquidacion((int)$liq['id']);
        }
        unset($liq);

        $totalDevengado = array_sum(array_column($liquidaciones, 'total_devengado'));
        $totalDeducido  = array_sum(array_column($liquidaciones, 'total_deducido'));
        $totalNeto      = array_sum(array_column($liquidaciones, 'neto_pagar'));

        self::ok([
            'periodo'        => $periodo,
            'liquidaciones'  => $liquidaciones,
            'totalEmpleados' => count($liquidaciones),
            'totalDevengado' => $totalDevengado,
            'totalDeducido'  => $totalDeducido,
            'totalNeto'      => $totalNeto,
        ]);
    }

    // ── Reportes ──────────────────────────────────────────────────────────────

    public static function exportarExcel(array $params): void
    {
        $periodoId = (int)$params['periodoId'];
        $periodo   = PeriodoNomina::findById($periodoId);
        if (!$periodo) {
            self::error(404, 'Período no encontrado');
        }

        $liquidaciones = LiquidacionNomina::findByPeriodo($periodoId);
        $xml           = ExcelExporter::nominaPeriodo($liquidaciones, $periodo);
        $filename      = "nomina_Q{$periodo['quincena']}_{$periodo['mes']}_{$periodo['anio']}.xml";

        header('Content-Type: application/vnd.ms-excel');
        header("Content-Disposition: attachment; filename=\"{$filename}\"");
        echo $xml;
        exit;
    }

    public static function desprendible(array $params): void
    {
        $periodoId  = (int)$params['periodoId'];
        $empleadoId = (int)$params['empleadoId'];

        $periodo = PeriodoNomina::findById($periodoId);
        if (!$periodo) {
            self::error(404, 'Período no encontrado');
        }

        $liq = LiquidacionNomina::findByEmpleadoYPeriodo($empleadoId, $periodoId);
        if (!$liq) {
            self::error(404, 'Liquidación no encontrada para este empleado y período');
        }

        $conceptos = ConceptoLiquidado::findByLiquidacion((int)$liq['id']);
        $emp       = self::getEmpleado($empleadoId) ?? ['id' => $empleadoId, 'nombre' => 'N/D'];
        $html      = PDFGenerator::desprendible($liq, $conceptos, $emp, $periodo);

        header('Content-Type: text/html; charset=UTF-8');
        echo $html;
        exit;
    }

    // ── Business logic — payroll calculation ─────────────────────────────────

    private static function liquidarEmpleado(array $emp, int $periodoId, array $periodo): array
    {
        $empleadoId    = (int)$emp['id'];
        $salario       = (float)($emp['salario'] ?? 0);
        $diasTrabajados = 15; // quincena

        $devengados  = [];
        $deducciones = [];

        // 001 — Salario básico (mitad del mensual por quincena)
        $salarioQuincena = round($salario / 2, 2);
        $devengados[] = [
            'codigo'          => '001',
            'descripcion'     => 'Salario Básico',
            'cantidad'        => $diasTrabajados,
            'valor_devengado' => $salarioQuincena,
            'valor_deducido'  => 0,
        ];

        // 020 — Auxilio de transporte (solo si salario <= 2 SMMLV)
        if ($salario <= 2 * self::SMMLV) {
            $devengados[] = [
                'codigo'          => '020',
                'descripcion'     => 'Auxilio de Transporte',
                'cantidad'        => 1,
                'valor_devengado' => round(self::AUXILIO_TRANSPORTE / 2, 2),
                'valor_deducido'  => 0,
            ];
        }

        // Novedades registradas para este empleado y período
        $novedades = Novedad::findByEmpleadoYPeriodo($empleadoId, $periodoId);
        foreach ($novedades as $nov) {
            $entry = [
                'codigo'          => $nov['concepto_codigo'],
                'descripcion'     => $nov['concepto_descripcion'],
                'cantidad'        => (float)$nov['cantidad'],
                'valor_devengado' => 0,
                'valor_deducido'  => 0,
            ];
            if ($nov['es_deduccion']) {
                $entry['valor_deducido'] = (float)$nov['valor'];
                $deducciones[] = $entry;
            } else {
                $entry['valor_devengado'] = (float)$nov['valor'];
                $devengados[] = $entry;
            }
        }

        // 913 — EPS Salud (4% sobre salario mensual / 2 por quincena)
        $saludDeduccion = round($salario * 0.04 / 2, 2);
        $deducciones[] = [
            'codigo'          => '913',
            'descripcion'     => 'EPS Salud',
            'cantidad'        => 1,
            'valor_devengado' => 0,
            'valor_deducido'  => $saludDeduccion,
        ];

        // 810 — AFP Pensión (4% sobre salario mensual / 2 por quincena)
        $pensionDeduccion = round($salario * 0.04 / 2, 2);
        $deducciones[] = [
            'codigo'          => '810',
            'descripcion'     => 'AFP Pensión',
            'cantidad'        => 1,
            'valor_devengado' => 0,
            'valor_deducido'  => $pensionDeduccion,
        ];

        // Fondo de solidaridad (1% si salario > 4 SMMLV)
        if ($salario > 4 * self::SMMLV) {
            $solidaridadDeduccion = round($salario * 0.01 / 2, 2);
            $deducciones[] = [
                'codigo'          => '915',
                'descripcion'     => 'Fondo de Solidaridad Pensional',
                'cantidad'        => 1,
                'valor_devengado' => 0,
                'valor_deducido'  => $solidaridadDeduccion,
            ];
        }

        $totalDevengado = array_sum(array_column($devengados,  'valor_devengado'));
        $totalDeducido  = array_sum(array_column($deducciones, 'valor_deducido'));
        $netoPagar      = $totalDevengado - $totalDeducido;

        // Persist
        $liqId = LiquidacionNomina::upsert(
            $empleadoId, $periodoId,
            $totalDevengado, $totalDeducido, $netoPagar, $diasTrabajados
        );

        // Replace conceptos
        ConceptoLiquidado::deleteByLiquidacion($liqId);
        ConceptoLiquidado::createMany($liqId, array_merge($devengados, $deducciones));

        return ['neto_pagar' => $netoPagar];
    }

    // ── Inter-service calls ───────────────────────────────────────────────────

    private static function getEmpleadosActivos(): ?array
    {
        $response = self::serviceGet('http://employee-service:8080/employees?estado=activo');
        if ($response === null) {
            return null;
        }
        return $response['data'] ?? $response;
    }

    private static function getEmpleado(int $id): ?array
    {
        $response = self::serviceGet("http://employee-service:8080/employees/{$id}");
        if ($response === null) {
            return null;
        }
        return $response['data'] ?? $response;
    }

    private static function serviceGet(string $url): ?array
    {
        $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $ch    = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => ["Authorization: {$token}"],
            CURLOPT_TIMEOUT        => 10,
        ]);
        $body     = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($body === false || $httpCode !== 200) {
            return null;
        }
        return json_decode($body, true);
    }

    // ── Response helpers ──────────────────────────────────────────────────────

    private static function ok(mixed $data, string $message = 'OK'): void
    {
        echo json_encode(['success' => true, 'data' => $data, 'message' => $message]);
    }

    private static function error(int $code, string $message): never
    {
        http_response_code($code);
        echo json_encode(['success' => false, 'error' => $message, 'code' => $code]);
        exit;
    }

    private static function body(): array
    {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }
}
