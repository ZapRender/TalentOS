<?php

/**
 * Generates HTML payslips served as printable pages.
 * No external library required — the browser prints to PDF.
 */
class PDFGenerator
{
    public static function desprendible(array $liquidacion, array $conceptos, array $empleado, array $periodo): string
    {
        $nombre       = htmlspecialchars(($empleado['nombre'] ?? '') . ' ' . ($empleado['apellidos'] ?? ''));
        $cargo        = htmlspecialchars($empleado['cargo'] ?? '');
        $cedula       = htmlspecialchars($empleado['cedula'] ?? $empleado['id']);
        $periodoLabel = "Quincena {$periodo['quincena']} — {$periodo['mes']}/{$periodo['anio']}";
        $devengado    = number_format($liquidacion['total_devengado'], 2, ',', '.');
        $deducido     = number_format($liquidacion['total_deducido'],  2, ',', '.');
        $neto         = number_format($liquidacion['neto_pagar'],      2, ',', '.');

        $rowsDev = '';
        $rowsDed = '';

        foreach ($conceptos as $c) {
            if ((float)$c['valor_devengado'] > 0) {
                $rowsDev .= sprintf(
                    '<tr><td>%s</td><td>%s</td><td class="right">$ %s</td></tr>',
                    htmlspecialchars($c['codigo_concepto']),
                    htmlspecialchars($c['descripcion']),
                    number_format((float)$c['valor_devengado'], 2, ',', '.')
                );
            }
            if ((float)$c['valor_deducido'] > 0) {
                $rowsDed .= sprintf(
                    '<tr><td>%s</td><td>%s</td><td class="right">$ %s</td></tr>',
                    htmlspecialchars($c['codigo_concepto']),
                    htmlspecialchars($c['descripcion']),
                    number_format((float)$c['valor_deducido'], 2, ',', '.')
                );
            }
        }

        $fechaGeneracion = date('d/m/Y H:i');

        return <<<HTML
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Desprendible de Pago — {$nombre}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; font-size: 12px; color: #333; padding: 24px; }
            h1  { font-size: 18px; margin-bottom: 4px; }
            h2  { font-size: 14px; color: #555; margin-bottom: 16px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .info p  { margin: 2px 0; }
            table  { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            th, td { border: 1px solid #ddd; padding: 5px 8px; }
            th     { background: #f5f5f5; text-align: left; }
            .right { text-align: right; }
            .totals td { font-weight: bold; background: #f9f9f9; }
            .neto  td { font-size: 14px; background: #e8f5e9; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>TalentOS</h1>
              <h2>Desprendible de Pago</h2>
            </div>
            <div class="info">
              <p><strong>Período:</strong> {$periodoLabel}</p>
              <p><strong>Empleado:</strong> {$nombre}</p>
              <p><strong>Cédula:</strong> {$cedula}</p>
              <p><strong>Cargo:</strong> {$cargo}</p>
            </div>
          </div>

          <table>
            <thead><tr><th>Código</th><th>Concepto</th><th>Devengado</th></tr></thead>
            <tbody>{$rowsDev}</tbody>
            <tfoot class="totals">
              <tr><td colspan="2">Total Devengado</td><td class="right">$ {$devengado}</td></tr>
            </tfoot>
          </table>

          <table>
            <thead><tr><th>Código</th><th>Deducción</th><th>Valor</th></tr></thead>
            <tbody>{$rowsDed}</tbody>
            <tfoot class="totals">
              <tr><td colspan="2">Total Deducciones</td><td class="right">$ {$deducido}</td></tr>
            </tfoot>
          </table>

          <table>
            <tbody class="neto">
              <tr><td colspan="2"><strong>NETO A PAGAR</strong></td><td class="right"><strong>$ {$neto}</strong></td></tr>
            </tbody>
          </table>

          <p style="margin-top:20px;font-size:10px;color:#999;">
            Generado el {$fechaGeneracion} por TalentOS Payroll Service
          </p>
          <button onclick="window.print()" style="margin-top:12px;padding:8px 16px;">Imprimir / Guardar PDF</button>
        </body>
        </html>
        HTML;
    }
}
