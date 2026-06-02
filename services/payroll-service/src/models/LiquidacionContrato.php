<?php

require_once __DIR__ . '/../config/Database.php';

class LiquidacionContrato
{
    public static function findById(int $id): array|false
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM liquidaciones_contrato WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public static function create(array $data): int
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'INSERT INTO liquidaciones_contrato
             (empleado_id, fecha_terminacion, motivo_retiro,
              base_vacaciones, base_cesantias, base_primas,
              valor_vacaciones, valor_cesantias, valor_intereses_cesantias,
              valor_prima, valor_indemnizacion, total_liquidacion, estado)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['empleado_id'],
            $data['fecha_terminacion'],
            $data['motivo_retiro'],
            $data['base_vacaciones'],
            $data['base_cesantias'],
            $data['base_primas'],
            $data['valor_vacaciones'],
            $data['valor_cesantias'],
            $data['valor_intereses_cesantias'],
            $data['valor_prima'],
            $data['valor_indemnizacion'] ?? 0,
            $data['total_liquidacion'],
            'borrador',
        ]);
        return (int)$db->lastInsertId();
    }

    public static function aprobar(int $id, int $aprobadoPor): void
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'UPDATE liquidaciones_contrato
             SET estado = "aprobado", aprobado_por = ?, fecha_aprobacion = CURDATE()
             WHERE id = ?'
        );
        $stmt->execute([$aprobadoPor, $id]);
    }
}
