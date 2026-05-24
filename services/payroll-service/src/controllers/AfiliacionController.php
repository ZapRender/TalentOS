<?php

require_once __DIR__ . '/../models/Afiliacion.php';

class AfiliacionController
{
    public static function registrar(array $params): void
    {
        $body     = self::body();
        $required = ['empleado_id', 'tipo_entidad', 'nombre_entidad', 'fecha_afiliacion'];

        foreach ($required as $field) {
            if (empty($body[$field])) {
                self::error(400, "El campo '{$field}' es requerido");
            }
        }

        $tiposValidos = ['arl', 'eps', 'caja_compensacion', 'pension'];
        if (!in_array($body['tipo_entidad'], $tiposValidos, true)) {
            self::error(400, 'tipo_entidad debe ser: arl, eps, caja_compensacion o pension');
        }

        $id         = Afiliacion::create($body);
        $afiliacion = Afiliacion::findById($id);

        http_response_code(201);
        self::ok($afiliacion, 'Afiliación registrada');
    }

    public static function listarPorEmpleado(array $params): void
    {
        $empleadoId  = (int)$params['empleadoId'];
        $afiliaciones = Afiliacion::findByEmpleado($empleadoId);
        self::ok($afiliaciones);
    }

    public static function retirar(array $params): void
    {
        $id         = (int)$params['id'];
        $afiliacion = Afiliacion::findById($id);

        if (!$afiliacion) {
            self::error(404, 'Afiliación no encontrada');
        }
        if ($afiliacion['estado'] === 'retirado') {
            self::error(409, 'La afiliación ya fue retirada');
        }

        $body               = self::body();
        $fechaDesafiliacion = $body['fecha_desafiliacion'] ?? date('Y-m-d');

        Afiliacion::retirar($id, $fechaDesafiliacion);
        self::ok(Afiliacion::findById($id), 'Afiliación retirada');
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
