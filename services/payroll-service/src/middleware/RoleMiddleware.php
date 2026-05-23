<?php

require_once __DIR__ . '/JwtMiddleware.php';

class RoleMiddleware
{
    /**
     * Returns a closure that checks the authenticated user's role.
     * JwtMiddleware::handle() must run before this one.
     *
     * Usage: RoleMiddleware::require('GERENTE', 'ADMIN_RRHH')
     */
    public static function require(string ...$roles): callable
    {
        return function () use ($roles): void {
            $userRole = JwtMiddleware::$user['rol'] ?? '';

            if (!in_array($userRole, $roles, true)) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'error'   => 'Sin permisos suficientes',
                    'code'    => 403,
                ]);
                exit;
            }
        };
    }
}
