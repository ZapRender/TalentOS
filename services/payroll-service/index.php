<?php

declare(strict_types=1);

// ── Headers ───────────────────────────────────────────────────────────────────
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Autoload ──────────────────────────────────────────────────────────────────
require_once __DIR__ . '/src/config/Env.php';
require_once __DIR__ . '/src/config/Database.php';
require_once __DIR__ . '/src/routes/Router.php';
require_once __DIR__ . '/src/middleware/JwtMiddleware.php';
require_once __DIR__ . '/src/middleware/RoleMiddleware.php';

// Controllers
require_once __DIR__ . '/src/controllers/NominaController.php';
require_once __DIR__ . '/src/controllers/NovedadController.php';
require_once __DIR__ . '/src/controllers/AfiliacionController.php';
require_once __DIR__ . '/src/controllers/LiquidacionController.php';
require_once __DIR__ . '/src/controllers/PILAController.php';

// ── Error handler ─────────────────────────────────────────────────────────────
set_exception_handler(function (\Throwable $e): void {
    error_log('[payroll-service] ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error interno del servidor', 'code' => 500]);
});

// ── Router ────────────────────────────────────────────────────────────────────
$router = new Router();

// Health — público
$router->get('/payroll/health', function (array $params): void {
    echo json_encode([
        'success' => true,
        'data'    => ['status' => 'ok', 'service' => 'payroll-service'],
        'message' => 'OK',
    ]);
});

// Registrar rutas por módulo
require_once __DIR__ . '/src/routes/nomina.routes.php';
require_once __DIR__ . '/src/routes/novedad.routes.php';
require_once __DIR__ . '/src/routes/afiliacion.routes.php';
require_once __DIR__ . '/src/routes/liquidacion.routes.php';
require_once __DIR__ . '/src/routes/pila.routes.php';

// ── Dispatch ──────────────────────────────────────────────────────────────────
$router->dispatch();
