<?php

/** @var Router $router */

$jwt = [JwtMiddleware::handle()];

$router->get('/payroll/pila',                   fn($p) => PILAController::listar($p),          $jwt);
$router->post('/payroll/pila/generar',          fn($p) => PILAController::generar($p),          $jwt);
$router->get('/payroll/pila/:mes/archivo-plano',fn($p) => PILAController::descargarArchivo($p), $jwt);
