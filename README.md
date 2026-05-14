# TalentOS
### Sistema de Gestión de Recursos Humanos

> Proyecto universitario — Arquitectura de microservicios con Docker

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React.js + Tailwind CSS |
| API Gateway | Node.js + Express |
| Auth Service | Node.js + Express + bcrypt |
| Employee Service | Spring Boot (Java) |
| Payroll Service | PHP 8.2 (puro) |
| Training Service | Node.js + Express |
| Bases de datos | PostgreSQL (×3) + MySQL (×1) |
| Infraestructura | Docker + Docker Compose |

---

## Estructura del proyecto

```
TalentOS/
├── services/
│   ├── api-gateway/       Dev 1 — Node.js
│   ├── auth-service/      Dev 1 — Node.js
│   ├── employee-service/  Dev 3 — Spring Boot
│   ├── payroll-service/   Dev 2 — PHP
│   └── training-service/  Dev 1 — Node.js
├── frontend/              Dev 1 + Dev 3 — React
├── db-scripts/            Scripts SQL iniciales
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Levantar el proyecto

### Requisitos previos
- Docker Desktop instalado y corriendo
- Git

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/TalentOS
cd TalentOS

# 2. Crear el archivo de variables de entorno
cp .env.example .env
# Editar .env con las credenciales reales (te las comparten por WhatsApp)

# 3. Levantar todo
docker-compose up --build

# Si ya tienes las imágenes y solo quieres levantar:
docker-compose up
```

### Acceso

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API Gateway | http://localhost:3000 |
| Auth Service (debug) | http://localhost:3001 |
| Employee Service (debug) | http://localhost:8080 |
| Payroll Service (debug) | http://localhost:9000 |
| Training Service (debug) | http://localhost:3002 |

### Credenciales iniciales
```
Email:    admin@talentos.com
Password: Admin123!
```
> Cambiar la contraseña después del primer login

---

## Comandos útiles

```bash
# Ver logs de un servicio
docker-compose logs -f auth-service

# Reconstruir un solo servicio
docker-compose up --build employee-service

# Ver estado de los contenedores
docker-compose ps

# Apagar todo
docker-compose down

# Apagar y borrar datos (borra las bases de datos)
docker-compose down -v
```

---

## Flujo de trabajo con Git

```bash
# Antes de empezar a trabajar
git checkout dev
git pull origin dev

# Crear rama para tu tarea
git checkout -b feature/nombre-de-la-tarea

# Hacer commit
git add .
git commit -m "feat: descripción de lo que hiciste"

# Subir y abrir PR
git push origin feature/nombre-de-la-tarea
# Abrir Pull Request en GitHub → base: dev
```

### Convención de commits
```
feat:     nueva funcionalidad
fix:      corrección de bug
refactor: refactorización
chore:    configuración / dependencias
docs:     documentación
```

---

## Equipo

| Dev | Tecnología | Servicio |
|---|---|---|
| Dev 1 | Node.js | API Gateway + Auth + Training |
| Dev 2 | PHP | Payroll Service |
| Dev 3 | Spring Boot | Employee Service |
| Dev 1 + Dev 3 | React | Frontend |

---

## Documentación

Ver carpeta `/docs` para:
- ERS (Especificación de Requerimientos)
- Historias de Usuario
- Plan de Desarrollo
- Diagramas UML
