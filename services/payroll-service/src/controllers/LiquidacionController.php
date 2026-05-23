<?php

require_once __DIR__ . '/../models/LiquidacionContrato.php';
require_once __DIR__ . '/../middleware/JwtMiddleware.php';

class LiquidacionController
{
    /**
     * Calcular liquidación de contrato.
     *
     * Fórmulas (ley laboral colombiana):
     *   Vacaciones            = (días_trabajados / 360) × 15 × salario_diario
     *   Cesantías             = (salario × días_trabajados) / 360
     *   Intereses de cesantías = cesantías × 0.12 × (días_trabajados / 360)
     *   Prima                 = (salario × días_trabajados) / 360   (base desde 1 jul año en curso)
     */
    public static function calcular(array $params): void
    {
        $body     = self::body();
        $required = ['empleado_id', 'fecha_inicio', 'fecha_terminacion', 'motivo_retiro',
                     'salario', 'base_vacaciones', 'base_cesantias', 'base_primas'];

        foreach ($required as $field) {
            if (!isset($body[$field]) || $body[$field] === '') {
                self::error(400, "El campo '{$field}' es requerido");
            }
        }

        $motivosValidos = ['renuncia', 'no_renovacion', 'despido_justa', 'despido_sin_justa', 'mutuo_acuerdo'];
        if (!in_array($body['motivo_retiro'], $motivosValidos, true)) {
            self::error(400, 'motivo_retiro inválido');
        }

        $salario          = (float)$body['salario'];
        $fechaInicio      = new \DateTime($body['fecha_inicio']);
        $fechaTerminacion = new \DateTime($body['fecha_terminacion']);
        $diffDias         = (int)$fechaInicio->diff($fechaTerminacion)->days;
        $salarioDiario    = $salario / 30;

        $baseVacaciones = (float)$body['base_vacaciones'];
        $baseCesantias  = (float)$body['base_cesantias'];
        $basePrimas     = (float)$body['base_primas'];

        // Cálculos
        $valorVacaciones           = round(($diffDias / 360) * 15 * ($baseVacaciones / 30), 2);
        $valorCesantias            = round(($baseCesantias * $diffDias) / 360, 2);
        $valorInteresesCesantias   = round($valorCesantias * 0.12 * ($diffDias / 360), 2);
        $valorPrima                = round(($basePrimas * $diffDias) / 360, 2);

        // Indemnización solo aplica para despido sin justa causa
        $valorIndemnizacion = 0;
        if ($body['motivo_retiro'] === 'despido_sin_justa') {
            // Indemnización básica: 30 días × (años trabajados hasta 10) + 20 días × año adicional
            $aniosTrabajados    = $diffDias / 365;
            $aniosBase          = min($aniosTrabajados, 10);
            $aniosExtra         = max(0, $aniosTrabajados - 10);
            $valorIndemnizacion = round(
                ($salarioDiario * 30 * $aniosBase) + ($salarioDiario * 20 * $aniosExtra),
                2
            );
        }

        $totalLiquidacion = $valorVacaciones + $valorCesantias +
                            $valorInteresesCesantias + $valorPrima + $valorIndemnizacion;

        $data = [
            'empleado_id'               => (int)$body['empleado_id'],
            'fecha_terminacion'         => $body['fecha_terminacion'],
            'motivo_retiro'             => $body['motivo_retiro'],
            'base_vacaciones'           => $baseVacaciones,
            'base_cesantias'            => $baseCesantias,
            'base_primas'               => $basePrimas,
            'valor_vacaciones'          => $valorVacaciones,
            'valor_cesantias'           => $valorCesantias,
            'valor_intereses_cesantias' => $valorInteresesCesantias,
            'valor_prima'               => $valorPrima,
            'valor_indemnizacion'       => $valorIndemnizacion,
            'total_liquidacion'         => $totalLiquidacion,
        ];

        $id          = LiquidacionContrato::create($data);
        $liquidacion = LiquidacionContrato::findById($id);

        http_response_code(201);
        self::ok($liquidacion, 'Liquidación calculada');
    }

    public static function getDetalle(array $params): void
    {
        $liquidacion = LiquidacionContrato::findById((int)$params['id']);
        if (!$liquidacion) {
            self::error(404, 'Liquidación no encontrada');
        }
        self::ok($liquidacion);
    }

    public static function aprobar(array $params): void
    {
        $id          = (int)$params['id'];
        $liquidacion = LiquidacionContrato::findById($id);

        if (!$liquidacion) {
            self::error(404, 'Liquidación no encontrada');
        }
        if ($liquidacion['estado'] === 'aprobado') {
            self::error(409, 'La liquidación ya fue aprobada');
        }

        $userId = (int)JwtMiddleware::$user['userId'];
        LiquidacionContrato::aprobar($id, $userId);

        self::ok(LiquidacionContrato::findById($id), 'Liquidación aprobada');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

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
