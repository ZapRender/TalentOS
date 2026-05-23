<?php

/**
 * Genera el archivo plano PILA según Resolución 2388 de 2016.
 *
 * Estructura simplificada:
 *   Registro Tipo 1 — Datos del operador / empleador
 *   Registro Tipo 2 — Datos de cada empleado (IBC, aportes)
 */
class PILAGenerator
{
    // Porcentajes de aporte (empleador + empleado)
    private const SALUD_EMPLEADOR   = 0.085;  // 8.5%
    private const SALUD_EMPLEADO    = 0.04;   // 4%
    private const PENSION_EMPLEADOR = 0.12;   // 12%
    private const PENSION_EMPLEADO  = 0.04;   // 4%
    private const ARL_CLASE_I       = 0.00522; // Riesgo I

    public static function generar(array $empleados, int $anio, int $mes): string
    {
        $lines   = [];
        $totalAportes = 0;

        // ── Tipo 1: Encabezado planilla ───────────────────────────────────────
        $lines[] = self::tipo1($anio, $mes, count($empleados));

        // ── Tipo 2: Un registro por empleado ─────────────────────────────────
        foreach ($empleados as $emp) {
            $salario = (float)($emp['salario'] ?? 0);
            $ibc     = max($salario, 1_423_500); // Mínimo 1 SMMLV

            $saludAporte   = round($ibc * (self::SALUD_EMPLEADOR   + self::SALUD_EMPLEADO),   0);
            $pensionAporte = round($ibc * (self::PENSION_EMPLEADOR  + self::PENSION_EMPLEADO), 0);
            $arlAporte     = round($ibc * self::ARL_CLASE_I, 0);
            $totalEmp      = $saludAporte + $pensionAporte + $arlAporte;
            $totalAportes += $totalEmp;

            $lines[] = self::tipo2($emp, $ibc, $saludAporte, $pensionAporte, $arlAporte, $anio, $mes);
        }

        // ── Tipo 9: Totalizador ───────────────────────────────────────────────
        $lines[] = self::tipo9(count($empleados), $totalAportes);

        return implode("\r\n", $lines);
    }

    // ── Registros ─────────────────────────────────────────────────────────────

    private static function tipo1(int $anio, int $mes, int $numEmpleados): string
    {
        return implode(';', [
            '01',                             // Tipo registro
            '1',                              // Tipo planilla: 1=E (empleado)
            date('Ymd'),                      // Fecha generación
            str_pad($anio, 4, '0', STR_PAD_LEFT) . str_pad($mes, 2, '0', STR_PAD_LEFT), // Período
            'EMPRESA TALENTOS SAS',           // Razón social
            '900000001',                      // NIT (placeholder)
            '0',                              // Dígito verificación
            str_pad((string)$numEmpleados, 6, '0', STR_PAD_LEFT), // Número empleados
        ]);
    }

    private static function tipo2(
        array $emp,
        float $ibc,
        float $saludAporte,
        float $pensionAporte,
        float $arlAporte,
        int   $anio,
        int   $mes
    ): string {
        $cedula   = str_pad((string)($emp['cedula'] ?? $emp['id']), 10, '0', STR_PAD_LEFT);
        $nombre   = self::pad(strtoupper(($emp['apellidos'] ?? '') . ' ' . ($emp['nombre'] ?? '')), 60);
        $diasCot  = str_pad('30', 2, '0', STR_PAD_LEFT);
        $ibcFmt   = str_pad((string)(int)$ibc, 12, '0', STR_PAD_LEFT);
        $saludFmt = str_pad((string)(int)$saludAporte,   12, '0', STR_PAD_LEFT);
        $pensFmt  = str_pad((string)(int)$pensionAporte, 12, '0', STR_PAD_LEFT);
        $arlFmt   = str_pad((string)(int)$arlAporte,     12, '0', STR_PAD_LEFT);

        return implode(';', [
            '02',         // Tipo registro
            '1',          // Tipo documento: 1=CC
            $cedula,
            $nombre,
            $diasCot,     // Días cotizados
            $ibcFmt,      // IBC
            $saludFmt,    // Aporte salud
            $pensFmt,     // Aporte pensión
            $arlFmt,      // Aporte ARL
        ]);
    }

    private static function tipo9(int $numEmpleados, float $totalAportes): string
    {
        return implode(';', [
            '09',
            str_pad((string)$numEmpleados, 6, '0', STR_PAD_LEFT),
            str_pad((string)(int)$totalAportes, 14, '0', STR_PAD_LEFT),
        ]);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static function pad(string $value, int $length): string
    {
        return str_pad(substr($value, 0, $length), $length);
    }
}
