-- ═══════════════════════════════════════════════════════════════
-- TalentOS — Auth DB
-- Base de datos del Auth Service (PostgreSQL)
-- ═══════════════════════════════════════════════════════════════

-- Roles del sistema
CREATE TABLE IF NOT EXISTS roles (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(50)  NOT NULL UNIQUE,
  descripcion TEXT,
  creado_en   TIMESTAMP    DEFAULT NOW()
);

-- Usuarios del sistema
CREATE TABLE IF NOT EXISTS usuarios (
  id              SERIAL PRIMARY KEY,
  nombre          VARCHAR(100) NOT NULL,
  apellidos       VARCHAR(100),
  email           VARCHAR(150) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  empleado_id     INTEGER,
  activo          BOOLEAN      DEFAULT true,
  ultimo_login    TIMESTAMP,
  creado_en       TIMESTAMP    DEFAULT NOW()
);

-- Relación usuarios ↔ roles (N:M)
CREATE TABLE IF NOT EXISTS usuario_roles (
  usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  rol_id      INTEGER NOT NULL REFERENCES roles(id)    ON DELETE CASCADE,
  asignado_en TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (usuario_id, rol_id)
);

-- Refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          SERIAL PRIMARY KEY,
  usuario_id  INTEGER      NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token       VARCHAR(500) NOT NULL UNIQUE,
  expira_en   TIMESTAMP    NOT NULL,
  revocado    BOOLEAN      DEFAULT false,
  creado_en   TIMESTAMP    DEFAULT NOW()
);

-- ── ÍNDICES ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_usuarios_email       ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_usuario      ON refresh_tokens(usuario_id);

-- ── DATOS INICIALES ─────────────────────────────────────────────
INSERT INTO roles (nombre, descripcion) VALUES
  ('ADMIN_RRHH',     'Analista de Recursos Humanos — acceso completo'),
  ('GERENTE',        'Gerente General — aprobaciones'),
  ('CONTADOR',       'Contador — aprobación de liquidaciones'),
  ('EMPLEADO',       'Empleado — autoservicio'),
  ('LIDER_PROCESO',  'Líder de proceso — evaluaciones')
ON CONFLICT (nombre) DO NOTHING;

-- Usuario admin inicial (password: Admin123! — cambiar en producción)
-- Hash bcrypt de 'Admin123!'
INSERT INTO usuarios (nombre, apellidos, email, password_hash, activo) VALUES
  ('Admin', 'TalentOS', 'admin@talentos.com',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true)
ON CONFLICT (email) DO NOTHING;

-- Asignar rol ADMIN_RRHH al usuario inicial
INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, r.id
FROM usuarios u, roles r
WHERE u.email = 'admin@talentos.com'
  AND r.nombre = 'ADMIN_RRHH'
ON CONFLICT DO NOTHING;
