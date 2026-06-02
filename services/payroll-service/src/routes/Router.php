<?php

class Router
{
    private array $routes = [];

    // ── Registration ──────────────────────────────────────────────────────────

    public function get(string $path, callable $handler, array $middleware = []): void
    {
        $this->add('GET', $path, $handler, $middleware);
    }

    public function post(string $path, callable $handler, array $middleware = []): void
    {
        $this->add('POST', $path, $handler, $middleware);
    }

    public function put(string $path, callable $handler, array $middleware = []): void
    {
        $this->add('PUT', $path, $handler, $middleware);
    }

    public function delete(string $path, callable $handler, array $middleware = []): void
    {
        $this->add('DELETE', $path, $handler, $middleware);
    }

    private function add(string $method, string $path, callable $handler, array $middleware): void
    {
        // :param  →  named capture group
        $pattern = '#^' . preg_replace('/:([a-zA-Z_]+)/', '(?P<$1>[^/]+)', $path) . '$#';

        $this->routes[] = [
            'method'     => $method,
            'pattern'    => $pattern,
            'handler'    => $handler,
            'middleware' => $middleware,
        ];
    }

    // ── Dispatch ──────────────────────────────────────────────────────────────

    public function dispatch(): void
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            if (!preg_match($route['pattern'], $uri, $matches)) {
                continue;
            }

            // Named path params only
            $params = array_filter($matches, fn($k) => is_string($k), ARRAY_FILTER_USE_KEY);

            // Run middleware — each one exits on failure
            foreach ($route['middleware'] as $mw) {
                $mw();
            }

            // Call handler
            ($route['handler'])($params);
            return;
        }

        // No route matched
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Ruta no encontrada', 'code' => 404]);
    }
}
