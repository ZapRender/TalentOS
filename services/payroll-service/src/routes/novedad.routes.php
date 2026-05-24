<?php

/** @var Router $router */

$jwt = [JwtMiddleware::handle()];

$router->get('/payroll/novedades/:periodoId', fn($p) => NovedadController::listar($p),    $jwt);
$router->post('/payroll/novedades',           fn($p) => NovedadController::crear($p),     $jwt);
$router->put('/payroll/novedades/:id',        fn($p) => NovedadController::actualizar($p),$jwt);
$router->delete('/payroll/novedades/:id',     fn($p) => NovedadController::eliminar($p),  $jwt);
