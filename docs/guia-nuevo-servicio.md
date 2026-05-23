# TalentOS — Guía para implementar y consumir un nuevo microservicio

> Sigue esta guía cada vez que vayas a agregar un servicio nuevo a la plataforma.
> Todo lo que está aquí ya funciona así en `auth-service`, `api-gateway` y `training-service`.

---

## Tabla de contenidos

1. [Cómo está organizado TalentOS](#1-cómo-está-organizado-talentos)
2. [Paso a paso — crear el servicio](#2-paso-a-paso--crear-el-servicio)
3. [Registrarlo en Docker Compose](#3-registrarlo-en-docker-compose)
4. [Registrarlo en el API Gateway](#4-registrarlo-en-el-api-gateway)
5. [Autenticación — cómo funciona](#5-autenticación--cómo-funciona)
6. [Formato de respuestas](#6-formato-de-respuestas)
7. [Variables de entorno](#7-variables-de-entorno)
8. [Probar con Postman desde cualquier máquina](#8-probar-con-postman-desde-cualquier-máquina)
9. [Checklist antes de hacer commit](#9-checklist-antes-de-hacer-commit)

---

## 1. Cómo está organizado TalentOS

```
TalentOS/
├── docker-compose.yml         ← registro de todos los contenedores
├── .env                       ← credenciales (NO va en el repo)
├── db-scripts/                ← SQL de inicialización de cada DB
│   ├── auth-db.sql
│   ├── training-db.sql
│   └── <tu-servicio>-db.sql   ← crearás este
├── docs/                      ← documentación técnica
└── services/
    ├── api-gateway/           ← único punto de entrada, valida JWT
    ├── auth-service/          ← login, tokens, usuarios
    ├── training-service/      ← ejemplo completo para seguir
    └── <tu-servicio>/         ← crearás esta carpeta
```

**Flujo de una request:**

```
Postman / Frontend
      │
      ▼
api-gateway :3000   →  valida JWT  →  inyecta x-user-id y x-user-rol
      │
      ▼
tu-servicio :XXXX   →  lee headers  →  responde
```

El gateway es el **único** servicio expuesto al exterior.
Tu servicio nunca ve el JWT directamente — el gateway ya lo verificó.

---

## 2. Paso a paso — crear el servicio

### Estructura mínima (Node.js)

Crea la carpeta `services/<tu-servicio>/` con esta estructura:

```
services/mi-servicio/
├── Dockerfile
├── package.json
└── src/
    ├── index.js
    ├── config/
    │   └── database.js
    ├── middleware/
    │   └── authMiddleware.js
    ├── models/
    ├── controllers/
    └── routes/
```

---

### `Dockerfile`

Igual para todos los servicios Node — cópialo tal cual:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE <PUERTO>
CMD ["node", "src/index.js"]
```

---

### `package.json`

```json
{
  "name": "mi-servicio",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  },
  "dependencies": {
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "pg-hstore": "^2.3.4",
    "sequelize": "^6.35.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

---

### `src/config/database.js`

```js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect:  'postgres',
  host:     process.env.MI_SERVICIO_DB_HOST || 'mi-servicio-db',
  port:     parseInt(process.env.MI_SERVICIO_DB_PORT) || 5432,
  database: process.env.MI_SERVICIO_DB_NAME || 'talentos_mi_servicio',
  username: process.env.MI_SERVICIO_DB_USER || 'postgres',
  password: process.env.MI_SERVICIO_DB_PASSWORD,
  logging:  false,
});

module.exports = sequelize;
```

---

### `src/middleware/authMiddleware.js`

**Copia este archivo exactamente igual** en todos los servicios.
No verifica el JWT — eso ya lo hizo el gateway. Solo lee los headers:

```js
const authenticate = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const rol    = req.headers['x-user-rol'];

  if (!userId) {
    return res.status(401).json({ success: false, error: 'No autenticado', code: 401 });
  }

  req.user = { userId: parseInt(userId, 10), rol };
  next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.rol)) {
    return res.status(403).json({ success: false, error: 'Sin permisos suficientes', code: 403 });
  }
  next();
};

module.exports = { authenticate, requireRole };
```

Úsalo en tus rutas así:

```js
const { authenticate, requireRole } = require('../middleware/authMiddleware');

// Cualquier usuario autenticado
router.get('/recursos', authenticate, controller.listar);

// Solo administradores de RRHH
router.post('/recursos', authenticate, requireRole('ADMIN_RRHH'), controller.crear);
```

---

### `src/index.js`

```js
require('dotenv').config();

const express    = require('express');
const sequelize  = require('./config/database');
const misRutas   = require('./routes/misRutas');

const app = express();
app.use(express.json());

// Health — siempre público, sin autenticación
app.get('/mi-servicio/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'mi-servicio' }, message: 'OK' });
});

// Rutas del servicio
app.use('/mi-servicio', misRutas);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada', code: 404 });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[mi-servicio]', err);
  res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
});

// Boot
const PORT = process.env.PORT || XXXX;

sequelize.authenticate()
  .then(() => sequelize.sync())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[mi-servicio] Puerto ${PORT} | NODE_ENV=${process.env.NODE_ENV}`);
    });
  })
  .catch((err) => {
    console.error('[mi-servicio] No se pudo conectar a la DB:', err.message);
    process.exit(1);
  });
```

---

### `db-scripts/<tu-servicio>-db.sql`

Crea el script SQL de tu base de datos en la carpeta `db-scripts/`:

```sql
CREATE TABLE IF NOT EXISTS mis_recursos (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(200) NOT NULL,
  empleado_id INTEGER      NOT NULL,
  estado      VARCHAR(30)  DEFAULT 'activo',
  creado_en   TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mis_recursos_empleado ON mis_recursos(empleado_id);
```

---

## 3. Registrarlo en Docker Compose

Abre `docker-compose.yml` y agrega **dos bloques**: la base de datos y el servicio.

### Base de datos

```yaml
mi-servicio-db:
  image: postgres:16-alpine
  container_name: talentos-mi-servicio-db
  environment:
    POSTGRES_DB:       ${MI_SERVICIO_DB_NAME:-talentos_mi_servicio}
    POSTGRES_USER:     ${MI_SERVICIO_DB_USER:-postgres}
    POSTGRES_PASSWORD: ${MI_SERVICIO_DB_PASSWORD}
  volumes:
    - mi-servicio-db-data:/var/lib/postgresql/data
    - ./db-scripts/mi-servicio-db.sql:/docker-entrypoint-initdb.d/init.sql
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${MI_SERVICIO_DB_USER:-postgres}"]
    interval: 10s
    timeout: 5s
    retries: 5
  networks:
    - talentos-net
  restart: unless-stopped
```

### Servicio

```yaml
mi-servicio:
  build:
    context: ./services/mi-servicio
    dockerfile: Dockerfile
  container_name: talentos-mi-servicio
  ports:
    - "${MI_SERVICIO_PORT:-XXXX}:XXXX"
  env_file: .env
  environment:
    - NODE_ENV=development
    - PORT=XXXX
  depends_on:
    mi-servicio-db:
      condition: service_healthy
  networks:
    - talentos-net
  restart: unless-stopped
```

### Volumen

Al final del archivo, dentro de `volumes:`, agrega:

```yaml
volumes:
  mi-servicio-db-data:
    name: talentos-mi-servicio-db-data
```

---

## 4. Registrarlo en el API Gateway

Son **dos archivos** los que debes tocar en `services/api-gateway/src/`:

### `config/services.js` — agrega la URL de tu servicio

```js
module.exports = {
  auth:       process.env.AUTH_SERVICE_URL       || 'http://auth-service:3001',
  employee:   process.env.EMPLOYEE_SERVICE_URL   || 'http://employee-service:8080',
  payroll:    process.env.PAYROLL_SERVICE_URL    || 'http://payroll-service:9000',
  training:   process.env.TRAINING_SERVICE_URL   || 'http://training-service:3002',
  miServicio: process.env.MI_SERVICIO_URL        || 'http://mi-servicio:XXXX',  // ← agrega
};
```

### `routes/miServicioProxy.js` — crea el archivo del proxy

```js
const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/services');

module.exports = createProxyMiddleware('/api/mi-servicio', {
  target:       services.miServicio,
  changeOrigin: true,
  pathRewrite:  { '^/api/mi-servicio': '/mi-servicio' },
  onProxyReq:   (proxyReq, req) => {
    if (req.user) {
      proxyReq.setHeader('x-user-id',  String(req.user.userId));
      proxyReq.setHeader('x-user-rol', req.user.rol);
    }
  },
  onError: (err, req, res) => {
    console.error('[gateway → mi-servicio]', err.message);
    res.status(502).json({ success: false, error: 'mi-servicio no disponible', code: 502 });
  },
});
```

### `index.js` — registra el proxy

```js
const miServicioProxy = require('./routes/miServicioProxy');  // ← agrega
// ...
app.use(miServicioProxy);  // ← agrega junto a los demás
```

> ⚠️ **Importante:** Nunca hagas `app.use('/prefijo', proxy)`.
> Deja que HPM maneje su propio path filtering como se muestra arriba.
> Si lo montas con prefijo en Express, HPM descarta la request silenciosamente y recibirás 404 sin logs de error.

---

## 5. Autenticación — cómo funciona

```
1. Cliente hace POST /api/auth/login  →  recibe accessToken (JWT)

2. Cliente incluye el token en cada request:
   Authorization: Bearer <accessToken>

3. El gateway verifica el JWT con JWT_SECRET
   ├── inválido o expirado → 401, la request no llega a tu servicio
   └── válido → extrae userId y rol del payload

4. El gateway inyecta dos headers antes de forwardear:
   x-user-id: 42
   x-user-rol: ADMIN_RRHH

5. Tu servicio lee esos headers con authMiddleware.js
   req.user = { userId: 42, rol: 'ADMIN_RRHH' }
```

**Tu servicio no necesita el JWT ni JWT_SECRET.**
Solo lee `x-user-id` y `x-user-rol`.

### Roles disponibles

| Rol | Descripción |
|---|---|
| `ADMIN_RRHH` | Administrador de recursos humanos |
| `EMPLEADO` | Empleado regular |

---

## 6. Formato de respuestas

**Todos** los servicios deben responder con este formato. Sin excepciones.

### Éxito

```json
{
  "success": true,
  "data":    { ... },
  "message": "OK"
}
```

### Error

```json
{
  "success": false,
  "error":   "Descripción del error",
  "code":    400
}
```

### Códigos HTTP a usar

| Código | Cuándo usarlo |
|---|---|
| `200` | Consulta exitosa |
| `201` | Recurso creado |
| `400` | Datos inválidos o campos requeridos faltantes |
| `401` | No autenticado (sin `x-user-id`) |
| `403` | Autenticado pero sin el rol requerido |
| `404` | Recurso no encontrado |
| `409` | Conflicto (ej. duplicado) |
| `500` | Error interno del servidor |
| `502` | Microservicio no disponible (lo retorna el gateway) |

---

## 7. Variables de entorno

Agrega las variables de tu servicio en el archivo `.env` de la raíz:

```env
# Mi servicio
MI_SERVICIO_PORT=XXXX
MI_SERVICIO_DB_HOST=mi-servicio-db
MI_SERVICIO_DB_PORT=5432
MI_SERVICIO_DB_NAME=talentos_mi_servicio
MI_SERVICIO_DB_USER=postgres
MI_SERVICIO_DB_PASSWORD=talentos123
```

> El archivo `.env` **no se sube al repositorio**. Si estás en una máquina nueva,
> pídele el `.env` al equipo. Sin él, los contenedores no arrancan correctamente.

---

## 8. Probar con Postman desde cualquier máquina

### Requisitos

- Docker instalado
- El repositorio clonado
- El archivo `.env` en la raíz del proyecto

### Levantar los servicios

```bash
# Todos los servicios
docker-compose up --build

# Solo tu servicio y su DB (más rápido mientras desarrollas)
docker-compose up --build mi-servicio mi-servicio-db
```

### Obtener el token en Postman

Crea un request de login:

```
Método:  POST
URL:     http://localhost:3000/api/auth/login
Body:    raw → JSON
```

```json
{
  "email":    "admin@talentos.com",
  "password": "Admin123!"
}
```

En la pestaña **Tests** de ese request, pega esto para guardar el token automáticamente:

```js
const res = pm.response.json();
pm.environment.set("TOKEN", res.data.accessToken);
```

### Consumir tu servicio

A partir de ese momento, en todos tus requests usa:

```
URL:     http://localhost:3000/api/mi-servicio/mis-recursos
Header:  Authorization: Bearer {{TOKEN}}
```

Postman tomará el `{{TOKEN}}` del environment automáticamente.

### Desde otra máquina en la misma red

Reemplaza `localhost` por la **IP de la máquina** donde corren los contenedores:

```
http://192.168.X.X:3000/api/mi-servicio/mis-recursos
```

---

## 9. Checklist antes de hacer commit

Antes de subir tu servicio al repositorio, verifica que:

- [ ] `Dockerfile` creado en `services/mi-servicio/`
- [ ] `package.json` con dependencias correctas
- [ ] `src/index.js` con health check en `GET /mi-servicio/health`
- [ ] `src/middleware/authMiddleware.js` copiado (no modificar la lógica)
- [ ] Modelos Sequelize con `tableName` explícito y `createdAt: 'creado_en'`
- [ ] Todas las rutas protegidas usan `authenticate`
- [ ] Las rutas de escritura usan `requireRole('ADMIN_RRHH')`
- [ ] Respuestas siguen el formato `{ success, data, message }` / `{ success, error, code }`
- [ ] `db-scripts/mi-servicio-db.sql` creado con `CREATE TABLE IF NOT EXISTS`
- [ ] Servicio y DB registrados en `docker-compose.yml`
- [ ] Proxy creado en `services/api-gateway/src/routes/miServicioProxy.js`
- [ ] Proxy registrado en `services/api-gateway/src/index.js`
- [ ] URL agregada en `services/api-gateway/src/config/services.js`
- [ ] Variables de entorno documentadas (pero el `.env` no se sube)
- [ ] Probado con `docker-compose up --build` desde cero
- [ ] Health check responde 200 directo y a través del gateway
