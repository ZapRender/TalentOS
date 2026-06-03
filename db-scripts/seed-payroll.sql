-- ═══════════════════════════════════════════════════════════════
-- TalentOS — Seed Data — Payroll DB
-- Simula el sistema con 6 meses de uso
-- Ejecutar en: talentos-payroll-db (MySQL)
-- ═══════════════════════════════════════════════════════════════

-- ── AFILIACIONES ────────────────────────────────────────────────
INSERT INTO afiliaciones (empleado_id, tipo_entidad, nombre_entidad, numero_afiliacion, centro_trabajo, fecha_afiliacion, estado, region, creado_en) VALUES
  (1,  'arl',            'Colpatria',          'ARL-001-2024',  'Sede Principal', '2024-07-01', 'activo',  'Risaralda', NOW() - INTERVAL 6 MONTH),
  (1,  'eps',            'Sura',               'EPS-001-2024',  'Sede Principal', '2024-07-01', 'activo',  'Risaralda', NOW() - INTERVAL 6 MONTH),
  (1,  'caja_comp',      'Comfamiliar',        'CAJ-001-2024',  'Sede Principal', '2024-07-01', 'activo',  'Risaralda', NOW() - INTERVAL 6 MONTH),
  (1,  'pension',        'Porvenir',           'PEN-001-2024',  'Sede Principal', '2024-07-01', 'activo',  'Risaralda', NOW() - INTERVAL 6 MONTH),
  (2,  'arl',            'Colpatria',          'ARL-002-2024',  'Sede Principal', '2024-07-01', 'activo',  'Risaralda', NOW() - INTERVAL 6 MONTH),
  (2,  'eps',            'Nueva EPS',          'EPS-002-2024',  'Sede Principal', '2024-07-01', 'activo',  'Risaralda', NOW() - INTERVAL 6 MONTH),
  (2,  'caja_comp',      'Comfamiliar',        'CAJ-002-2024',  'Sede Principal', '2024-07-01', 'activo',  'Risaralda', NOW() - INTERVAL 6 MONTH),
  (2,  'pension',        'Protección',         'PEN-002-2024',  'Sede Principal', '2024-07-01', 'activo',  'Risaralda', NOW() - INTERVAL 6 MONTH),
  (3,  'arl',            'Colpatria',          'ARL-003-2024',  'Sede Principal', '2024-08-01', 'activo',  'Risaralda', NOW() - INTERVAL 5 MONTH),
  (3,  'eps',            'Compensar',          'EPS-003-2024',  'Sede Principal', '2024-08-01', 'activo',  'Risaralda', NOW() - INTERVAL 5 MONTH),
  (3,  'caja_comp',      'Cajasan',            'CAJ-003-2024',  'Sede Principal', '2024-08-01', 'activo',  'Santander', NOW() - INTERVAL 5 MONTH),
  (3,  'pension',        'Colfondos',          'PEN-003-2024',  'Sede Principal', '2024-08-01', 'activo',  'Santander', NOW() - INTERVAL 5 MONTH),
  (4,  'arl',            'Colpatria',          'ARL-004-2024',  'Sede Principal', '2024-08-01', 'activo',  'Risaralda', NOW() - INTERVAL 5 MONTH),
  (4,  'eps',            'Sura',               'EPS-004-2024',  'Sede Principal', '2024-08-01', 'activo',  'Risaralda', NOW() - INTERVAL 5 MONTH),
  (4,  'caja_comp',      'Comfamiliar',        'CAJ-004-2024',  'Sede Principal', '2024-08-01', 'activo',  'Risaralda', NOW() - INTERVAL 5 MONTH),
  (4,  'pension',        'Porvenir',           'PEN-004-2024',  'Sede Principal', '2024-08-01', 'activo',  'Risaralda', NOW() - INTERVAL 5 MONTH),
  (5,  'arl',            'Colpatria',          'ARL-005-2024',  'Sede Principal', '2024-09-01', 'activo',  'Risaralda', NOW() - INTERVAL 4 MONTH),
  (5,  'eps',            'Famisanar',          'EPS-005-2024',  'Sede Principal', '2024-09-01', 'activo',  'Risaralda', NOW() - INTERVAL 4 MONTH),
  (5,  'caja_comp',      'Comfamiliar',        'CAJ-005-2024',  'Sede Principal', '2024-09-01', 'activo',  'Risaralda', NOW() - INTERVAL 4 MONTH),
  (5,  'pension',        'Protección',         'PEN-005-2024',  'Sede Principal', '2024-09-01', 'activo',  'Risaralda', NOW() - INTERVAL 4 MONTH),
  (6,  'arl',            'Colpatria',          'ARL-006-2024',  'Sede Principal', '2024-09-01', 'activo',  'Risaralda', NOW() - INTERVAL 4 MONTH),
  (6,  'eps',            'Sura',               'EPS-006-2024',  'Sede Principal', '2024-09-01', 'activo',  'Risaralda', NOW() - INTERVAL 4 MONTH),
  (6,  'caja_comp',      'Comfamiliar',        'CAJ-006-2024',  'Sede Principal', '2024-09-01', 'activo',  'Risaralda', NOW() - INTERVAL 4 MONTH),
  (6,  'pension',        'Old Mutual',         'PEN-006-2024',  'Sede Principal', '2024-09-01', 'activo',  'Risaralda', NOW() - INTERVAL 4 MONTH),
  (7,  'arl',            'Colpatria',          'ARL-007-2024',  'Sede Principal', '2024-10-01', 'activo',  'Risaralda', NOW() - INTERVAL 3 MONTH),
  (7,  'eps',            'Nueva EPS',          'EPS-007-2024',  'Sede Principal', '2024-10-01', 'activo',  'Risaralda', NOW() - INTERVAL 3 MONTH),
  (7,  'caja_comp',      'Comfamiliar',        'CAJ-007-2024',  'Sede Principal', '2024-10-01', 'activo',  'Risaralda', NOW() - INTERVAL 3 MONTH),
  (7,  'pension',        'Porvenir',           'PEN-007-2024',  'Sede Principal', '2024-10-01', 'activo',  'Risaralda', NOW() - INTERVAL 3 MONTH),
  (8,  'arl',            'Colpatria',          'ARL-008-2024',  'Sede Principal', '2024-10-01', 'activo',  'Risaralda', NOW() - INTERVAL 3 MONTH),
  (8,  'eps',            'Compensar',          'EPS-008-2024',  'Sede Principal', '2024-10-01', 'activo',  'Risaralda', NOW() - INTERVAL 3 MONTH),
  (8,  'caja_comp',      'Comfamiliar',        'CAJ-008-2024',  'Sede Principal', '2024-10-01', 'activo',  'Risaralda', NOW() - INTERVAL 3 MONTH),
  (8,  'pension',        'Colfondos',          'PEN-008-2024',  'Sede Principal', '2024-10-01', 'activo',  'Risaralda', NOW() - INTERVAL 3 MONTH),
  (9,  'arl',            'Colpatria',          'ARL-009-2024',  'Sede Principal', '2024-11-01', 'activo',  'Risaralda', NOW() - INTERVAL 2 MONTH),
  (9,  'eps',            'Sura',               'EPS-009-2024',  'Sede Principal', '2024-11-01', 'activo',  'Risaralda', NOW() - INTERVAL 2 MONTH),
  (9,  'caja_comp',      'Comfamiliar',        'CAJ-009-2024',  'Sede Principal', '2024-11-01', 'activo',  'Risaralda', NOW() - INTERVAL 2 MONTH),
  (9,  'pension',        'Protección',         'PEN-009-2024',  'Sede Principal', '2024-11-01', 'activo',  'Risaralda', NOW() - INTERVAL 2 MONTH),
  (10, 'arl',            'Colpatria',          'ARL-010-2024',  'Sede Principal', '2024-11-01', 'activo',  'Risaralda', NOW() - INTERVAL 2 MONTH),
  (10, 'eps',            'Famisanar',          'EPS-010-2024',  'Sede Principal', '2024-11-01', 'activo',  'Risaralda', NOW() - INTERVAL 2 MONTH),
  (10, 'caja_comp',      'Comfamiliar',        'CAJ-010-2024',  'Sede Principal', '2024-11-01', 'activo',  'Risaralda', NOW() - INTERVAL 2 MONTH),
  (10, 'pension',        'Porvenir',           'PEN-010-2024',  'Sede Principal', '2024-11-01', 'activo',  'Risaralda', NOW() - INTERVAL 2 MONTH);

-- ── PERÍODOS DE NÓMINA (6 meses de historia) ────────────────────
INSERT INTO periodos_nomina (anio, mes, quincena, fecha_inicial, fecha_final, fecha_pago, estado, total_neto, creado_en) VALUES
  (2024, 7,  1, '2024-07-01', '2024-07-15', '2024-07-16', 'pagado',   34820000.00, NOW() - INTERVAL 6 MONTH),
  (2024, 7,  2, '2024-07-16', '2024-07-31', '2024-08-01', 'pagado',   34820000.00, NOW() - INTERVAL 6 MONTH),
  (2024, 8,  1, '2024-08-01', '2024-08-15', '2024-08-16', 'pagado',   36450000.00, NOW() - INTERVAL 5 MONTH),
  (2024, 8,  2, '2024-08-16', '2024-08-31', '2024-09-01', 'pagado',   36450000.00, NOW() - INTERVAL 5 MONTH),
  (2024, 9,  1, '2024-09-01', '2024-09-15', '2024-09-16', 'pagado',   38200000.00, NOW() - INTERVAL 4 MONTH),
  (2024, 9,  2, '2024-09-16', '2024-09-30', '2024-10-01', 'pagado',   38200000.00, NOW() - INTERVAL 4 MONTH),
  (2024, 10, 1, '2024-10-01', '2024-10-15', '2024-10-16', 'pagado',   42100000.00, NOW() - INTERVAL 3 MONTH),
  (2024, 10, 2, '2024-10-16', '2024-10-31', '2024-11-01', 'pagado',   42100000.00, NOW() - INTERVAL 3 MONTH),
  (2024, 11, 1, '2024-11-01', '2024-11-15', '2024-11-16', 'pagado',   44500000.00, NOW() - INTERVAL 2 MONTH),
  (2024, 11, 2, '2024-11-16', '2024-11-30', '2024-12-01', 'pagado',   44500000.00, NOW() - INTERVAL 2 MONTH),
  (2024, 12, 1, '2024-12-01', '2024-12-15', '2024-12-16', 'pagado',   48200000.00, NOW() - INTERVAL 1 MONTH),
  (2024, 12, 2, '2024-12-16', '2024-12-31', '2025-01-01', 'pagado',   48200000.00, NOW() - INTERVAL 1 MONTH),
  (2025, 1,  1, '2025-01-01', '2025-01-15', '2025-01-16', 'aprobado', 48200000.00, NOW() - INTERVAL 2 WEEK),
  (2025, 1,  2, '2025-01-16', '2025-01-31', '2025-02-01', 'liquidado',48200000.00, NOW() - INTERVAL 1 WEEK),
  (2025, 2,  1, '2025-02-01', '2025-02-15', '2025-02-16', 'abierto',  0.00,        NOW());

-- ── NOVEDADES (período actual) ───────────────────────────────────
INSERT INTO novedades (empleado_id, periodo_id, tipo_novedad, concepto_codigo, concepto_descripcion, cantidad, valor, es_deduccion, fecha_novedad, registrado_por) VALUES
  (1,  15, 'periodica', '072', 'Auxilio de rodamiento',      1, 250000.00, false, '2025-02-01', 1),
  (2,  15, 'periodica', '072', 'Auxilio de rodamiento',      1, 250000.00, false, '2025-02-01', 1),
  (3,  15, 'unica',     '996', 'Bonificación por desempeño', 1, 500000.00, false, '2025-02-01', 1),
  (4,  15, 'unica',     '996', 'Bonificación por desempeño', 1, 300000.00, false, '2025-02-01', 1),
  (1,  15, 'periodica', '301', 'Fondo de empleados Crecer',  1, 80000.00,  true,  '2025-02-01', 1),
  (2,  15, 'periodica', '301', 'Fondo de empleados Crecer',  1, 80000.00,  true,  '2025-02-01', 1),
  (5,  15, 'periodica', '105', 'Recargo nocturno',           8, 45000.00,  false, '2025-02-01', 1),
  (6,  15, 'periodica', '105', 'Recargo nocturno',           4, 45000.00,  false, '2025-02-01', 1);

-- ── LIQUIDACIONES NÓMINA (períodos pagados) ──────────────────────
INSERT INTO liquidaciones_nomina (empleado_id, periodo_id, total_devengado, total_deducido, neto_pagar, dias_trabajados, estado, creado_en) VALUES
  (1,  1, 2100000.00, 378000.00, 1722000.00, 15, 'aprobado', NOW() - INTERVAL 6 MONTH),
  (2,  1, 1800000.00, 324000.00, 1476000.00, 15, 'aprobado', NOW() - INTERVAL 6 MONTH),
  (3,  1, 1600000.00, 288000.00, 1312000.00, 15, 'aprobado', NOW() - INTERVAL 6 MONTH),
  (4,  1, 2500000.00, 450000.00, 2050000.00, 15, 'aprobado', NOW() - INTERVAL 6 MONTH),
  (5,  1, 1400000.00, 252000.00, 1148000.00, 15, 'aprobado', NOW() - INTERVAL 6 MONTH),
  (1,  13, 2350000.00, 423000.00, 1927000.00, 15, 'aprobado', NOW() - INTERVAL 2 WEEK),
  (2,  13, 1950000.00, 351000.00, 1599000.00, 15, 'aprobado', NOW() - INTERVAL 2 WEEK),
  (3,  13, 1750000.00, 315000.00, 1435000.00, 15, 'aprobado', NOW() - INTERVAL 2 WEEK),
  (4,  13, 2750000.00, 495000.00, 2255000.00, 15, 'aprobado', NOW() - INTERVAL 2 WEEK),
  (5,  13, 1550000.00, 279000.00, 1271000.00, 15, 'aprobado', NOW() - INTERVAL 2 WEEK),
  (6,  13, 2100000.00, 378000.00, 1722000.00, 15, 'aprobado', NOW() - INTERVAL 2 WEEK),
  (7,  13, 1800000.00, 324000.00, 1476000.00, 15, 'aprobado', NOW() - INTERVAL 2 WEEK),
  (8,  13, 3200000.00, 576000.00, 2624000.00, 15, 'aprobado', NOW() - INTERVAL 2 WEEK),
  (9,  13, 1650000.00, 297000.00, 1353000.00, 15, 'aprobado', NOW() - INTERVAL 2 WEEK),
  (10, 13, 2400000.00, 432000.00, 1968000.00, 15, 'aprobado', NOW() - INTERVAL 2 WEEK);

-- ── PLANILLAS PILA ───────────────────────────────────────────────
INSERT INTO planillas_pila (anio, mes, fecha_limite_pago, total_empleados, total_aportes, estado, creado_en) VALUES
  (2024, 7,  '2024-08-12', 5,  12500000.00, 'pagado',    NOW() - INTERVAL 6 MONTH),
  (2024, 8,  '2024-09-11', 7,  18200000.00, 'pagado',    NOW() - INTERVAL 5 MONTH),
  (2024, 9,  '2024-10-10', 8,  21400000.00, 'pagado',    NOW() - INTERVAL 4 MONTH),
  (2024, 10, '2024-11-12', 9,  24800000.00, 'pagado',    NOW() - INTERVAL 3 MONTH),
  (2024, 11, '2024-12-11', 10, 28600000.00, 'pagado',    NOW() - INTERVAL 2 MONTH),
  (2024, 12, '2025-01-10', 10, 32100000.00, 'transmitido', NOW() - INTERVAL 1 MONTH);
