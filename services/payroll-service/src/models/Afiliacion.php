<?php

require_once __DIR__ . '/../config/Database.php';

class Afiliacion
{
    public static function findByEmpleado(int $empleadoId): array
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'SELECT * FROM afiliaciones WHERE empleado_id = ? ORDER BY tipo_entidad, fecha_afiliacion DESC'
        );
        $stmt->execute([$empleadoId]);
        return $stmt->fetchAll();
    }

    public static function findById(int $id): array|false
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM afiliaciones WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public static function create(array $data): int
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'INSERT INTO afiliaciones
             (empleado_id, tipo_entidad, nombre_entidad, numero_afiliacion,
              centro_trabajo, fecha_afiliacion, estado, comprobante_path, region)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['empleado_id'],
            $data['tipo_entidad'],
            $data['nombre_entidad'],
            $data['numero_afiliacion'] ?? null,
            $data['centro_trabajo']    ?? null,
            $data['fecha_afiliacion'],
            'activo',
            $data['comprobante_path']  ?? null,
            $data['region']            ?? null,
        ]);
        return (int)$db->lastInsertId();
    }

    public static function retirar(int $id, string $fechaDesafiliacion): void
    {
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            'UPDATE afiliaciones
             SET estado = "retirado", fecha_desafiliacion = ?
             WHERE id = ?'
        );
        $stmt->execute([$fechaDesafiliacion, $id]);
    }
}
