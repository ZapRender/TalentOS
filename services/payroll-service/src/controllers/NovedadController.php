<?php

require_once __DIR__ . '/../models/Novedad.php';
require_once __DIR__ . '/../models/PeriodoNomina.php';
require_once __DIR__ . '/../middleware/JwtMiddleware.php';

class NovedadController
{
    public static function listar(array $params): void
    {
        $periodoId = (int)$params['periodoId'];

        $periodo = PeriodoNomina::findById($periodoId);
        if (!$periodo) {
            self::error(404, 'Período no encontrado');
        }

        $novedades = Novedad::findByPeriodo($periodoId);
        self::ok($novedades);
    }

    public static function crear(array $params): void
    {
        $body     = self::body();
        $required = ['empleado_id', 'periodo_id', 'tipo_novedad', 'concepto_codigo',
                     'concepto_descripcion', 'valor', 'fecha_novedad'];

        foreach ($required as $field) {
            if (!isset($body[$field]) || $body[$field] === '') {
                self::error(400, "El campo '{$field}' es requerido");
            }
        }

        $tiposValidos = ['unica', 'periodica', 'liquidacion'];
        if (!in_array($body['tipo_novedad'], $tiposValidos, true)) {
            self::error(400, 'tipo_novedad debe ser: unica, periodica o liquidacion');
        }

        $body['registrado_por'] = (int)JwtMiddleware::$user['userId'];
        $body['es_deduccion']   = !empty($body['es_deduccion']);

        $id      = Novedad::create($body);
        $novedad = Novedad::findById($id);

        http_response_code(201);
        self::ok($novedad, 'Novedad registrada');
    }

    public static function actualizar(array $params): void
    {
        $id      = (int)$params['id'];
        $novedad = Novedad::findById($id);

        if (!$novedad) {
            self::error(404, 'Novedad no encontrada');
        }

        $body     = self::body();
        $required = ['tipo_novedad', 'concepto_codigo', 'concepto_descripcion', 'valor', 'fecha_novedad'];
        foreach ($required as $field) {
            if (!isset($body[$field]) || $body[$field] === '') {
                self::error(400, "El campo '{$field}' es requerido");
            }
        }

        $body['es_deduccion'] = !empty($body['es_deduccion']);
        Novedad::update($id, $body);

        self::ok(Novedad::findById($id), 'Novedad actualizada');
    }

    public static function eliminar(array $params): void
    {
        $id      = (int)$params['id'];
        $novedad = Novedad::findById($id);

        if (!$novedad) {
            self::error(404, 'Novedad no encontrada');
        }

        Novedad::delete($id);
        self::ok(null, 'Novedad eliminada');
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
