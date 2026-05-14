-- ═══════════════════════════════════════════════════════════════
-- TalentOS — Payroll DB
-- Base de datos del Payroll Service (MySQL)
-- ═══════════════════════════════════════════════════════════════

-- Períodos de nómina
CREATE TABLE IF NOT EXISTS periodos_nomina (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  anio          YEAR        NOT NULL,
  mes           TINYINT     NOT NULL COMMENT '1-12',
  quincena      TINYINT     NOT NULL COMMENT '1 o 2',
  fecha_inicial DATE        NOT NULL,
  fecha_final   DATE        NOT NULL,
  fecha_pago    DATE        NOT NULL,
  estado        VARCHAR(30) DEFAULT 'abierto',
  -- abierto | liquidado | pendiente_aprobacion | aprobado | pagado
  aprobado_por  INT         DEFAULT NULL,
  total_neto    DECIMAL(14,2) DEFAULT 0,
  creado_en     TIMESTAMP   DEFAULT NOW(),
  UNIQUE KEY uk_periodo (anio, mes, quincena)
);

-- Novedades de nómina
CREATE TABLE IF NOT EXISTS novedades (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  empleado_id          INT         NOT NULL COMMENT 'ref Employee Service',
  periodo_id           INT         NOT NULL,
  tipo_novedad         VARCHAR(30) NOT NULL,
  -- unica | periodica | liquidacion
  concepto_codigo      VARCHAR(10) NOT NULL,
  -- 001-Salario, 020-AuxTransp, 072-Rodamiento
  -- 105-Nocturno, 301-Fondo, 996-Bonificacion
  concepto_descripcion VARCHAR(100) NOT NULL,
  cantidad             DECIMAL(8,2) DEFAULT 1,
  valor                DECIMAL(12,2) NOT NULL,
  es_deduccion         BOOLEAN      DEFAULT false,
  fecha_novedad        DATE         NOT NULL,
  registrado_por       INT          NOT NULL,
  FOREIGN KEY (periodo_id) REFERENCES periodos_nomina(id)
);

-- Liquidaciones de nómina por empleado
CREATE TABLE IF NOT EXISTS liquidaciones_nomina (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  empleado_id      INT           NOT NULL COMMENT 'ref Employee Service',
  periodo_id       INT           NOT NULL,
  total_devengado  DECIMAL(12,2) NOT NULL,
  total_deducido   DECIMAL(12,2) NOT NULL,
  neto_pagar       DECIMAL(12,2) NOT NULL,
  dias_trabajados  TINYINT       NOT NULL DEFAULT 15,
  estado           VARCHAR(20)   DEFAULT 'generado',
  -- generado | revisado | aprobado
  creado_en        TIMESTAMP     DEFAULT NOW(),
  FOREIGN KEY (periodo_id) REFERENCES periodos_nomina(id),
  UNIQUE KEY uk_liq (empleado_id, periodo_id)
);

-- Conceptos detallados por liquidación
CREATE TABLE IF NOT EXISTS conceptos_liquidados (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  liquidacion_id  INT           NOT NULL,
  codigo_concepto VARCHAR(10)   NOT NULL,
  descripcion     VARCHAR(100)  NOT NULL,
  cantidad        DECIMAL(8,2)  DEFAULT 0,
  valor_devengado DECIMAL(12,2) DEFAULT 0,
  valor_deducido  DECIMAL(12,2) DEFAULT 0,
  FOREIGN KEY (liquidacion_id) REFERENCES liquidaciones_nomina(id)
);

-- Afiliaciones a seguridad social
CREATE TABLE IF NOT EXISTS afiliaciones (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  empleado_id           INT          NOT NULL COMMENT 'ref Employee Service',
  tipo_entidad          VARCHAR(20)  NOT NULL,
  -- arl | eps | caja_compensacion | pension
  nombre_entidad        VARCHAR(100) NOT NULL,
  numero_afiliacion     VARCHAR(80),
  centro_trabajo        VARCHAR(50),
  fecha_afiliacion      DATE         NOT NULL,
  fecha_desafiliacion   DATE,
  estado                VARCHAR(20)  DEFAULT 'activo',
  -- activo | retirado
  comprobante_path      VARCHAR(500),
  region                VARCHAR(50),
  -- Risaralda | Santander
  creado_en             TIMESTAMP    DEFAULT NOW()
);

-- Liquidaciones definitivas de contrato
CREATE TABLE IF NOT EXISTS liquidaciones_contrato (
  id                        INT AUTO_INCREMENT PRIMARY KEY,
  empleado_id               INT           NOT NULL COMMENT 'ref Employee Service',
  fecha_terminacion         DATE          NOT NULL,
  motivo_retiro             VARCHAR(50)   NOT NULL,
  -- renuncia | no_renovacion | despido_justa | despido_sin_justa | mutuo_acuerdo
  base_vacaciones           DECIMAL(12,2) NOT NULL,
  base_cesantias            DECIMAL(12,2) NOT NULL,
  base_primas               DECIMAL(12,2) NOT NULL,
  valor_vacaciones          DECIMAL(12,2) NOT NULL,
  valor_cesantias           DECIMAL(12,2) NOT NULL,
  valor_intereses_cesantias DECIMAL(12,2) NOT NULL,
  valor_prima               DECIMAL(12,2) NOT NULL,
  valor_indemnizacion       DECIMAL(12,2) DEFAULT 0,
  total_liquidacion         DECIMAL(12,2) NOT NULL,
  estado                    VARCHAR(30)   DEFAULT 'borrador',
  -- borrador | enviado_contador | aprobado | pagado
  aprobado_por              INT           DEFAULT NULL,
  fecha_aprobacion          DATE,
  creado_en                 TIMESTAMP     DEFAULT NOW()
);

-- Planillas PILA
CREATE TABLE IF NOT EXISTS planillas_pila (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  anio                YEAR        NOT NULL,
  mes                 TINYINT     NOT NULL,
  fecha_generacion    TIMESTAMP   DEFAULT NOW(),
  fecha_limite_pago   DATE        NOT NULL,
  total_empleados     INT         NOT NULL,
  total_aportes       DECIMAL(14,2) NOT NULL,
  archivo_plano_path  VARCHAR(500),
  estado              VARCHAR(20) DEFAULT 'generado',
  -- generado | transmitido | pagado
  notificado_a        INT,
  UNIQUE KEY uk_pila (anio, mes)
);

-- ── ÍNDICES ─────────────────────────────────────────────────────
CREATE INDEX idx_novedades_periodo  ON novedades(periodo_id);
CREATE INDEX idx_novedades_empleado ON novedades(empleado_id);
CREATE INDEX idx_liq_empleado       ON liquidaciones_nomina(empleado_id);
CREATE INDEX idx_afil_empleado      ON afiliaciones(empleado_id);
CREATE INDEX idx_afil_estado        ON afiliaciones(estado);
