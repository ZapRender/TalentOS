<?php

require_once __DIR__ . '/../config/Database.php';

class ConceptoLiquidado
{
    public static function findByLiquidacion(int $liquidacionId): array
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT * FROM conceptos_liquidados WHERE liquidacion_id = ? ORDER BY codigo_concepto'
        );
        $stmt->execute([$liquidacionId]);
        return $stmt->fetchAll();
    }

    public static function deleteByLiquidacion(int $liquidacionId): void
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare('DELETE FROM conceptos_liquidados WHERE liquidacion_id = ?');
        $stmt->execute([$liquidacionId]);
    }

    public static function createMany(int $liquidacionId, array $conceptos): void
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'INSERT INTO conceptos_liquidados
             (liquidacion_id, codigo_concepto, descripcion, cantidad, valor_devengado, valor_deducido)
             VALUES (?, ?, ?, ?, ?, ?)'
        );

        foreach ($conceptos as $c) {
            $stmt->execute([
                $liquidacionId,
                $c['codigo'],
                $c['descripcion'],
                $c['cantidad']       ?? 0,
                $c['valor_devengado'] ?? 0,
                $c['valor_deducido']  ?? 0,
            ]);
        }
    }
}
