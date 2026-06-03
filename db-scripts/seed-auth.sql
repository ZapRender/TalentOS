-- ═══════════════════════════════════════════════════════════════
-- TalentOS — Seed Data — Auth DB
-- Simula el sistema con 6 meses de uso
-- Ejecutar en: talentos-auth-db
-- ═══════════════════════════════════════════════════════════════

-- ── USUARIOS DEL SISTEMA ────────────────────────────────────────
-- Todos con password: Talentos2025!
-- Hash bcrypt de 'Talentos2025!'
-- $2b$10$m5cJn0xprg6vrqVQGGamXODHrbrDp7TQmv3c1PsYeJKW81CJyno4u

INSERT INTO usuarios (nombre, apellidos, email, password_hash, empleado_id, activo, ultimo_login, creado_en) VALUES
  ('Ana María',   'Rodríguez Torres',  'ana.rodriguez@talentos.com',   '$2b$10$m5cJn0xprg6vrqVQGGamXODHrbrDp7TQmv3c1PsYeJKW81CJyno4u', 1,  true, NOW() - INTERVAL '2 hours',    NOW() - INTERVAL '6 months'),
  ('Carlos',      'Mendoza Ríos',      'carlos.mendoza@talentos.com',  '$2b$10$m5cJn0xprg6vrqVQGGamXODHrbrDp7TQmv3c1PsYeJKW81CJyno4u', 2,  true, NOW() - INTERVAL '1 day',     NOW() - INTERVAL '6 months'),
  ('Laura',       'Jiménez Castillo',  'laura.jimenez@talentos.com',   '$2b$10$m5cJn0xprg6vrqVQGGamXODHrbrDp7TQmv3c1PsYeJKW81CJyno4u', 3,  true, NOW() - INTERVAL '3 hours',   NOW() - INTERVAL '5 months'),
  ('Sebastián',   'Vargas Moreno',     'sebastian.vargas@talentos.com','$2b$10$m5cJn0xprg6vrqVQGGamXODHrbrDp7TQmv3c1PsYeJKW81CJyno4u', 4,  true, NOW() - INTERVAL '2 days',    NOW() - INTERVAL '5 months'),
  ('Juliana',     'Pérez Salazar',     'juliana.perez@talentos.com',   '$2b$10$m5cJn0xprg6vrqVQGGamXODHrbrDp7TQmv3c1PsYeJKW81CJyno4u', 5,  true, NOW() - INTERVAL '5 hours',   NOW() - INTERVAL '4 months'),
  ('Miguel',      'Torres Agudelo',    'miguel.torres@talentos.com',   '$2b$10$m5cJn0xprg6vrqVQGGamXODHrbrDp7TQmv3c1PsYeJKW81CJyno4u', 6,  true, NOW() - INTERVAL '1 week',    NOW() - INTERVAL '4 months'),
  ('Valentina',   'Gómez Herrera',     'valentina.gomez@talentos.com', '$2b$10$m5cJn0xprg6vrqVQGGamXODHrbrDp7TQmv3c1PsYeJKW81CJyno4u', 7,  true, NOW() - INTERVAL '4 hours',   NOW() - INTERVAL '3 months'),
  ('Andrés',      'López Quintero',    'andres.lopez@talentos.com',    '$2b$10$m5cJn0xprg6vrqVQGGamXODHrbrDp7TQmv3c1PsYeJKW81CJyno4u', 8,  true, NOW() - INTERVAL '2 weeks',   NOW() - INTERVAL '3 months'),
  ('Manuela',     'Castro Restrepo',   'manuela.castro@talentos.com',  '$2b$10$m5cJn0xprg6vrqVQGGamXODHrbrDp7TQmv3c1PsYeJKW81CJyno4u', 9,  true, NOW() - INTERVAL '6 hours',   NOW() - INTERVAL '2 months'),
  ('Diego',       'Ramírez Ospina',    'diego.ramirez@talentos.com',   '$2b$10$m5cJn0xprg6vrqVQGGamXODHrbrDp7TQmv3c1PsYeJKW81CJyno4u', 10, true, NOW() - INTERVAL '3 days',    NOW() - INTERVAL '2 months'),
  -- Usuarios con roles especiales (sin empleado vinculado)
  ('Roberto',     'Fernández Gil',     'gerente@talentos.com',         '$2b$10$m5cJn0xprg6vrqVQGGamXODHrbrDp7TQmv3c1PsYeJKW81CJyno4u', NULL, true, NOW() - INTERVAL '1 hour',  NOW() - INTERVAL '6 months'),
  ('Patricia',    'Morales Vega',      'contador@talentos.com',        '$2b$10$m5cJn0xprg6vrqVQGGamXODHrbrDp7TQmv3c1PsYeJKW81CJyno4u', NULL, true, NOW() - INTERVAL '8 hours', NOW() - INTERVAL '6 months'),
  ('Hernando',    'Suárez Pineda',     'lider.ops@talentos.com',       '$2b$10$m5cJn0xprg6vrqVQGGamXODHrbrDp7TQmv3c1PsYeJKW81CJyno4u', NULL, true, NOW() - INTERVAL '2 days',  NOW() - INTERVAL '5 months'),
  ('Claudia',     'Betancur Arias',    'lider.admin@talentos.com',     '$2b$10$m5cJn0xprg6vrqVQGGamXODHrbrDp7TQmv3c1PsYeJKW81CJyno4u', NULL, true, NOW() - INTERVAL '4 days',  NOW() - INTERVAL '4 months'),
  -- Usuario inactivo
  ('Fernando',    'Díaz Montoya',      'fernando.diaz@talentos.com',   '$2b$10$m5cJn0xprg6vrqVQGGamXODHrbrDp7TQmv3c1PsYeJKW81CJyno4u', NULL, false, NULL, NOW() - INTERVAL '3 months')
ON CONFLICT (email) DO NOTHING;

-- ── ASIGNAR ROLES ───────────────────────────────────────────────
-- Empleados del sistema
INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, r.id FROM usuarios u, roles r
WHERE u.email IN (
  'ana.rodriguez@talentos.com',
  'carlos.mendoza@talentos.com',
  'laura.jimenez@talentos.com',
  'sebastian.vargas@talentos.com',
  'juliana.perez@talentos.com',
  'miguel.torres@talentos.com',
  'valentina.gomez@talentos.com',
  'andres.lopez@talentos.com',
  'manuela.castro@talentos.com',
  'diego.ramirez@talentos.com'
) AND r.nombre = 'EMPLEADO'
ON CONFLICT DO NOTHING;

-- Gerente
INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, r.id FROM usuarios u, roles r
WHERE u.email = 'gerente@talentos.com' AND r.nombre = 'GERENTE'
ON CONFLICT DO NOTHING;

-- Contador
INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, r.id FROM usuarios u, roles r
WHERE u.email = 'contador@talentos.com' AND r.nombre = 'CONTADOR'
ON CONFLICT DO NOTHING;

-- Líderes de proceso
INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, r.id FROM usuarios u, roles r
WHERE u.email IN ('lider.ops@talentos.com', 'lider.admin@talentos.com')
AND r.nombre = 'LIDER_PROCESO'
ON CONFLICT DO NOTHING;
