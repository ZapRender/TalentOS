<?php

/**
 * Generates an Excel-compatible XML spreadsheet (SpreadsheetML).
 * Opens natively in Excel and LibreOffice — no library required.
 */
class ExcelExporter
{
    public static function nominaPeriodo(array $liquidaciones, array $periodo): string
    {
        $periodoLabel = "Q{$periodo['quincena']}-{$periodo['mes']}-{$periodo['anio']}";

        $rows = '';
        foreach ($liquidaciones as $liq) {
            $rows .= self::row([
                $liq['empleado_id'],
                $liq['dias_trabajados'],
                number_format((float)$liq['total_devengado'], 2, '.', ''),
                number_format((float)$liq['total_deducido'],  2, '.', ''),
                number_format((float)$liq['neto_pagar'],      2, '.', ''),
                $liq['estado'],
            ]);
        }

        $totalNeto = array_sum(array_column($liquidaciones, 'neto_pagar'));

        $rows .= self::row([
            'TOTAL', '', '', '',
            number_format($totalNeto, 2, '.', ''),
            '',
        ], bold: true);

        return self::build(
            "Nómina {$periodoLabel}",
            ['ID Empleado', 'Días', 'Devengado', 'Deducciones', 'Neto', 'Estado'],
            $rows
        );
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private static function build(string $sheetName, array $headers, string $rows): string
    {
        $headerRow = self::row($headers, bold: true);

        return <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
        <?mso-application progid="Excel.Sheet"?>
        <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
                  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
          <Worksheet ss:Name="{$sheetName}">
            <Table>
              {$headerRow}
              {$rows}
            </Table>
          </Worksheet>
        </Workbook>
        XML;
    }

    private static function row(array $cells, bool $bold = false): string
    {
        $style = $bold ? ' ss:StyleID="bold"' : '';
        $cellsXml = '';
        foreach ($cells as $cell) {
            $type  = is_numeric($cell) ? 'Number' : 'String';
            $value = htmlspecialchars((string)$cell, ENT_XML1);
            $cellsXml .= "<Cell><Data ss:Type=\"{$type}\">{$value}</Data></Cell>";
        }
        return "<Row{$style}>{$cellsXml}</Row>";
    }
}
