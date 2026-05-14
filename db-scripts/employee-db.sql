-- ═══════════════════════════════════════════════════════════════
-- TalentOS — Employee DB
-- Base de datos del Employee Service (PostgreSQL)
-- ═══════════════════════════════════════════════════════════════

-- Requerimientos de personal
CREATE TABLE IF NOT EXISTS requerimientos_personal (
  id               SERIAL PRIMARY KEY,
  cargo            VARCHAR(100) NOT NULL,
  perfil_requerido TEXT         NOT NULL,
  numero_vacantes  INTEGER      DEFAULT 1,
  fecha_solicitud  DATE         NOT NULL DEFAULT CURRENT_DATE,
  solicitante_id   INTEGER      NOT NULL,
  estado           VARCHAR(30)  DEFAULT 'abierto',
  -- abierto | en_proceso | cubierto | cancelado
  creado_en        TIMESTAMP    DEFAULT NOW()
);

-- Candidatos
CREATE TABLE IF NOT EXISTS candidatos (
  id                     SERIAL PRIMARY KEY,
  cedula                 VARCHAR(20)  NOT NULL,
  nombres                VARCHAR(100) NOT NULL,
  apellidos              VARCHAR(100) NOT NULL,
  email                  VARCHAR(150),
  telefono               VARCHAR(20),
  cargo_aplicado         VARCHAR(100) NOT NULL,
  requerimiento_id       INTEGER      REFERENCES requerimientos_personal(id),
  etapa_actual           VARCHAR(50)  DEFAULT 'preseleccion',
  -- preseleccion | entrevista_inicial | entrevista_gerencia
  -- pruebas | referencias | antecedentes | admision
  -- contratado | rechazado
  tipo_ingreso_definido  VARCHAR(20),
  -- directo | temporal
  empresa_temporal       VARCHAR(100),
  resultado_examen_med   VARCHAR(10),
  -- apto | no_apto
  observaciones          TEXT,
  fecha_registro         DATE         DEFAULT CURRENT_DATE,
  creado_en              TIMESTAMP    DEFAULT NOW()
);

-- Empleados
CREATE TABLE IF NOT EXISTS empleados (
  id                    SERIAL PRIMARY KEY,
  cedula                VARCHAR(20)  NOT NULL UNIQUE,
  nombres               VARCHAR(100) NOT NULL,
  apellidos             VARCHAR(100) NOT NULL,
  email                 VARCHAR(150) NOT NULL,
  telefono              VARCHAR(20),
  direccion             TEXT,
  ciudad                VARCHAR(80),
  cargo                 VARCHAR(100) NOT NULL,
  seccion               VARCHAR(100),
  centro_costo          VARCHAR(50),
  salario_basico        DECIMAL(12,2) NOT NULL,
  tipo_contrato         VARCHAR(30)   NOT NULL,
  -- termino_fijo | indefinido | temporal
  tipo_ingreso          VARCHAR(20)   NOT NULL,
  -- directo | temporal
  empresa_temporal      VARCHAR(100),
  fecha_ingreso         DATE          NOT NULL,
  fecha_fin_contrato    DATE,
  ultimo_dia_laborado   DATE,
  estado                VARCHAR(20)   DEFAULT 'activo',
  -- activo | en_retiro | retirado
  tipo_pago             VARCHAR(30)   DEFAULT 'transferencia_electronica',
  banco                 VARCHAR(80),
  numero_cuenta         VARCHAR(50),
  usuario_sistema_id    INTEGER,
  creado_en             TIMESTAMP     DEFAULT NOW(),
  actualizado_en        TIMESTAMP     DEFAULT NOW()
);

-- Contratos
CREATE TABLE IF NOT EXISTS contratos (
  id             SERIAL PRIMARY KEY,
  empleado_id    INTEGER       NOT NULL REFERENCES empleados(id),
  tipo_contrato  VARCHAR(30)   NOT NULL,
  fecha_inicio   DATE          NOT NULL,
  fecha_fin      DATE,
  salario        DECIMAL(12,2) NOT NULL,
  cargo          VARCHAR(100)  NOT NULL,
  observaciones  TEXT,
  activo         BOOLEAN       DEFAULT true,
  creado_en      TIMESTAMP     DEFAULT NOW()
);

-- Documentos de hoja de vida digital
CREATE TABLE IF NOT EXISTS documentos_hv (
  id               SERIAL PRIMARY KEY,
  empleado_id      INTEGER      REFERENCES empleados(id),
  candidato_id     INTEGER      REFERENCES candidatos(id),
  tipo_documento   VARCHAR(80)  NOT NULL,
  -- cedula | contrato | examen_medico | afiliacion_arl
  -- afiliacion_eps | induccion | liquidacion | certificacion | otro
  nombre_archivo   VARCHAR(200) NOT NULL,
  ruta_archivo     VARCHAR(500) NOT NULL,
  modulo_origen    VARCHAR(50)  NOT NULL,
  subido_por       INTEGER      NOT NULL,
  fecha_carga      TIMESTAMP    DEFAULT NOW(),
  tamano_bytes     BIGINT
);

-- Certificaciones laborales
CREATE TABLE IF NOT EXISTS certificaciones_laborales (
  id                SERIAL PRIMARY KEY,
  empleado_id       INTEGER      NOT NULL REFERENCES empleados(id),
  tipo              VARCHAR(50)  NOT NULL,
  -- basica | con_salario | retiro
  fecha_generacion  TIMESTAMP    DEFAULT NOW(),
  generado_por      INTEGER      NOT NULL,
  estado_empleado   VARCHAR(20)  NOT NULL,
  documento_id      INTEGER      REFERENCES documentos_hv(id)
);

-- ── ÍNDICES ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_empleados_cedula  ON empleados(cedula);
CREATE INDEX IF NOT EXISTS idx_empleados_estado  ON empleados(estado);
CREATE INDEX IF NOT EXISTS idx_contratos_emp     ON contratos(empleado_id);
CREATE INDEX IF NOT EXISTS idx_docs_empleado     ON documentos_hv(empleado_id);
CREATE INDEX IF NOT EXISTS idx_candidatos_etapa  ON candidatos(etapa_actual);
