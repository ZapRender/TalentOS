<?php

require_once __DIR__ . '/../config/Database.php';

class LiquidacionNomina
{
    public static function findByPeriodo(int $periodoId): array
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT * FROM liquidaciones_nomina WHERE periodo_id = ? ORDER BY empleado_id ASC'
        );
        $stmt->execute([$periodoId]);
        return $stmt->fetchAll();
    }

    public static function findByEmpleadoYPeriodo(int $empleadoId, int $periodoId): array|false
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT * FROM liquidaciones_nomina WHERE empleado_id = ? AND periodo_id = ?'
        );
        $stmt->execute([$empleadoId, $periodoId]);
        return $stmt->fetch();
    }

    public static function upsert(
        int   $empleadoId,
        int   $periodoId,
        float $totalDevengado,
        float $totalDeducido,
        float $netoPagar,
        int   $diasTrabajados
    ): int {
        $db = Database::getInstance();

        $existing = self::findByEmpleadoYPeriodo($empleadoId, $periodoId);

        if ($existing) {
            $stmt = $db->prepare(
                'UPDATE liquidaciones_nomina
                 SET total_devengado = ?, total_deducido = ?, neto_pagar = ?,
                     dias_trabajados = ?, estado = "generado"
                 WHERE empleado_id = ? AND periodo_id = ?'
            );
            $stmt->execute([
                $totalDevengado, $totalDeducido, $netoPagar,
                $diasTrabajados, $empleadoId, $periodoId,
            ]);
            return (int)$existing['id'];
        }

        $stmt = $db->prepare(
            'INSERT INTO liquidaciones_nomina
             (empleado_id, periodo_id, total_devengado, total_deducido, neto_pagar, dias_trabajados)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $empleadoId, $periodoId,
            $totalDevengado, $totalDeducido, $netoPagar, $diasTrabajados,
        ]);
        return (int)$db->lastInsertId();
    }
}
