<?php

/** @var Router $router */

$jwt      = [JwtMiddleware::handle()];
$contador = [JwtMiddleware::handle(), RoleMiddleware::require('CONTADOR', 'ADMIN_RRHH')];

$router->post('/payroll/liquidacion-contrato',              fn($p) => LiquidacionController::calcular($p),  $jwt);
$router->get('/payroll/liquidacion-contrato/:id',           fn($p) => LiquidacionController::getDetalle($p),$jwt);
$router->post('/payroll/liquidacion-contrato/:id/aprobar',  fn($p) => LiquidacionController::aprobar($p),   $contador);
