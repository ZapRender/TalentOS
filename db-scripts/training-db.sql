-- ═══════════════════════════════════════════════════════════════
-- TalentOS — Training DB
-- Base de datos del Training Service (PostgreSQL)
-- ═══════════════════════════════════════════════════════════════

-- Planes de inducción
CREATE TABLE IF NOT EXISTS planes_induccion (
  id                   SERIAL PRIMARY KEY,
  empleado_id          INTEGER      NOT NULL COMMENT 'ref Employee Service',
  fecha_inicio         DATE         NOT NULL,
  fecha_fin            DATE         NOT NULL,
  -- 3 a 5 días laborales después de fecha_inicio
  estado               VARCHAR(20)  DEFAULT 'pendiente',
  -- pendiente | en_curso | completado
  formato_firmado_path VARCHAR(500),
  creado_en            TIMESTAMP    DEFAULT NOW()
);

-- Planes anuales de capacitación
CREATE TABLE IF NOT EXISTS planes_capacitacion (
  id            SERIAL PRIMARY KEY,
  anio          INTEGER     NOT NULL UNIQUE,
  estado        VARCHAR(30) DEFAULT 'borrador',
  -- borrador | aprobado | en_ejecucion | cerrado
  aprobado_por  INTEGER,
  creado_en     TIMESTAMP   DEFAULT NOW()
);

-- Capacitaciones
CREATE TABLE IF NOT EXISTS capacitaciones (
  id                       SERIAL PRIMARY KEY,
  plan_id                  INTEGER      REFERENCES planes_capacitacion(id),
  nombre                   VARCHAR(200) NOT NULL,
  fecha                    DATE         NOT NULL,
  duracion_horas           DECIMAL(4,1) NOT NULL,
  fuente_necesidad         VARCHAR(80)  NOT NULL,
  -- seleccion | evaluacion | lider_proceso | normativa | riesgo_psicosocial
  tipo_evaluacion_eficacia VARCHAR(50),
  -- escrita | tecnica | taller | desempeno | jefe_inmediato
  requiere_evaluacion      BOOLEAN      DEFAULT false,
  evidencia_asistencia     VARCHAR(500),
  creado_en                TIMESTAMP    DEFAULT NOW()
);

-- Asistencias a capacitaciones
CREATE TABLE IF NOT EXISTS asistencias_capacitacion (
  id               SERIAL PRIMARY KEY,
  capacitacion_id  INTEGER     NOT NULL REFERENCES capacitaciones(id),
  empleado_id      INTEGER     NOT NULL,
  asistio          BOOLEAN     DEFAULT false,
  resultado_eval   VARCHAR(20),
  -- aprobado | reprobado | no_aplica
  puntaje          DECIMAL(5,2),
  observaciones    TEXT,
  UNIQUE (capacitacion_id, empleado_id)
);

-- Evaluaciones de desempeño
CREATE TABLE IF NOT EXISTS evaluaciones_desempeno (
  id                SERIAL PRIMARY KEY,
  empleado_id       INTEGER      NOT NULL,
  tipo              VARCHAR(30)  NOT NULL,
  -- prueba_directa_2m | prueba_temporal_3m | anual
  fecha_evaluacion  DATE         NOT NULL,
  evaluador_id      INTEGER      NOT NULL,
  resultado_general VARCHAR(20),
  -- excelente | bueno | aceptable | deficiente
  puntaje_total     DECIMAL(5,2),
  pasa_directo      BOOLEAN,
  -- solo para empleados temporales en período de prueba
  observaciones     TEXT,
  creado_en         TIMESTAMP    DEFAULT NOW()
);

-- Compromisos de mejora
CREATE TABLE IF NOT EXISTS compromisos_mejora (
  id                        SERIAL PRIMARY KEY,
  evaluacion_id             INTEGER     NOT NULL REFERENCES evaluaciones_desempeno(id),
  descripcion               TEXT        NOT NULL,
  fecha_limite              DATE        NOT NULL,
  estado                    VARCHAR(20) DEFAULT 'pendiente',
  -- pendiente | en_curso | cumplido
  capacitacion_vinculada_id INTEGER     REFERENCES capacitaciones(id),
  creado_en                 TIMESTAMP   DEFAULT NOW()
);

-- ── ÍNDICES ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_induccion_empleado   ON planes_induccion(empleado_id);
CREATE INDEX IF NOT EXISTS idx_asist_capacitacion   ON asistencias_capacitacion(capacitacion_id);
CREATE INDEX IF NOT EXISTS idx_eval_empleado        ON evaluaciones_desempeno(empleado_id);
CREATE INDEX IF NOT EXISTS idx_compromisos_eval     ON compromisos_mejora(evaluacion_id);
CREATE INDEX IF NOT EXISTS idx_cap_plan             ON capacitaciones(plan_id);
