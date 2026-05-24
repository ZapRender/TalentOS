<?php

require_once __DIR__ . '/../models/PlanillaPILA.php';
require_once __DIR__ . '/../models/LiquidacionNomina.php';
require_once __DIR__ . '/../middleware/JwtMiddleware.php';
require_once __DIR__ . '/../utils/PILAGenerator.php';

class PILAController
{
    public static function listar(array $params): void
    {
        $planillas = PlanillaPILA::findAll();
        self::ok($planillas);
    }

    public static function generar(array $params): void
    {
        $body = self::body();

        if (empty($body['anio']) || empty($body['mes'])) {
            self::error(400, 'anio y mes son requeridos');
        }

        $anio = (int)$body['anio'];
        $mes  = (int)$body['mes'];

        if ($mes < 1 || $mes > 12) {
            self::error(400, 'mes debe ser entre 1 y 12');
        }

        // Verificar si ya existe
        $existente = PlanillaPILA::findByMes($anio, $mes);
        if ($existente) {
            self::error(409, "Ya existe una planilla PILA para {$mes}/{$anio}");
        }

        // Obtener empleados activos del employee-service
        $empleados = self::getEmpleadosActivos();
        if ($empleados === null) {
            self::error(502, 'employee-service no disponible');
        }
        if (empty($empleados)) {
            self::error(400, 'No hay empleados activos para generar la PILA');
        }

        // Generar archivo plano
        $archivoPlano = PILAGenerator::generar($empleados, $anio, $mes);

        // Guardar archivo
        $dir      = '/var/www/html/uploads/pila';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $filename = "pila_{$anio}_{$mes}.txt";
        $path     = "{$dir}/{$filename}";
        file_put_contents($path, $archivoPlano);

        // Calcular total aportes (aproximado desde liquidaciones)
        $totalAportes = self::calcularTotalAportes($empleados);

        // Fecha límite pago: día 10 del mes siguiente
        $fechaLimite = date('Y-m-d', mktime(0, 0, 0, $mes + 1, 10, $anio));

        $id       = PlanillaPILA::create([
            'anio'               => $anio,
            'mes'                => $mes,
            'fecha_limite_pago'  => $fechaLimite,
            'total_empleados'    => count($empleados),
            'total_aportes'      => $totalAportes,
            'archivo_plano_path' => "uploads/pila/{$filename}",
            'notificado_a'       => (int)JwtMiddleware::$user['userId'],
        ]);

        $planilla = PlanillaPILA::findById($id);

        http_response_code(201);
        self::ok($planilla, 'Planilla PILA generada');
    }

    public static function descargarArchivo(array $params): void
    {
        $mes  = $params['mes'] ?? '';
        $anio = (int)date('Y');

        // mes puede ser "2025-03" o solo "3"
        if (str_contains($mes, '-')) {
            [$anio, $mes] = explode('-', $mes);
        }

        $planilla = PlanillaPILA::findByMes((int)$anio, (int)$mes);
        if (!$planilla) {
            self::error(404, 'Planilla PILA no encontrada para ese mes');
        }

        $path = '/var/www/html/' . $planilla['archivo_plano_path'];
        if (!file_exists($path)) {
            self::error(404, 'Archivo plano no encontrado en el servidor');
        }

        $filename = basename($path);
        header('Content-Type: text/plain');
        header("Content-Disposition: attachment; filename=\"{$filename}\"");
        header('Content-Length: ' . filesize($path));
        readfile($path);
        exit;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static function getEmpleadosActivos(): ?array
    {
        $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $ch    = curl_init('http://employee-service:8080/employees?estado=activo');
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
        $data = json_decode($body, true);
        return $data['data'] ?? $data;
    }

    private static function calcularTotalAportes(array $empleados): float
    {
        $total = 0;
        foreach ($empleados as $emp) {
            $salario = (float)($emp['salario'] ?? 0);
            $ibc     = max($salario, 1_423_500);
            // Salud total (12.5%) + Pensión total (16%) + ARL clase I (0.522%)
            $total += round($ibc * (0.125 + 0.16 + 0.00522), 2);
        }
        return $total;
    }

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
