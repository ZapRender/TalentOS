# TalentOS — Documentación Técnica
## `api-gateway` · `training-service`

> Rama: `dev_zamudio` · Stack: Node.js 20 · Docker Compose 3.9

---

## Tabla de contenidos

1. [Arquitectura general](#1-arquitectura-general)
2. [api-gateway](#2-api-gateway)
   - [Stack y dependencias](#21-stack-y-dependencias)
   - [Estructura de archivos](#22-estructura-de-archivos)
   - [Flujo de una request](#23-flujo-de-una-request)
   - [Middleware de autenticación](#24-middleware-de-autenticación)
   - [Rutas públicas](#25-rutas-públicas)
   - [Proxies](#26-proxies)
   - [Convención HPM + Express](#27-convención-hpm--express-lección-aprendida)
   - [Headers propagados a microservicios](#28-headers-propagados-a-microservicios)
   - [Variables de entorno](#29-variables-de-entorno)
3. [training-service](#3-training-service)
   - [Stack y dependencias](#31-stack-y-dependencias)
   - [Estructura de archivos](#32-estructura-de-archivos)
   - [Base de datos](#33-base-de-datos)
   - [Modelos Sequelize](#34-modelos-sequelize)
   - [Middleware de autenticación](#35-middleware-de-autenticación)
   - [API — Referencia de endpoints](#36-api--referencia-de-endpoints)
   - [Lógica de negocio destacada](#37-lógica-de-negocio-destacada)
   - [Variables de entorno](#38-variables-de-entorno)
4. [Docker Compose](#4-docker-compose)
5. [Formatos de respuesta](#5-formatos-de-respuesta)
6. [Pruebas de humo](#6-pruebas-de-humo)

---

## 1. Arquitectura general

```
Cliente
  │
  ▼
api-gateway :3000          ← valida JWT, enruta
  ├── /api/auth/*      →   auth-service      :3001
  ├── /api/employees/* →   employee-service  :8080
  ├── /api/payroll/*   →   payroll-service   :9000
  └── /api/training/*  →   training-service  :3002
                                   │
                             training-db (PostgreSQL :5432)
```

Todos los servicios corren en la red Docker `talentos-net` (bridge).
El gateway es el **único punto de entrada** expuesto al exterior.
Los microservicios no validan JWT por sí solos; confían en los headers
`x-user-id` / `x-user-rol` que el gateway inyecta tras verificar el token.

---

## 2. api-gateway

### 2.1 Stack y dependencias

| Paquete | Versión | Rol |
|---|---|---|
| `express` | ^4.18.2 | Servidor HTTP |
| `http-proxy-middleware` | ^2.0.6 | Proxy reverso |
| `jsonwebtoken` | ^9.0.2 | Verificación de JWT |
| `dotenv` | ^16.3.1 | Variables de entorno |

### 2.2 Estructura de archivos

```
services/api-gateway/
├── Dockerfile
├── package.json
└── src/
    ├── index.js                   ← entry point, registro de middleware y proxies
    ├── config/
    │   └── services.js            ← URLs de cada microservicio (con fallback)
    ├── middleware/
    │   ├── authMiddleware.js      ← validación JWT global
    │   └── errorHandler.js        ← catch-all 502
    └── routes/
        ├── authProxy.js           ← /api/auth/*
        ├── employeeProxy.js       ← /api/employees/*
        ├── payrollProxy.js        ← /api/payroll/*
        └── trainingProxy.js       ← /api/training/*
```

### 2.3 Flujo de una request

```
Request entrante
      │
      ▼
GET /api/gateway/health ──── responde 200 directamente (antes del middleware JWT)
      │
      ▼
authenticate() ─── ruta pública? → next()
               └── no público  → verifica Bearer token
                                   ├── inválido → 401
                                   └── válido   → req.user = payload → next()
      │
      ▼
HPM proxy (path filter propio)
   ├── reescribe path: /api/<servicio>/* → /<servicio>/*
   ├── inyecta x-user-id / x-user-rol
   └── forwardea al microservicio
      │
      ▼
404 handler (si ningún proxy matcheó)
      │
      ▼
errorHandler (errores no capturados → 502)
```

### 2.4 Middleware de autenticación

**Archivo:** `src/middleware/authMiddleware.js`

```js
const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
req.user = payload;   // { userId, rol, iat, exp }
```

- Lee el header `Authorization: Bearer <token>`.
- Verifica firma con `JWT_SECRET` (el mismo secret que usa `auth-service`).
- En caso de error (`JsonWebTokenError`, `TokenExpiredError`) → **401**.
- Si pasa, adjunta el payload decodificado a `req.user` para que los proxies
  puedan inyectarlo como headers.

### 2.5 Rutas públicas

Las siguientes rutas bypasean la validación JWT (whitelist exacta método + path):

| Método | Path | Motivo |
|---|---|---|
| `POST` | `/api/auth/login` | Obtención del token inicial |
| `POST` | `/api/auth/refresh` | Renovación con refresh token |
| `GET` | `/api/auth/health` | Health check del auth-service |
| `GET` | `/api/gateway/health` | Health check del propio gateway |

### 2.6 Proxies

Cada proxy sigue exactamente el mismo patrón:

```js
// src/routes/trainingProxy.js (ejemplo)
module.exports = createProxyMiddleware('/api/training', {
  target:       services.training,          // http://training-service:3002
  changeOrigin: true,
  pathRewrite:  { '^/api/training': '/training' },
  onProxyReq:   (proxyReq, req) => {
    if (req.user) {
      proxyReq.setHeader('x-user-id',  String(req.user.userId));
      proxyReq.setHeader('x-user-rol', req.user.rol);
    }
  },
  onError: (err, req, res) => {
    res.status(502).json({ success: false, error: 'training-service no disponible', code: 502 });
  },
});
```

| Proxy | Path gateway | Reescribe a | Target |
|---|---|---|---|
| `authProxy` | `/api/auth/*` | `/auth/*` | `http://auth-service:3001` |
| `employeeProxy` | `/api/employees/*` | `/employees/*` | `http://employee-service:8080` |
| `payrollProxy` | `/api/payroll/*` | `/payroll/*` | `http://payroll-service:9000` |
| `trainingProxy` | `/api/training/*` | `/training/*` | `http://training-service:3002` |

### 2.7 Convención HPM + Express (lección aprendida)

> **Nunca** usar `app.use('/prefix', createProxyMiddleware({ ... }))`.

Cuando Express monta el proxy con `app.use('/api/auth', proxy)`, Express
quita el prefijo de `req.url` antes de pasárselo a HPM. HPM v2 recibe
la request sin su path filter y la descarta silenciosamente llamando
`next()`, resultando en 404 sin logs de error.

**Correcto:**
```js
// HPM maneja su propio path filtering
module.exports = createProxyMiddleware('/api/auth', { ... });
// En index.js:
app.use(authProxy);   // sin prefijo
```

### 2.8 Headers propagados a microservicios

Tras verificar el JWT, el gateway inyecta en cada request hacia
los microservicios:

| Header | Valor | Origen |
|---|---|---|
| `x-user-id` | ID numérico del usuario | `payload.userId` del JWT |
| `x-user-rol` | Rol del usuario (`ADMIN_RRHH`, `EMPLEADO`, …) | `payload.rol` del JWT |

Los microservicios **no necesitan** el JWT; sólo leen estos headers.

### 2.9 Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `JWT_SECRET` | ✅ | Secret compartido con `auth-service` para verificar tokens |
| `PORT` | ❌ | Puerto del gateway (default: `3000`) |
| `AUTH_SERVICE_URL` | ❌ | URL del auth-service (default: `http://auth-service:3001`) |
| `EMPLOYEE_SERVICE_URL` | ❌ | URL del employee-service (default: `http://employee-service:8080`) |
| `PAYROLL_SERVICE_URL` | ❌ | URL del payroll-service (default: `http://payroll-service:9000`) |
| `TRAINING_SERVICE_URL` | ❌ | URL del training-service (default: `http://training-service:3002`) |

---

## 3. training-service

### 3.1 Stack y dependencias

| Paquete | Versión | Rol |
|---|---|---|
| `express` | ^4.18.2 | Servidor HTTP |
| `sequelize` | ^6.35.1 | ORM para PostgreSQL |
| `pg` / `pg-hstore` | ^8.11.3 | Driver PostgreSQL |
| `dotenv` | ^16.3.1 | Variables de entorno |

### 3.2 Estructura de archivos

```
services/training-service/
├── Dockerfile
├── package.json
└── src/
    ├── index.js                         ← entry point, boot, registro de rutas
    ├── config/
    │   └── database.js                  ← instancia Sequelize
    ├── middleware/
    │   └── authMiddleware.js            ← authenticate + requireRole
    ├── models/
    │   ├── PlanInduccion.js
    │   ├── PlanCapacitacion.js
    │   ├── Capacitacion.js
    │   ├── AsistenciaCapacitacion.js
    │   ├── EvaluacionDesempeno.js
    │   └── CompromisoDeMejora.js
    ├── controllers/
    │   ├── induccionController.js
    │   ├── capacitacionController.js
    │   ├── evaluacionController.js
    │   └── compromisoController.js
    └── routes/
        ├── induccionRoutes.js
        ├── capacitacionRoutes.js
        ├── evaluacionRoutes.js
        └── compromisoRoutes.js
```

### 3.3 Base de datos

**Motor:** PostgreSQL 16 · **Base:** `talentos_training` · **Script init:** `db-scripts/training-db.sql`

```
planes_induccion
planes_capacitacion
capacitaciones
asistencias_capacitacion ─── UNIQUE(capacitacion_id, empleado_id)
evaluaciones_desempeno
compromisos_mejora
```

El script de init se ejecuta automáticamente cuando el contenedor `training-db`
arranca por primera vez (montado en `/docker-entrypoint-initdb.d/`).

Al bootear, `sequelize.sync()` garantiza que las tablas existan incluso si
el SQL de init no se ejecutó (por ejemplo, volumen ya existente).

**Índices creados:**

```sql
idx_induccion_empleado   ON planes_induccion(empleado_id)
idx_asist_capacitacion   ON asistencias_capacitacion(capacitacion_id)
idx_eval_empleado        ON evaluaciones_desempeno(empleado_id)
idx_compromisos_eval     ON compromisos_mejora(evaluacion_id)
idx_cap_plan             ON capacitaciones(plan_id)
```

### 3.4 Modelos Sequelize

Todos los modelos comparten las mismas convenciones:

- `createdAt` mapeado al campo `creado_en` de la DB.
- `updatedAt: false` — no se gestiona timestamp de actualización.
- Nombre de tabla explícito con `tableName` (snake_case, plural).

| Modelo | Tabla | Campos clave |
|---|---|---|
| `PlanInduccion` | `planes_induccion` | `empleado_id`, `fecha_inicio`, `fecha_fin`, `estado`, `formato_firmado_path` |
| `PlanCapacitacion` | `planes_capacitacion` | `anio` (UNIQUE), `estado`, `aprobado_por` |
| `Capacitacion` | `capacitaciones` | `plan_id`, `nombre`, `fecha`, `duracion_horas`, `fuente_necesidad`, `requiere_evaluacion` |
| `AsistenciaCapacitacion` | `asistencias_capacitacion` | `capacitacion_id`, `empleado_id` (UNIQUE juntos), `asistio`, `resultado_eval`, `puntaje` |
| `EvaluacionDesempeno` | `evaluaciones_desempeno` | `empleado_id`, `tipo`, `fecha_evaluacion`, `evaluador_id`, `resultado_general`, `pasa_directo` |
| `CompromisoDeMejora` | `compromisos_mejora` | `evaluacion_id`, `descripcion`, `fecha_limite`, `estado`, `capacitacion_vinculada_id` |

### 3.5 Middleware de autenticación

**Archivo:** `src/middleware/authMiddleware.js`

El servicio **no verifica JWT**. El gateway ya lo hizo. Solo lee los
headers propagados:

```js
const authenticate = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const rol    = req.headers['x-user-rol'];
  if (!userId) return res.status(401).json({ ... });
  req.user = { userId: parseInt(userId, 10), rol };
  next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.rol)) return res.status(403).json({ ... });
  next();
};
```

`requireRole` se usa para restringir operaciones de escritura a
`ADMIN_RRHH` (crear/editar planes, capacitaciones, registrar asistencia).

### 3.6 API — Referencia de endpoints

> Todas las rutas requieren `x-user-id` (vía gateway con JWT válido).
> Las marcadas con 🔒 requieren además rol `ADMIN_RRHH`.

#### Health

| Método | Path | Auth | Descripción |
|---|---|---|---|
| `GET` | `/training/health` | ❌ | Health check del servicio |

#### Inducción (`/training/induccion`)

| Método | Path | Auth | Descripción |
|---|---|---|---|
| `POST` | `/training/induccion` | ✅ | Crear plan de inducción — calcula `fecha_fin` automáticamente (+5 días hábiles) |
| `GET` | `/training/induccion/:empleadoId` | ✅ | Listar planes de un empleado (orden DESC por fecha) |
| `PUT` | `/training/induccion/:id/completar` | ✅ | Marcar inducción como completada |
| `PUT` | `/training/induccion/:id` | ✅ | Actualizar estado o path del formato firmado |
| `GET` | `/training/alertas/reinduccion` | ✅ | Empleados cuya última inducción completada fue hace >11 meses |

**Body `POST /training/induccion`:**
```json
{ "empleado_id": 1, "fecha_inicio": "2025-01-20" }
```

#### Capacitaciones (`/training/plan`, `/training/capacitaciones`, `/training/asistencia`)

| Método | Path | Auth | Descripción |
|---|---|---|---|
| `GET` | `/training/plan/:anio` | ✅ | Obtener plan anual con sus capacitaciones |
| `POST` | `/training/plan` | 🔒 | Crear plan anual (un plan por año, constraint UNIQUE) |
| `GET` | `/training/capacitaciones` | ✅ | Listar capacitaciones (filtro opcional `?plan_id=`) |
| `POST` | `/training/capacitaciones` | 🔒 | Agregar capacitación |
| `GET` | `/training/capacitaciones/:id` | ✅ | Detalle de capacitación |
| `PUT` | `/training/capacitaciones/:id` | 🔒 | Actualizar capacitación |
| `POST` | `/training/asistencia/:capId` | 🔒 | Registrar/actualizar asistencia de un empleado (upsert) |
| `GET` | `/training/asistencia/:capId` | ✅ | Listar asistencia de una capacitación |

#### Evaluaciones de desempeño (`/training/evaluaciones`)

| Método | Path | Auth | Descripción |
|---|---|---|---|
| `POST` | `/training/evaluaciones` | ✅ | Registrar evaluación (valida tipos y duplicado anual) |
| `GET` | `/training/evaluaciones/empleado/:empleadoId` | ✅ | Historial de un empleado |
| `GET` | `/training/evaluaciones/:id` | ✅ | Detalle de una evaluación |
| `PUT` | `/training/evaluaciones/:id` | ✅ | Actualizar evaluación |

**Tipos de evaluación válidos:** `prueba_directa_2m` · `prueba_temporal_3m` · `anual`

**Restricción:** Solo puede existir una evaluación de tipo `anual` por empleado por año calendario. Intento duplicado → **409**.

#### Compromisos de mejora (`/training/compromisos`)

| Método | Path | Auth | Descripción |
|---|---|---|---|
| `POST` | `/training/compromisos` | ✅ | Crear compromiso vinculado a una evaluación |
| `GET` | `/training/compromisos/:evalId` | ✅ | Listar compromisos de una evaluación (orden ASC por fecha límite) |
| `PUT` | `/training/compromisos/:id/cumplir` | ✅ | Marcar compromiso como `cumplido` |

### 3.7 Lógica de negocio destacada

#### Cálculo de `fecha_fin` en inducción

```js
const addBusinessDays = (startDate, days) => {
  const date = new Date(startDate + 'T12:00:00Z');
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const dow = date.getUTCDay();
    if (dow !== 0 && dow !== 6) added++;   // salta sábado (6) y domingo (0)
  }
  return date.toISOString().split('T')[0];
};
```

Con `fecha_inicio = 2025-01-20` (lunes) → `fecha_fin = 2025-01-27` (lunes siguiente, 5 días hábiles).

#### Upsert en asistencia

`POST /training/asistencia/:capId` hace upsert manual:
busca primero por `(capacitacion_id, empleado_id)` y actualiza si existe,
crea si no. La constraint UNIQUE en la tabla garantiza que no haya
duplicados aunque lleguen dos requests simultáneas.

#### Alertas de reinducción

```
GET /training/alertas/reinduccion
```

Busca todos los planes con `estado = 'completado'`, agrupa por `empleado_id`
tomando el más reciente, y filtra los que tienen `fecha_fin` anterior a
hace 11 meses. Resultado: lista de empleados que necesitan reinducirse.

### 3.8 Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `TRAINING_DB_HOST` | ✅ | Host de la DB (en Docker: `training-db`) |
| `TRAINING_DB_PORT` | ❌ | Puerto PostgreSQL (default: `5432`) |
| `TRAINING_DB_NAME` | ❌ | Nombre de la base (default: `talentos_training`) |
| `TRAINING_DB_USER` | ❌ | Usuario (default: `postgres`) |
| `TRAINING_DB_PASSWORD` | ✅ | Contraseña de la DB |
| `PORT` | ❌ | Puerto del servicio (default: `3002`) |
| `NODE_ENV` | ❌ | Entorno (`development` / `production`) |

---

## 4. Docker Compose

```yaml
training-db:
  image: postgres:16-alpine
  volumes:
    - training-db-data:/var/lib/postgresql/data
    - ./db-scripts/training-db.sql:/docker-entrypoint-initdb.d/init.sql
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres"]
    interval: 10s
    retries: 5

training-service:
  build: ./services/training-service
  ports: ["3002:3002"]
  depends_on:
    training-db:
      condition: service_healthy   # espera hasta que Postgres esté listo
```

El `depends_on` con `condition: service_healthy` evita que el servicio
arranque antes de que PostgreSQL esté aceptando conexiones.

**Levantar solo estos dos servicios:**
```bash
docker-compose up --build training-service training-db
```

---

## 5. Formatos de respuesta

Todos los servicios siguen la misma convención:

**Éxito:**
```json
{
  "success": true,
  "data":    { ... },
  "message": "OK"
}
```

**Error:**
```json
{
  "success": false,
  "error":   "Descripción del error",
  "code":    400
}
```

Códigos HTTP usados: `200` OK · `201` Created · `400` Bad Request ·
`401` Unauthorized · `403` Forbidden · `404` Not Found ·
`409` Conflict · `500` Internal Server Error · `502` Bad Gateway.

---

## 6. Pruebas de humo

```bash
# Obtener token
export TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@talentos.com","password":"Admin123!"}' \
  | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# 1. Health directo al training-service
curl http://localhost:3002/training/health

# 2. Health a través del gateway (prueba JWT + proxy)
curl http://localhost:3000/api/training/health \
  -H "Authorization: Bearer $TOKEN"

# 3. Crear plan de inducción
curl -X POST http://localhost:3000/api/training/induccion \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"empleado_id": 1, "fecha_inicio": "2025-01-20"}'
# Esperado: 201, fecha_fin: "2025-01-27"

# 4. Listar capacitaciones
curl http://localhost:3000/api/training/capacitaciones \
  -H "Authorization: Bearer $TOKEN"
# Esperado: 200, data: []

# 5. Sin token → debe rechazar
curl http://localhost:3000/api/training/capacitaciones
# Esperado: 401 {"success":false,"error":"Token requerido","code":401}
```
