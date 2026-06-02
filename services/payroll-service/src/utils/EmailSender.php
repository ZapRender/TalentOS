<?php

require_once __DIR__ . '/../config/Env.php';

/**
 * SMTP mailer — pure PHP, no library.
 * Uses fsockopen() for SMTP communication.
 */
class EmailSender
{
    public static function sendDesprendible(
        string $toEmail,
        string $toName,
        string $htmlContent,
        string $periodoLabel
    ): bool {
        $subject = "Desprendible de Pago — {$periodoLabel}";
        $body    = $htmlContent;

        return self::send($toEmail, $toName, $subject, $body);
    }

    // ── Core SMTP sender ──────────────────────────────────────────────────────

    private static function send(
        string $toEmail,
        string $toName,
        string $subject,
        string $htmlBody
    ): bool {
        $host    = Env::get('SMTP_HOST',  'smtp.gmail.com');
        $port    = (int)Env::get('SMTP_PORT', '587');
        $user    = Env::get('SMTP_USER',  '');
        $pass    = Env::get('SMTP_PASS',  '');
        $from    = Env::get('SMTP_FROM',  'TalentOS <noreply@talentos.com>');
        $timeout = 15;

        $smtp = @fsockopen($host, $port, $errno, $errstr, $timeout);
        if (!$smtp) {
            error_log("[EmailSender] No se pudo conectar a {$host}:{$port} — {$errstr}");
            return false;
        }

        try {
            self::expect($smtp, '220');
            self::cmd($smtp, "EHLO talentos.local");
            self::expect($smtp, '250');

            // STARTTLS
            self::cmd($smtp, "STARTTLS");
            self::expect($smtp, '220');
            stream_socket_enable_crypto($smtp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);

            self::cmd($smtp, "EHLO talentos.local");
            self::expect($smtp, '250');

            // Auth
            self::cmd($smtp, "AUTH LOGIN");
            self::expect($smtp, '334');
            self::cmd($smtp, base64_encode($user));
            self::expect($smtp, '334');
            self::cmd($smtp, base64_encode($pass));
            self::expect($smtp, '235');

            // Envelope
            preg_match('/<(.+)>/', $from, $m);
            $fromEmail = $m[1] ?? $user;
            self::cmd($smtp, "MAIL FROM:<{$fromEmail}>");
            self::expect($smtp, '250');
            self::cmd($smtp, "RCPT TO:<{$toEmail}>");
            self::expect($smtp, '250');
            self::cmd($smtp, "DATA");
            self::expect($smtp, '354');

            // Message
            $boundary = md5(uniqid());
            $date     = date('r');
            $message  = implode("\r\n", [
                "From: {$from}",
                "To: {$toName} <{$toEmail}>",
                "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=",
                "Date: {$date}",
                "MIME-Version: 1.0",
                "Content-Type: text/html; charset=UTF-8",
                "Content-Transfer-Encoding: base64",
                "",
                chunk_split(base64_encode($htmlBody)),
                ".",
            ]);

            fwrite($smtp, $message . "\r\n");
            self::expect($smtp, '250');

            self::cmd($smtp, "QUIT");
            fclose($smtp);
            return true;

        } catch (\RuntimeException $e) {
            error_log("[EmailSender] Error SMTP: " . $e->getMessage());
            fclose($smtp);
            return false;
        }
    }

    private static function cmd($smtp, string $cmd): void
    {
        fwrite($smtp, $cmd . "\r\n");
    }

    private static function expect($smtp, string $code): void
    {
        $response = fgets($smtp, 512);
        if (!str_starts_with(trim($response), $code)) {
            throw new \RuntimeException("SMTP esperaba {$code}, recibió: {$response}");
        }
    }
}
