<?php

require_once __DIR__ . '/../config/Database.php';

class PeriodoNomina
{
    public static function findAll(): array
    {
        $db   = Database::getInstance();
        $stmt = $db->query('SELECT * FROM periodos_nomina ORDER BY anio DESC, mes DESC, quincena DESC');
        return $stmt->fetchAll();
    }

    public static function findById(int $id): array|false
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM periodos_nomina WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public static function create(array $data): int
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'INSERT INTO periodos_nomina
             (anio, mes, quincena, fecha_inicial, fecha_final, fecha_pago, estado)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['anio'],
            $data['mes'],
            $data['quincena'],
            $data['fecha_inicial'],
            $data['fecha_final'],
            $data['fecha_pago'],
            $data['estado'] ?? 'abierto',
        ]);
        return (int)$db->lastInsertId();
    }

    public static function updateEstado(int $id, string $estado): void
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare('UPDATE periodos_nomina SET estado = ? WHERE id = ?');
        $stmt->execute([$estado, $id]);
    }

    public static function updateEstadoYTotal(int $id, string $estado, float $totalNeto): void
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'UPDATE periodos_nomina SET estado = ?, total_neto = ? WHERE id = ?'
        );
        $stmt->execute([$estado, $totalNeto, $id]);
    }

    public static function aprobar(int $id, int $aprobadoPor): void
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'UPDATE periodos_nomina SET estado = ?, aprobado_por = ? WHERE id = ?'
        );
        $stmt->execute(['aprobado', $aprobadoPor, $id]);
    }
}
