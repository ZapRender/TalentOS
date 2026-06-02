<?php

/** @var Router $router */

$jwt = [JwtMiddleware::handle()];

$router->post('/payroll/afiliaciones',                fn($p) => AfiliacionController::registrar($p),        $jwt);
$router->get('/payroll/afiliaciones/:empleadoId',     fn($p) => AfiliacionController::listarPorEmpleado($p),$jwt);
$router->put('/payroll/afiliaciones/:id/retirar',     fn($p) => AfiliacionController::retirar($p),          $jwt);
