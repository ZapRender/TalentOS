# TalentOS — Documentación Técnica
## `payroll-service`

> Rama: `dev_zamudio` · Stack: PHP 8.2 · Apache 2.4 · MySQL 8 · Sin framework, sin composer

---

## Tabla de contenidos

1. [Arquitectura general](#1-arquitectura-general)
2. [Stack y dependencias](#2-stack-y-dependencias)
3. [Estructura de archivos](#3-estructura-de-archivos)
4. [Flujo de una request](#4-flujo-de-una-request)
5. [Autenticación JWT en PHP puro](#5-autenticación-jwt-en-php-puro)
6. [Control de roles](#6-control-de-roles)
7. [Router manual](#7-router-manual)
8. [Modelos](#8-modelos)
9. [API — Referencia de endpoints](#9-api--referencia-de-endpoints)
10. [Lógica de negocio — Liquidación de nómina](#10-lógica-de-negocio--liquidación-de-nómina)
11. [Lógica de negocio — Liquidación de contrato](#11-lógica-de-negocio--liquidación-de-contrato)
12. [Comunicación inter-servicio](#12-comunicación-inter-servicio)
13. [Utilidades](#13-utilidades)
14. [Docker Compose](#14-docker-compose)
15. [Variables de entorno](#15-variables-de-entorno)
16. [Lecciones aprendidas — Gotchas PHP/Apache](#16-lecciones-aprendidas--gotchas-phpapache)
17. [Pruebas de humo](#17-pruebas-de-humo)

---

## 1. Arquitectura general

```
Cliente / Gateway
      │
      ▼
api-gateway :3000
      │  valida JWT, inyecta x-user-id / x-user-rol, forwardea Authorization header
      ▼
payroll-service :9000   (Apache 2.4 + PHP 8.2)
      │  valida JWT propio (HMAC-SHA256 puro PHP)
      │  consulta employee-service para liquidación
      ▼
payroll-db (MySQL 8, red interna talentos-net)
```

A diferencia de los servicios Node, el `payroll-service` **valida el JWT por sí mismo** además de leer los headers `x-user-id` / `x-user-rol`. El gateway sigue siendo la puerta principal, pero el servicio no confía ciegamente en los headers.

---

## 2. Stack y dependencias

| Componente | Versión | Rol |
|---|---|---|
| PHP | 8.2 | Runtime |
| Apache | 2.4 | Servidor HTTP |
| PDO + pdo_mysql | nativo | Acceso a MySQL |
| MySQL | 8 | Base de datos |

**Sin framework. Sin composer.** Todo el código es PHP puro con `require_once`.

---

## 3. Estructura de archivos

```
services/payroll-service/
├── Dockerfile                         ← php:8.2-apache + pdo_mysql
├── apache.conf                        ← VirtualHost en puerto 9000
├── .htaccess                          ← Rewrite rules + Authorization header pass-through
├── index.php                          ← Entry point: headers, autoload, router, dispatch
└── src/
    ├── config/
    │   ├── Env.php                    ← Lee $_ENV / getenv()
    │   └── Database.php               ← Singleton PDO MySQL
    ├── middleware/
    │   ├── JwtMiddleware.php          ← Valida JWT con HMAC-SHA256 puro PHP
    │   └── RoleMiddleware.php         ← Verifica rol del usuario autenticado
    ├── routes/
    │   ├── Router.php                 ← Enrutador REST manual con params nombrados
    │   ├── nomina.routes.php          ← Rutas /payroll/periodos y /payroll/nomina
    │   ├── novedad.routes.php         ← Rutas /payroll/novedades
    │   ├── afiliacion.routes.php      ← Rutas /payroll/afiliaciones
    │   ├── liquidacion.routes.php     ← Rutas /payroll/liquidacion-contrato
    │   └── pila.routes.php            ← Rutas /payroll/pila
    ├── models/
    │   ├── PeriodoNomina.php
    │   ├── LiquidacionNomina.php
    │   ├── Novedad.php
    │   ├── ConceptoLiquidado.php
    │   ├── Afiliacion.php
    │   ├── LiquidacionContrato.php
    │   └── PlanillaPILA.php
    ├── controllers/
    │   ├── NominaController.php       ← Períodos, liquidar, aprobar, desprendibles, Excel
    │   ├── NovedadController.php      ← CRUD de novedades
    │   ├── AfiliacionController.php   ← Registro y retiro de afiliaciones
    │   ├── LiquidacionController.php  ← Cálculo y aprobación de liquidación de contrato
    │   └── PILAController.php         ← Generación y descarga de planilla PILA
    └── utils/
        ├── PDFGenerator.php           ← Desprendible HTML imprimible (sin librería)
        ├── ExcelExporter.php          ← SpreadsheetML (abre en Excel sin librería)
        ├── PILAGenerator.php          ← Archivo plano Resolución 2388 de 2016
        └── EmailSender.php            ← SMTP puro con fsockopen() (sin PHPMailer)
```

---

## 4. Flujo de una request

```
Request HTTP
      │
      ▼
Apache → .htaccess rewrite → index.php
      │
      ▼
Headers globales (Content-Type: application/json, CORS)
      │
      ▼
OPTIONS? → 204 y exit
      │
      ▼
Router::dispatch()
   ├── Busca ruta por METHOD + URI (regex con params nombrados)
   ├── Ejecuta middleware stack en orden:
   │     JwtMiddleware → valida Bearer token → setea JwtMiddleware::$user
   │     RoleMiddleware (si aplica) → verifica rol
   └── Llama al método del controller con $params
      │
      ▼
Controller → Model (PDO) → JSON response
```

Si ninguna ruta coincide → 404 JSON.
Si hay excepción no capturada → `set_exception_handler` → 500 JSON + log.

---

## 5. Autenticación JWT en PHP puro

**Archivo:** `src/middleware/JwtMiddleware.php`

No usa ninguna librería. Implementa la validación HMAC-SHA256 manualmente:

```php
// 1. Separar header.payload.signature
$parts = explode('.', $token);  // debe tener exactamente 3

// 2. Reconstruir firma esperada
$expected = base64url_encode(
    hash_hmac('sha256', "$headerB64.$payloadB64", $secret, true)
);

// 3. Comparar con timing seguro (evita timing attacks)
if (!hash_equals($expected, $signatureB64)) { abort(401); }

// 4. Decodificar payload y verificar expiración
$payload = json_decode(base64url_decode($payloadB64), true);
if ($payload['exp'] < time()) { abort(401); }
```

El payload decodificado queda disponible en `JwtMiddleware::$user` para todos los controllers:

```php
$userId = (int)JwtMiddleware::$user['userId'];
$rol    = JwtMiddleware::$user['rol'];
```

**Rutas públicas** (sin token): solo `/payroll/health`.

---

## 6. Control de roles

**Archivo:** `src/middleware/RoleMiddleware.php`

```php
// En el archivo de rutas:
$gerente  = [JwtMiddleware::handle(), RoleMiddleware::require('GERENTE', 'ADMIN_RRHH')];
$contador = [JwtMiddleware::handle(), RoleMiddleware::require('CONTADOR', 'ADMIN_RRHH')];

$router->post('/payroll/periodos/:id/aprobar',           ..., $gerente);
$router->post('/payroll/liquidacion-contrato/:id/aprobar',..., $contador);
```

| Rol | Permisos especiales |
|---|---|
| `ADMIN_RRHH` | Acceso total |
| `GERENTE` | Aprobar períodos de nómina |
| `CONTADOR` | Aprobar liquidaciones de contrato |
| `EMPLEADO` | Solo lectura en rutas que lo permitan |
| `LIDER_PROCESO` | Solo lectura en rutas que lo permitan |

---

## 7. Router manual

**Archivo:** `src/routes/Router.php`

Enrutador REST sin dependencias externas. Convierte `:param` en grupos de captura con nombre:

```php
// Registro
$router->get('/payroll/periodos/:id', fn($p) => NominaController::getPeriodo($p), $middleware);

// Internamente convierte a regex:
// #^/payroll/periodos/(?P<id>[^/]+)$#

// El handler recibe:
// $p = ['id' => '5']
```

Soporta `GET`, `POST`, `PUT`, `DELETE`.
El middleware stack se ejecuta en orden; si alguno llama `exit()`, la cadena se detiene.

---

## 8. Modelos

Todos los modelos son clases estáticas con queries PDO directas. Sin ORM.

| Modelo | Tabla MySQL | Operaciones clave |
|---|---|---|
| `PeriodoNomina` | `periodos_nomina` | findAll, findById, create, updateEstadoYTotal, aprobar |
| `LiquidacionNomina` | `liquidaciones_nomina` | findByPeriodo, findByEmpleadoYPeriodo, upsert |
| `Novedad` | `novedades` | findByPeriodo, findByEmpleadoYPeriodo, create, update, delete |
| `ConceptoLiquidado` | `conceptos_liquidados` | findByLiquidacion, deleteByLiquidacion, createMany |
| `Afiliacion` | `afiliaciones` | findByEmpleado, findById, create, retirar |
| `LiquidacionContrato` | `liquidaciones_contrato` | findById, create, aprobar |
| `PlanillaPILA` | `planillas_pila` | findAll, findByMes, findById, create, updateArchivo |

**Convenciones:**
- Singleton PDO en `Database::getInstance()`
- `PDO::ERRMODE_EXCEPTION` — errores PHP nativos
- `PDO::FETCH_ASSOC` — arrays asociativos, sin índices numéricos
- Prepared statements en todas las queries con datos externos

---

## 9. API — Referencia de endpoints

> Todas las rutas requieren `Authorization: Bearer <token>` salvo `/health`.
> Las marcadas con el rol requieren además ese rol específico.

### Health

| Método | Path | Auth | Descripción |
|---|---|---|---|
| `GET` | `/payroll/health` | ❌ | Health check del servicio |

### Nómina — Períodos

| Método | Path | Auth | Descripción |
|---|---|---|---|
| `GET` | `/payroll/periodos` | ✅ | Listar todos los períodos |
| `GET` | `/payroll/periodos/:id` | ✅ | Detalle de un período |
| `POST` | `/payroll/periodos` | ✅ | Crear período (anio, mes, quincena, fechas) |
| `POST` | `/payroll/periodos/:id/liquidar` | ✅ | Ejecutar liquidación de nómina |
| `POST` | `/payroll/periodos/:id/aprobar` | 🔒 GERENTE | Aprobar nómina liquidada |
| `POST` | `/payroll/periodos/:id/enviar-desp` | ✅ | Enviar desprendibles por email |

**Body `POST /payroll/periodos`:**
```json
{
  "anio": 2025,
  "mes": 1,
  "quincena": 1,
  "fecha_inicial": "2025-01-01",
  "fecha_final": "2025-01-15",
  "fecha_pago": "2025-01-17"
}
```

**Estados de un período:** `abierto` → `liquidado` → `aprobado` → `pagado`

### Nómina — Reportes

| Método | Path | Auth | Descripción |
|---|---|---|---|
| `GET` | `/payroll/nomina/:periodoId/excel` | ✅ | Exportar liquidación a Excel (SpreadsheetML) |
| `GET` | `/payroll/nomina/:periodoId/desprendible/:empleadoId` | ✅ | Desprendible HTML imprimible del empleado |

### Novedades

| Método | Path | Auth | Descripción |
|---|---|---|---|
| `GET` | `/payroll/novedades/:periodoId` | ✅ | Listar novedades de un período |
| `POST` | `/payroll/novedades` | ✅ | Registrar novedad |
| `PUT` | `/payroll/novedades/:id` | ✅ | Actualizar novedad |
| `DELETE` | `/payroll/novedades/:id` | ✅ | Eliminar novedad |

**Body `POST /payroll/novedades`:**
```json
{
  "empleado_id": 1,
  "periodo_id": 1,
  "tipo_novedad": "unica",
  "concepto_codigo": "996",
  "concepto_descripcion": "Bonificación",
  "cantidad": 1,
  "valor": 500000,
  "es_deduccion": false,
  "fecha_novedad": "2025-01-10"
}
```

**Tipos de novedad:** `unica` · `periodica` · `liquidacion`

### Afiliaciones

| Método | Path | Auth | Descripción |
|---|---|---|---|
| `POST` | `/payroll/afiliaciones` | ✅ | Registrar afiliación ARL/EPS/Caja/Pensión |
| `GET` | `/payroll/afiliaciones/:empleadoId` | ✅ | Listar afiliaciones de un empleado |
| `PUT` | `/payroll/afiliaciones/:id/retirar` | ✅ | Desafiliar (agrega fecha_desafiliacion) |

**Tipos de entidad:** `arl` · `eps` · `caja_compensacion` · `pension`

### Liquidación de contrato

| Método | Path | Auth | Descripción |
|---|---|---|---|
| `POST` | `/payroll/liquidacion-contrato` | ✅ | Calcular liquidación definitiva |
| `GET` | `/payroll/liquidacion-contrato/:id` | ✅ | Detalle de la liquidación |
| `POST` | `/payroll/liquidacion-contrato/:id/aprobar` | 🔒 CONTADOR | Aprobar liquidación |

**Motivos de retiro:** `renuncia` · `no_renovacion` · `despido_justa` · `despido_sin_justa` · `mutuo_acuerdo`

**Body `POST /payroll/liquidacion-contrato`:**
```json
{
  "empleado_id": 1,
  "fecha_inicio": "2023-03-01",
  "fecha_terminacion": "2025-01-31",
  "motivo_retiro": "renuncia",
  "salario": 3000000,
  "base_vacaciones": 3000000,
  "base_cesantias": 3000000,
  "base_primas": 3000000
}
```

### PILA

| Método | Path | Auth | Descripción |
|---|---|---|---|
| `GET` | `/payroll/pila` | ✅ | Listar planillas PILA generadas |
| `POST` | `/payroll/pila/generar` | ✅ | Generar planilla PILA del mes |
| `GET` | `/payroll/pila/:mes/archivo-plano` | ✅ | Descargar archivo plano (`:mes` = `2025-01`) |

---

## 10. Lógica de negocio — Liquidación de nómina

**Método:** `NominaController::liquidar()` → `POST /payroll/periodos/:id/liquidar`

### Condiciones previas
- El período debe estar en estado `abierto`
- El `employee-service` debe estar disponible

### Proceso por empleado

```
Para cada empleado activo del employee-service:

1. DEVENGADOS
   ├── 001 Salario básico        = salario_mensual / 2   (quincena)
   └── 020 Auxilio transporte    = 100,000               (solo si salario ≤ 2 SMMLV = $2,847,000)
       + Novedades no-deducción del período

2. DEDUCCIONES
   ├── 913 EPS Salud             = salario_mensual × 4% / 2
   ├── 810 AFP Pensión           = salario_mensual × 4% / 2
   ├── 915 Fondo Solidaridad     = salario_mensual × 1% / 2  (solo si salario > 4 SMMLV = $5,694,000)
   └── Novedades marcadas como deducción del período

3. neto_pagar = total_devengado - total_deducido

4. Upsert en liquidaciones_nomina (no duplica si se reliquida)
5. Regenera conceptos_liquidados
```

### Constantes 2025

| Concepto | Valor |
|---|---|
| SMMLV | $1,423,500 |
| Auxilio de transporte | $200,000 |
| Deduc. Salud empleado | 4% |
| Deduc. Pensión empleado | 4% |
| Fondo solidaridad | 1% (si salario > 4 SMMLV) |

### Códigos de concepto

| Código | Concepto | Tipo |
|---|---|---|
| `001` | Salario básico | Devengado |
| `020` | Auxilio de transporte | Devengado |
| `072` | Auxilio rodamiento | Devengado (novedad) |
| `105` | Recargo nocturno | Devengado (novedad) |
| `301` | Fondo empleados Crecer | Devengado (novedad) |
| `996` | Bonificaciones | Devengado (novedad) |
| `810` | AFP Pensión | Deducción |
| `913` | EPS Salud | Deducción |
| `915` | Fondo Solidaridad Pensional | Deducción |

### Resultado
- Estado del período pasa a `liquidado`
- `total_neto` del período actualizado
- Respuesta incluye: `liquidadas`, `total_neto`, `errores` (por empleado)

---

## 11. Lógica de negocio — Liquidación de contrato

**Método:** `LiquidacionController::calcular()` → `POST /payroll/liquidacion-contrato`

Fórmulas según ley laboral colombiana:

| Concepto | Fórmula |
|---|---|
| **Vacaciones** | `(días_trabajados / 360) × 15 × (base_vacaciones / 30)` |
| **Cesantías** | `(base_cesantias × días_trabajados) / 360` |
| **Intereses cesantías** | `cesantías × 0.12 × (días_trabajados / 360)` |
| **Prima** | `(base_primas × días_trabajados) / 360` |
| **Indemnización** | Solo si `motivo_retiro = despido_sin_justa`: `30 días × años (hasta 10) + 20 días × años adicionales` |

```
total_liquidacion = vacaciones + cesantias + intereses_cesantias + prima + indemnizacion
```

**Bases:**
- `base_vacaciones` — promedio de los últimos 12 meses trabajados
- `base_cesantias` — desde el 1 de enero del año en curso
- `base_primas` — desde el 1 de julio del año en curso

**Estados:** `borrador` → `enviado_contador` → `aprobado` → `pagado`

---

## 12. Comunicación inter-servicio

Al liquidar nómina, el payroll-service consulta directamente al employee-service **sin pasar por el gateway**:

```php
// Empleados activos
GET http://employee-service:8080/employees?estado=activo

// Empleado individual
GET http://employee-service:8080/employees/{id}
```

La llamada se hace con `curl` en PHP, **forwardeando el JWT original**:

```php
$token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';  // "Bearer eyJ..."
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: {$token}"]);
```

Si el employee-service no responde → `502` con mensaje `employee-service no disponible`.

---

## 13. Utilidades

### PDFGenerator
Genera desprendibles de pago como HTML imprimible con CSS de impresión.
El usuario abre la URL en el navegador y usa `Ctrl+P → Guardar como PDF`.
No requiere ninguna librería externa.

### ExcelExporter
Genera archivos SpreadsheetML (XML) que Excel y LibreOffice abren nativamente.
Se sirven con `Content-Type: application/vnd.ms-excel`.

### PILAGenerator
Genera el archivo plano según **Resolución 2388 de 2016**:
- **Tipo 01** — Encabezado con datos del empleador y período
- **Tipo 02** — Un registro por empleado (IBC, aportes salud, pensión, ARL clase I)
- **Tipo 09** — Registro totalizador

Los archivos se guardan en `/var/www/html/uploads/pila/` (volumen `talentos-archivos-hv`).

### EmailSender
Cliente SMTP puro con `fsockopen()`. Soporta STARTTLS.
Envía desprendibles como HTML en el cuerpo del correo.
Si el SMTP falla, retorna `false` sin romper el flujo principal.

---

## 14. Docker Compose

```yaml
payroll-db:
  image: mysql:8
  volumes:
    - payroll-db-data:/var/lib/mysql
    - ./db-scripts/payroll-db.sql:/docker-entrypoint-initdb.d/init.sql
  healthcheck:
    test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
    interval: 10s
    retries: 5

payroll-service:
  build: ./services/payroll-service    # php:8.2-apache
  ports: ["9000:9000"]
  volumes:
    - archivos-hv:/var/www/html/uploads
  depends_on:
    payroll-db:
      condition: service_healthy
```

**Levantar solo estos dos:**
```bash
docker-compose up --build payroll-service payroll-db
```

---

## 15. Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `JWT_SECRET` | ✅ | Secret para verificar tokens (igual que auth-service y gateway) |
| `PAYROLL_DB_HOST` | ✅ | Host MySQL (en Docker: `payroll-db`) |
| `PAYROLL_DB_PORT` | ❌ | Puerto (default: `3306`) |
| `PAYROLL_DB_NAME` | ❌ | Base de datos (default: `talentos_payroll`) |
| `PAYROLL_DB_USER` | ✅ | Usuario MySQL |
| `PAYROLL_DB_PASSWORD` | ✅ | Contraseña MySQL |
| `SMTP_HOST` | ❌ | Servidor SMTP para emails (default: `smtp.gmail.com`) |
| `SMTP_PORT` | ❌ | Puerto SMTP (default: `587`) |
| `SMTP_USER` | ❌ | Usuario SMTP |
| `SMTP_PASS` | ❌ | Contraseña SMTP |
| `SMTP_FROM` | ❌ | Remitente de los emails |

---

## 16. Lecciones aprendidas — Gotchas PHP/Apache

### Apache no reenvía el header Authorization a PHP

Por defecto Apache intercepta el header `Authorization` y no lo pasa a `$_SERVER`. Solución en `.htaccess`:

```apache
RewriteRule ^ - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
```

Sin esta línea, `$_SERVER['HTTP_AUTHORIZATION']` llega vacío → todos los endpoints devuelven 401.

### No se pueden usar expresiones en interpolación de heredoc

Dentro de `<<<HTML ... HTML` solo se puede interpolar variables simples `{$var}`. Ternarios y llamadas a funciones fallan con parse error:

```php
// ❌ Parse error en PHP
"Generado el {$_SERVER['REQUEST_TIME'] ? date('Y') : ''}"

// ✅ Correcto: pre-computar antes del heredoc
$fecha = date('d/m/Y H:i');
"Generado el {$fecha}"
```

---

## 17. Pruebas de humo

```bash
# Obtener token
export TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@talentos.com","password":"Admin123!"}' \
  | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# 1. Health directo
curl http://localhost:9000/payroll/health

# 2. Sin token — debe dar 401
curl http://localhost:9000/payroll/periodos

# 3. Con token directo
curl http://localhost:9000/payroll/periodos \
  -H "Authorization: Bearer $TOKEN"

# 4. A través del gateway
curl http://localhost:3000/api/payroll/periodos \
  -H "Authorization: Bearer $TOKEN"

# 5. Crear período
curl -X POST http://localhost:3000/api/payroll/periodos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "anio": 2025, "mes": 1, "quincena": 1,
    "fecha_inicial": "2025-01-01",
    "fecha_final": "2025-01-15",
    "fecha_pago": "2025-01-17"
  }'

# 6. Registrar novedad
curl -X POST http://localhost:3000/api/payroll/novedades \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "empleado_id": 1, "periodo_id": 1,
    "tipo_novedad": "unica",
    "concepto_codigo": "996",
    "concepto_descripcion": "Bonificación",
    "valor": 500000,
    "es_deduccion": false,
    "fecha_novedad": "2025-01-10"
  }'

# 7. Listar planillas PILA
curl http://localhost:3000/api/payroll/pila \
  -H "Authorization: Bearer $TOKEN"
```
