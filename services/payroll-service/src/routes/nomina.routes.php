<?php

/** @var Router $router */

$jwt     = [JwtMiddleware::handle()];
$gerente = [JwtMiddleware::handle(), RoleMiddleware::require('GERENTE', 'ADMIN_RRHH')];

// ── Períodos ──────────────────────────────────────────────────────────────────
$router->get('/payroll/periodos',              fn($p) => NominaController::listarPeriodos($p), $jwt);
$router->get('/payroll/periodos/:id',          fn($p) => NominaController::getPeriodo($p),     $jwt);
$router->post('/payroll/periodos',             fn($p) => NominaController::crearPeriodo($p),   $jwt);
$router->post('/payroll/periodos/:id/liquidar',fn($p) => NominaController::liquidar($p),       $jwt);
$router->post('/payroll/periodos/:id/aprobar', fn($p) => NominaController::aprobar($p),        $gerente);
$router->post('/payroll/periodos/:id/enviar-desp', fn($p) => NominaController::enviarDesprendibles($p), $jwt);

// ── Reportes ──────────────────────────────────────────────────────────────────
$router->get('/payroll/nomina/:periodoId/excel',
    fn($p) => NominaController::exportarExcel($p), $jwt);

$router->get('/payroll/nomina/:periodoId/desprendible/:empleadoId',
    fn($p) => NominaController::desprendible($p), $jwt);
