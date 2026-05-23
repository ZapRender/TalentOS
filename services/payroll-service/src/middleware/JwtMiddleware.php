<?php

require_once __DIR__ . '/../config/Env.php';

class JwtMiddleware
{
    /** Decoded JWT payload — available to controllers after handle() runs */
    public static array $user = [];

    // ── Public callable ───────────────────────────────────────────────────────

    /** Returns a closure ready to be passed as middleware. */
    public static function handle(): callable
    {
        return function (): void {
            $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

            if (!str_starts_with($header, 'Bearer ')) {
                self::abort(401, 'Token requerido');
            }

            $token   = substr($header, 7);
            $payload = self::validate($token);

            if ($payload === null) {
                self::abort(401, 'Token inválido o expirado');
            }

            self::$user = $payload;
        };
    }

    // ── JWT validation (pure PHP — no library) ────────────────────────────────

    private static function validate(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$headerB64, $payloadB64, $signatureB64] = $parts;

        // Verify HMAC-SHA256 signature
        $secret   = Env::get('JWT_SECRET');
        $expected = self::base64url_encode(
            hash_hmac('sha256', "$headerB64.$payloadB64", $secret, true)
        );

        if (!hash_equals($expected, $signatureB64)) {
            return null;
        }

        // Decode payload
        $payload = json_decode(self::base64url_decode($payloadB64), true);
        if (!is_array($payload)) {
            return null;
        }

        // Check expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static function base64url_decode(string $input): string
    {
        $remainder = strlen($input) % 4;
        if ($remainder) {
            $input .= str_repeat('=', 4 - $remainder);
        }

        return base64_decode(strtr($input, '-_', '+/'));
    }

    private static function base64url_encode(string $input): string
    {
        return rtrim(strtr(base64_encode($input), '+/', '-_'), '=');
    }

    private static function abort(int $code, string $message): never
    {
        http_response_code($code);
        echo json_encode(['success' => false, 'error' => $message, 'code' => $code]);
        exit;
    }
}
