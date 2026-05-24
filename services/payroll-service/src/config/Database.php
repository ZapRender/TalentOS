<?php

require_once __DIR__ . '/Env.php';

class Database
{
    private static ?PDO $instance = null;

    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
                Env::get('PAYROLL_DB_HOST', 'payroll-db'),
                Env::get('PAYROLL_DB_PORT', '3306'),
                Env::get('PAYROLL_DB_NAME', 'talentos_payroll')
            );

            self::$instance = new PDO(
                $dsn,
                Env::get('PAYROLL_DB_USER', 'payroll_user'),
                Env::get('PAYROLL_DB_PASSWORD', ''),
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]
            );
        }

        return self::$instance;
    }

    private function __construct() {}
    private function __clone()    {}
}
