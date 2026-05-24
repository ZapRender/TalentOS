<?php

require_once __DIR__ . '/../config/Database.php';

class PlanillaPILA
{
    public static function findAll(): array
    {
        $db   = Database::getInstance();
        $stmt = $db->query(
            'SELECT * FROM planillas_pila ORDER BY anio DESC, mes DESC'
        );
        return $stmt->fetchAll();
    }

    public static function findByMes(int $anio, int $mes): array|false
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT * FROM planillas_pila WHERE anio = ? AND mes = ?'
        );
        $stmt->execute([$anio, $mes]);
        return $stmt->fetch();
    }

    public static function findById(int $id): array|false
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM planillas_pila WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public static function create(array $data): int
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'INSERT INTO planillas_pila
             (anio, mes, fecha_limite_pago, total_empleados, total_aportes,
              archivo_plano_path, estado, notificado_a)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['anio'],
            $data['mes'],
            $data['fecha_limite_pago'],
            $data['total_empleados'],
            $data['total_aportes'],
            $data['archivo_plano_path'] ?? null,
            'generado',
            $data['notificado_a']       ?? null,
        ]);
        return (int)$db->lastInsertId();
    }

    public static function updateArchivo(int $id, string $path): void
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'UPDATE planillas_pila SET archivo_plano_path = ? WHERE id = ?'
        );
        $stmt->execute([$path, $id]);
    }
}
