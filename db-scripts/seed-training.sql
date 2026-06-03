-- ═══════════════════════════════════════════════════════════════
-- TalentOS — Seed Data — Training DB
-- Simula el sistema con 6 meses de uso
-- Ejecutar en: talentos-training-db (PostgreSQL)
-- ═══════════════════════════════════════════════════════════════

-- ── PLANES DE INDUCCIÓN ─────────────────────────────────────────
INSERT INTO planes_induccion (empleado_id, fecha_inicio, fecha_fin, estado, creado_en) VALUES
  (1,  '2024-07-01', '2024-07-05', 'completado', NOW() - INTERVAL '6 months'),
  (2,  '2024-07-01', '2024-07-05', 'completado', NOW() - INTERVAL '6 months'),
  (3,  '2024-08-01', '2024-08-07', 'completado', NOW() - INTERVAL '5 months'),
  (4,  '2024-08-01', '2024-08-07', 'completado', NOW() - INTERVAL '5 months'),
  (5,  '2024-09-02', '2024-09-06', 'completado', NOW() - INTERVAL '4 months'),
  (6,  '2024-09-02', '2024-09-06', 'completado', NOW() - INTERVAL '4 months'),
  (7,  '2024-10-01', '2024-10-07', 'completado', NOW() - INTERVAL '3 months'),
  (8,  '2024-10-01', '2024-10-07', 'completado', NOW() - INTERVAL '3 months'),
  (9,  '2024-11-04', '2024-11-08', 'completado', NOW() - INTERVAL '2 months'),
  (10, '2024-11-04', '2024-11-08', 'completado', NOW() - INTERVAL '2 months');

-- ── PLAN ANUAL DE CAPACITACIÓN 2024 ─────────────────────────────
INSERT INTO planes_capacitacion (anio, estado, creado_en) VALUES
  (2024, 'cerrado',      NOW() - INTERVAL '6 months'),
  (2025, 'en_ejecucion', NOW() - INTERVAL '1 month');

-- ── CAPACITACIONES 2024 ──────────────────────────────────────────
INSERT INTO capacitaciones (plan_id, nombre, fecha, duracion_horas, fuente_necesidad, tipo_evaluacion_eficacia, requiere_evaluacion, creado_en) VALUES
  (1, 'Seguridad y Salud en el Trabajo',         '2024-08-15', 8.0,  'normativa',         'escrita',      true,  NOW() - INTERVAL '5 months'),
  (1, 'Manejo de PQRS y Atención al Cliente',    '2024-09-10', 4.0,  'lider_proceso',     'tecnica',      true,  NOW() - INTERVAL '4 months'),
  (1, 'Excel Avanzado para RRHH',                '2024-09-25', 6.0,  'evaluacion',        'taller',       true,  NOW() - INTERVAL '4 months'),
  (1, 'Trabajo en Equipo y Comunicación',        '2024-10-18', 4.0,  'riesgo_psicosocial','desempeno',    false, NOW() - INTERVAL '3 months'),
  (1, 'Normativa Laboral Colombiana',            '2024-11-08', 8.0,  'normativa',         'escrita',      true,  NOW() - INTERVAL '2 months'),
  (1, 'Manejo de Residuos y Medio Ambiente',     '2024-11-22', 4.0,  'normativa',         'tecnica',      true,  NOW() - INTERVAL '2 months'),
  -- Capacitaciones 2025
  (2, 'Primeros Auxilios Empresariales',         '2025-01-20', 8.0,  'normativa',         'tecnica',      true,  NOW() - INTERVAL '2 weeks'),
  (2, 'Actualización Sistema de Gestión HSEQ',   '2025-02-05', 6.0,  'normativa',         'escrita',      true,  NOW() - INTERVAL '1 week'),
  (2, 'Liderazgo y Gestión del Cambio',          '2025-03-15', 8.0,  'evaluacion',        'desempeno',    true,  NOW()),
  (2, 'Uso de TalentOS — Sistema RRHH',          '2025-04-10', 4.0,  'lider_proceso',     'taller',       false, NOW());

-- ── ASISTENCIAS A CAPACITACIONES ────────────────────────────────
INSERT INTO asistencias_capacitacion (capacitacion_id, empleado_id, asistio, resultado_eval, puntaje) VALUES
  -- SST (cap 1)
  (1, 1, true, 'aprobado', 88.0),
  (1, 2, true, 'aprobado', 92.0),
  (1, 3, true, 'aprobado', 75.0),
  (1, 4, true, 'aprobado', 85.0),
  (1, 5, true, 'aprobado', 90.0),
  -- PQRS (cap 2)
  (2, 1, true,  'aprobado',  82.0),
  (2, 2, false, 'no_aplica', NULL),
  (2, 3, true,  'aprobado',  78.0),
  (2, 4, true,  'aprobado',  88.0),
  (2, 5, true,  'aprobado',  95.0),
  -- Excel (cap 3)
  (3, 1, true, 'aprobado',  91.0),
  (3, 2, true, 'aprobado',  87.0),
  (3, 3, true, 'reprobado', 55.0),
  (3, 4, true, 'aprobado',  93.0),
  -- Trabajo equipo (cap 4)
  (4, 1,  true, 'no_aplica', NULL),
  (4, 2,  true, 'no_aplica', NULL),
  (4, 3,  true, 'no_aplica', NULL),
  (4, 4,  true, 'no_aplica', NULL),
  (4, 5,  true, 'no_aplica', NULL),
  (4, 6,  true, 'no_aplica', NULL),
  (4, 7,  true, 'no_aplica', NULL),
  (4, 8,  true, 'no_aplica', NULL),
  (4, 9,  true, 'no_aplica', NULL),
  (4, 10, true, 'no_aplica', NULL),
  -- Primeros auxilios 2025 (cap 7)
  (7, 1, true, 'aprobado', 90.0),
  (7, 2, true, 'aprobado', 85.0),
  (7, 3, true, 'aprobado', 88.0),
  (7, 4, true, 'aprobado', 92.0),
  (7, 5, true, 'aprobado', 78.0),
  (7, 6, true, 'aprobado', 95.0),
  (7, 7, true, 'aprobado', 82.0),
  (7, 8, true, 'aprobado', 89.0);

-- ── EVALUACIONES DE DESEMPEÑO ────────────────────────────────────
INSERT INTO evaluaciones_desempeno (empleado_id, tipo, fecha_evaluacion, evaluador_id, resultado_general, puntaje_total, pasa_directo, observaciones, creado_en) VALUES
  -- Pruebas período de prueba (2 meses después de ingreso)
  (1,  'prueba_directa_2m',  '2024-09-01', 11, 'excelente',  92.5, true,  'Excelente adaptación y alto rendimiento desde el inicio.',         NOW() - INTERVAL '4 months'),
  (2,  'prueba_directa_2m',  '2024-09-01', 11, 'bueno',      82.0, true,  'Buen desempeño, cumple con las expectativas del cargo.',           NOW() - INTERVAL '4 months'),
  (3,  'prueba_directa_2m',  '2024-10-01', 13, 'bueno',      78.5, true,  'Adecuado desempeño. Requiere fortalecer habilidades técnicas.',    NOW() - INTERVAL '3 months'),
  (4,  'prueba_directa_2m',  '2024-10-01', 11, 'excelente',  95.0, true,  'Desempeño sobresaliente. Demuestra liderazgo natural.',           NOW() - INTERVAL '3 months'),
  (5,  'prueba_directa_2m',  '2024-11-04', 14, 'aceptable',  68.0, false, 'Desempeño por debajo del esperado. Requiere plan de mejora.',     NOW() - INTERVAL '2 months'),
  (6,  'prueba_directa_2m',  '2024-11-04', 13, 'bueno',      80.0, true,  'Cumple expectativas. Buena actitud y disposición al aprendizaje.',NOW() - INTERVAL '2 months'),
  (7,  'prueba_directa_2m',  '2024-12-02', 11, 'bueno',      85.0, true,  'Buen desempeño en sus funciones asignadas.',                      NOW() - INTERVAL '1 month'),
  (8,  'prueba_directa_2m',  '2024-12-02', 14, 'excelente',  94.0, true,  'Desempeño excepcional. Gran aporte al equipo de trabajo.',        NOW() - INTERVAL '1 month'),
  -- Evaluaciones anuales
  (1,  'anual',              '2025-01-15', 11, 'excelente',  94.0, NULL,  'Supera todas las metas del año. Candidato para promoción.',        NOW() - INTERVAL '2 weeks'),
  (2,  'anual',              '2025-01-15', 11, 'bueno',      84.0, NULL,  'Cumple metas satisfactoriamente. Buena gestión del tiempo.',       NOW() - INTERVAL '2 weeks'),
  (3,  'anual',              '2025-01-20', 13, 'bueno',      76.0, NULL,  'Mejora notable respecto al período anterior.',                     NOW() - INTERVAL '10 days'),
  (4,  'anual',              '2025-01-20', 11, 'excelente',  96.0, NULL,  'Mejor desempeño del año. Reconocimiento especial.',                NOW() - INTERVAL '10 days');

-- ── COMPROMISOS DE MEJORA ────────────────────────────────────────
INSERT INTO compromisos_mejora (evaluacion_id, descripcion, fecha_limite, estado, creado_en) VALUES
  -- Compromisos de empleado 5 (evaluación deficiente)
  (5, 'Mejorar indicadores de productividad en un 20%',         '2025-02-28', 'en_curso',  NOW() - INTERVAL '2 months'),
  (5, 'Asistir al taller de Excel avanzado y aprobarlo',        '2025-01-31', 'cumplido',  NOW() - INTERVAL '2 months'),
  (5, 'Reducir errores en reportes a menos del 5%',             '2025-03-31', 'pendiente', NOW() - INTERVAL '2 months'),
  -- Compromisos evaluación anual empleado 3
  (11, 'Certificarse en normativa laboral colombiana',           '2025-04-30', 'pendiente', NOW() - INTERVAL '10 days'),
  (11, 'Liderar al menos 2 capacitaciones internas en el año',  '2025-12-31', 'pendiente', NOW() - INTERVAL '10 days');
