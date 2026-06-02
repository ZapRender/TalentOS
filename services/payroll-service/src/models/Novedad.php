<?php

require_once __DIR__ . '/../config/Database.php';

class Novedad
{
    public static function findByPeriodo(int $periodoId): array
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT * FROM novedades WHERE periodo_id = ? ORDER BY empleado_id, fecha_novedad'
        );
        $stmt->execute([$periodoId]);
        return $stmt->fetchAll();
    }

    public static function findByEmpleadoYPeriodo(int $empleadoId, int $periodoId): array
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT * FROM novedades WHERE empleado_id = ? AND periodo_id = ?'
        );
        $stmt->execute([$empleadoId, $periodoId]);
        return $stmt->fetchAll();
    }

    public static function findById(int $id): array|false
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM novedades WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public static function create(array $data): int
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'INSERT INTO novedades
             (empleado_id, periodo_id, tipo_novedad, concepto_codigo, concepto_descripcion,
              cantidad, valor, es_deduccion, fecha_novedad, registrado_por)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['empleado_id'],
            $data['periodo_id'],
            $data['tipo_novedad'],
            $data['concepto_codigo'],
            $data['concepto_descripcion'],
            $data['cantidad']     ?? 1,
            $data['valor'],
            $data['es_deduccion'] ? 1 : 0,
            $data['fecha_novedad'],
            $data['registrado_por'],
        ]);
        return (int)$db->lastInsertId();
    }

    public static function update(int $id, array $data): void
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'UPDATE novedades
             SET tipo_novedad = ?, concepto_codigo = ?, concepto_descripcion = ?,
                 cantidad = ?, valor = ?, es_deduccion = ?, fecha_novedad = ?
             WHERE id = ?'
        );
        $stmt->execute([
            $data['tipo_novedad'],
            $data['concepto_codigo'],
            $data['concepto_descripcion'],
            $data['cantidad']     ?? 1,
            $data['valor'],
            $data['es_deduccion'] ? 1 : 0,
            $data['fecha_novedad'],
            $id,
        ]);
    }

    public static function delete(int $id): void
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare('DELETE FROM novedades WHERE id = ?');
        $stmt->execute([$id]);
    }
}
