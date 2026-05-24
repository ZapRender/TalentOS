# Auth Service — TalentOS

Microservicio de autenticación y gestión de usuarios para TalentOS.  
Node.js + Express | Puerto `3001` | PostgreSQL (`auth-db`)

---

## Estructura de archivos

```
services/auth-service/
├── package.json              # Dependencias del servicio
├── Dockerfile                # Imagen Docker (node:20-alpine)
└── src/
    ├── index.js              # Entry point — monta rutas y arranca el servidor
    ├── config/
    │   └── database.js       # Pool de conexión a PostgreSQL
    ├── services/
    │   ├── jwtService.js     # Firmar y verificar tokens JWT
    │   └── emailService.js   # Envío de emails vía SMTP (Nodemailer)
    ├── middleware/
    │   └── authMiddleware.js # Verificación de JWT y control de roles
    ├── models/
    │   ├── userModel.js      # Queries sobre tabla usuarios + roles
    │   └── refreshTokenModel.js # Queries sobre tabla refresh_tokens
    ├── controllers/
    │   ├── authController.js # Lógica de login, logout, refresh, me, verify
    │   └── userController.js # CRUD de usuarios (solo ADMIN_RRHH)
    └── routes/
        ├── authRoutes.js     # Rutas /auth/*
        └── userRoutes.js     # Rutas /auth/users/*
```

---

## Dependencias instaladas

| Paquete | Para qué se usa |
|---------|----------------|
| `express` | Framework HTTP |
| `pg` | Cliente PostgreSQL (pool de conexiones) |
| `bcrypt` | Hash de passwords (10 rounds) |
| `jsonwebtoken` | Firmar y verificar JWT |
| `nodemailer` | Envío de emails SMTP |
| `dotenv` | Leer variables de entorno desde `.env` |

No se agregaron dependencias innecesarias. `crypto.randomUUID()` (Node.js nativo) reemplaza al paquete `uuid`.

---

## Endpoints

Todos los endpoints siguen el mismo formato de respuesta:

```json
// Éxito
{ "success": true,  "data": { ... }, "message": "..." }

// Error
{ "success": false, "error": "...", "code": 400 }
```

### Rutas públicas (sin token)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET`  | `/auth/health` | Healthcheck — devuelve `status: ok` |
| `POST` | `/auth/login` | Autentica con email + password |
| `POST` | `/auth/refresh` | Renueva el access token con un refresh token |
| `POST` | `/auth/verify` | Verifica si un JWT es válido (usado por otros servicios) |

### Rutas protegidas (requieren `Authorization: Bearer <token>`)

| Método | Ruta | Roles permitidos |
|--------|------|-----------------|
| `POST` | `/auth/logout` | Cualquier usuario autenticado |
| `GET`  | `/auth/me` | Cualquier usuario autenticado |
| `GET`  | `/auth/users` | Solo `ADMIN_RRHH` |
| `POST` | `/auth/users` | Solo `ADMIN_RRHH` |
| `PUT`  | `/auth/users/:id` | Solo `ADMIN_RRHH` |
| `PUT`  | `/auth/users/:id/toggle` | Solo `ADMIN_RRHH` |
| `PUT`  | `/auth/users/:id/password` | Cualquier usuario autenticado* |

> *`/password`: un usuario solo puede cambiar su propio password (y debe enviar el actual).  
> Un `ADMIN_RRHH` puede cambiar el de cualquier usuario sin necesitar el password actual.

---

## Cómo funciona cada parte

### `config/database.js`
Crea un `Pool` de conexiones a PostgreSQL usando las variables de entorno:
- `AUTH_DB_HOST` → `auth-db` (nombre del contenedor en la red Docker)
- `AUTH_DB_PORT` → `5432`
- `AUTH_DB_NAME` → `talentos_auth`
- `AUTH_DB_USER` / `AUTH_DB_PASSWORD`

### `services/jwtService.js`
Tres funciones simples:
- `sign(payload)` → genera un access token que expira en `JWT_EXPIRES_IN` (8h por defecto)
- `signRefresh(payload)` → genera un refresh token que expira en `JWT_REFRESH_EXPIRES_IN` (7d)
- `verify(token)` → valida la firma y devuelve el payload, o lanza excepción si es inválido

El payload del JWT contiene: `userId`, `email`, `nombre`, `rol`, `empleadoId`.

### `services/emailService.js`
Usa Nodemailer con la configuración SMTP del `.env` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`).  
Solo tiene una función: `sendTempPassword(email, nombre, tempPassword)` que envía un email HTML con la contraseña temporal al crear un usuario.

### `middleware/authMiddleware.js`
Dos middlewares:

**`authenticate`** — lee el header `Authorization: Bearer <token>`, lo verifica con `jwtService.verify()` y adjunta el payload a `req.user`. Si falta el header o el token es inválido devuelve `401`.

**`requireRole(...roles)`** — factory que devuelve un middleware. Verifica que `req.user.rol` esté dentro de los roles permitidos. Si no, devuelve `403`.

### `models/userModel.js`
Todas las queries de `findByEmail` y `findById` hacen JOIN con `usuario_roles` y `roles` para que el campo `rol` siempre esté disponible en el resultado.

Las operaciones `create` y `update` usan **transacciones** (`BEGIN / COMMIT / ROLLBACK`) porque tocan dos tablas a la vez (`usuarios` + `usuario_roles`). Si algo falla, ningún cambio queda a medias.

### `models/refreshTokenModel.js`
Maneja la tabla `refresh_tokens`. El método `findByToken` filtra directamente en la query:
```sql
WHERE token = $1 AND revocado = false AND expira_en > NOW()
```
Así Postgres descarta tokens expirados o revocados sin lógica extra en Node.

### `controllers/authController.js`

**`login`**
1. Busca el usuario por email
2. Verifica que esté activo
3. Compara la password con `bcrypt.compare`
4. Si todo es correcto, genera un access token (JWT) y un refresh token (UUID aleatorio)
5. Guarda el refresh token en la DB con su fecha de expiración (7 días)
6. Actualiza `ultimo_login` del usuario

**`logout`**
- Si se envía un `refreshToken` en el body, revoca solo ese token
- Si no se envía nada, revoca todos los refresh tokens del usuario (cierre de sesión total)

**`refresh`**
1. Busca el refresh token en la DB (debe existir, no estar revocado, y no haber expirado)
2. Revoca el token actual (**rotación de tokens** — el viejo nunca se puede reusar)
3. Genera un nuevo access token y un nuevo refresh token
4. Guarda el nuevo refresh token en la DB

**`me`**
Devuelve los datos del usuario autenticado (sin el `password_hash`).

**`verify`**
Solo llama a `jwtService.verify(token)` y devuelve el payload. Lo usan los otros microservicios (employee-service, payroll-service, etc.) para validar tokens sin acceder a la DB.

### `controllers/userController.js`

**`create`**
1. Valida que lleguen `nombre`, `email` y `rol`
2. Genera una contraseña temporal de 12 caracteres aleatorios
3. Hashea la contraseña con bcrypt (10 rounds)
4. Crea el usuario y asigna el rol (en transacción)
5. Envía el email con la contraseña temporal — si el SMTP falla, el usuario queda creado igual (el error se loguea pero no rompe la respuesta)

**`update`**
Actualiza `nombre`, `apellidos`, `empleado_id` y/o `rol`. Si se cambia el rol, elimina la asignación anterior y asigna la nueva (dentro de transacción).

**`toggleActive`**
Hace `activo = NOT activo` directamente en SQL. Un usuario desactivado no puede hacer login.

**`changePassword`**
- Usuarios normales: deben enviar `passwordActual` (se verifica con bcrypt) y `passwordNuevo`
- `ADMIN_RRHH`: puede resetear cualquier contraseña sin necesitar la actual
- `passwordNuevo` debe tener al menos 8 caracteres

---

## Flujo de autenticación

```
Cliente                    Auth Service                  PostgreSQL
  │                             │                             │
  │── POST /auth/login ────────>│                             │
  │   { email, password }       │── SELECT usuarios + rol ──>│
  │                             │<─ usuario + password_hash ──│
  │                             │   bcrypt.compare()          │
  │                             │── INSERT refresh_tokens ───>│
  │                             │── UPDATE ultimo_login ─────>│
  │<── { accessToken,          │                             │
  │      refreshToken, user } ──│                             │
  │                             │                             │
  │── GET /auth/me ────────────>│                             │
  │   Authorization: Bearer ... │   jwtService.verify()       │
  │                             │── SELECT usuario ──────────>│
  │<── { user data } ──────────│                             │
  │                             │                             │
  │── POST /auth/refresh ──────>│                             │
  │   { refreshToken }          │── SELECT refresh_tokens ───>│
  │                             │── UPDATE (revocado=true) ───>│
  │                             │── INSERT nuevo refresh ────>│
  │<── { accessToken,          │                             │
  │      refreshToken (nuevo) } │                             │
```

---

## Variables de entorno requeridas

El servicio lee estas variables del `.env` (definidas en `.env.example`):

```env
# JWT
JWT_SECRET=...
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d

# Base de datos
AUTH_DB_HOST=auth-db
AUTH_DB_PORT=5432
AUTH_DB_NAME=talentos_auth
AUTH_DB_USER=postgres
AUTH_DB_PASSWORD=...

# SMTP (para emails de contraseña temporal)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=TalentOS <...>
```

---

## Decisiones de diseño

| Decisión | Por qué |
|----------|---------|
| Refresh tokens como UUID en DB | Permite revocarlos individualmente o en masa, a diferencia de los JWT que no se pueden invalidar |
| Rotación de refresh tokens | Cada uso del refresh token genera uno nuevo y revoca el anterior, eliminando el riesgo de reutilización |
| Transacciones en create/update | Usuario y rol son inseparables — si falla uno, no queda un usuario sin rol ni viceversa |
| Email como fire-and-forget | Un error de SMTP no debe impedir la creación del usuario |
| `crypto.randomUUID()` nativo | Evita agregar la dependencia `uuid` para algo que Node.js ya trae incluido |
| JOIN de rol en todas las queries | El payload del JWT necesita el `rol` — se construye desde el modelo, no desde la capa de negocio |
