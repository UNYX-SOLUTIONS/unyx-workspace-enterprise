# UNYX Workspace

Base empresarial monorepo para desarrollar los módulos internos de UNYX bajo un solo dominio:

```text
app.unyxsolutions.com/dashboard
app.unyxsolutions.com/proformas
app.unyxsolutions.com/mantenimientos
app.unyxsolutions.com/clientes
app.unyxsolutions.com/productos
```

## Tecnologías

### Frontend
- React 19 + Vite 7 + TypeScript (strict)
- React Router (rutas con code splitting)
- Tailwind CSS
- React Hook Form + Zod
- Axios (interceptor JWT)
- i18next
- Contextos de autenticación, tema y notificaciones (toasts)

### Backend
- Node.js + Express 5 + TypeScript (strict)
- Prisma ORM + PostgreSQL
- JWT (bcrypt) con verificación de usuario en BD
- Zod (esquemas compartidos en `@unyx/shared-schemas`)
- Helmet, CORS, rate limiting (global + login)
- Logs estructurados con pino

### Infraestructura
- pnpm workspaces
- Turborepo
- Docker Compose (web, api, postgres, redis, nginx) con healthchecks
- Nginx (plantilla HTTPS con Let's Encrypt incluida)
- GitHub Actions (lint + type-check + build + test + audit)

## Inicio rápido

```bash
cp .env.example .env
pnpm install
pnpm build          # compila paquetes compartidos + apps
pnpm dev            # web: http://localhost:5173 · api: http://localhost:3000
```

La API necesita una base PostgreSQL. Opciones:

- Solo la base en Docker: `docker compose up -d postgres` (expone 5432) y
  `pnpm dev` en el host.
- Todo en Docker: `pnpm docker:up`.

La variable `DATABASE_URL` de `.env` apunta a `localhost:5432` para desarrollo
en host; el contenedor de la API usa su propia URL interna hacia `postgres`.

## Comandos

| Comando               | Descripción                                          |
|-----------------------|------------------------------------------------------|
| `pnpm dev`            | Arranca api (tsx watch) y web (vite) en paralelo     |
| `pnpm build`          | Compila shared-* + api (tsc) + web (tsc + vite)      |
| `pnpm type-check`     | Typecheck estricto de api y web                       |
| `pnpm lint`           | ESLint + typescript-eslint en api y web               |
| `pnpm test`           | Vitest: unitarias + validación + servicios            |
| `pnpm docker:up`      | `docker compose up -d --build` (migra y seedea solo)  |
| `pnpm docker:down`    | Detiene los contenedores (los datos persisten)        |
| `pnpm docker:logs`    | Logs en vivo de todos los servicios                   |

### Migraciones y datos

```bash
cd apps/backend
pnpm prisma:migrate   # prisma migrate dev (desarrollo)
pnpm prisma:deploy    # aplica migraciones pendientes
pnpm prisma:seed      # usuarios admin/demo + secuencias
```

El contenedor de la API ejecuta `prisma:deploy` + `prisma:seed` al arrancar
(ambos idempotentes).

**Usuario inicial:** `admin@unyxsolutions.com` / `Admin123!` (cambiar en
producción con `SEED_ADMIN_PASSWORD`).

## Docker (local)

```bash
docker compose up -d --build
```

Aplicación: `http://localhost` · API: `http://localhost/api/health`.

## Despliegue en el VPS global (Proyecto B)

El proyecto convive en el VPS central de la empresa junto a otros proyectos:

```text
VPS Global
├── pgadmin (puerto 5050)          → administra TODAS las bases
├── postgres-unyx (5432)           → PostgreSQL de UNYX (Proyecto B)
├── postgres-proyecto-c (5433)     → Proyecto C
├── postgres-proyecto-d (5434)     → Proyecto D
└── [empresa-network]              → red Docker externa compartida
     ├── unyx-backend  (3000)
     ├── unyx-frontend (80, proxy /api → backend)
     └── unyx-redis
```

Reglas:

- **PostgreSQL es externo al proyecto**: el contenedor `postgres-unyx` lo
  crea el administrador del VPS. El proyecto NO define servicio postgres.
- Todos los contenedores del proyecto usan la red externa `empresa-network`.
- **Las migraciones NO corren automáticamente en el contenedor**: se aplican
  desde CI/CD o manualmente con `pnpm migrate:prod` / `pnpm seed:prod`
  (idempotentes) o con `infrastructure/scripts/deploy.sh`.

### Configuración previa (administrador del VPS)

```bash
# 1. Red compartida (una sola vez para toda la empresa)
docker network create empresa-network

# 2. PostgreSQL del Proyecto B (--restart unless-stopped para sobrevivir
#    reinicios del host/Docker)
docker run -d --name postgres-unyx --network empresa-network \
  --restart unless-stopped \
  -e POSTGRES_DB=unyx_workspace \
  -e POSTGRES_USER=unyx_user \
  -e POSTGRES_PASSWORD=<secret> \
  -p 5432:5432 postgres:16-alpine
```

En PGAdmin (host `pgadmin`, puerto 5050) agrega un server con:

| Campo | Valor |
|---|---|
| Host | `postgres-unyx` |
| Port | `5432` |
| Database | `unyx_workspace` |
| User | `unyx_user` |

### Variables de entorno (una sola fuente por app)

Siguiendo el patrón del resto de proyectos de la empresa (backend/frontend
con su propio `.env`):

| Archivo | Uso |
|---|---|
| `apps/backend/.env` + `.env.example` | Desarrollo del backend en host (DB local o postgres-unyx) |
| `apps/frontend/.env` + `.env.example` | Desarrollo del frontend (Vite) |
| `.env.production` (raíz, NO versionar) | Docker/VPS: `deploy:prod`, `migrate:prod`, `seed:prod` |
| `.env.example` (raíz, SÍ versionar) | Plantilla de referencia para `.env.production` |

Secretos requeridos en `.env.production`: `UNYX_DB_PASSWORD`, `JWT_SECRET`
(mín. 32 caracteres) y opcionalmente `SEED_ADMIN_PASSWORD`.

### Despliegue

```bash
pnpm deploy:prod    # build + up con .env.production
pnpm migrate:prod   # prisma migrate deploy (dentro de la red, idempotente)
pnpm seed:prod      # usuarios admin/demo + secuencias (idempotente)

# o todo junto:
bash infrastructure/scripts/deploy.sh

# Respaldo de la base:
bash infrastructure/scripts/backup-db.sh   # guarda en ./backups/*.sql.gz
```

### HTTPS en producción

El contenedor `unyx-frontend` (nginx) es el punto de entrada en el puerto 80.
Para TLS con certbot, monta los certificados y usa la plantilla
`infrastructure/nginx/nginx.https.conf` como base de su `nginx.conf`.

## Migración desde Firestore (histórico)

El código anterior usaba Firestore. Si aún quedan datos por migrar, sigue
`MIGRACION-FIRESTORE.md` (export JSON + `pnpm exec tsx prisma/migrate-firestore.ts`).

## Estructura

```text
apps/
├── web/                 Frontend React + TypeScript (módulos por dominio)
└── api/                 Backend Express + TypeScript + Prisma
packages/
├── shared-types/        Tipos compartidos
├── shared-schemas/      Esquemas Zod compartidos (con tipos inferidos)
└── eslint-config/       ESLint 9 + typescript-eslint
infrastructure/
├── nginx/               Proxy reverso (HTTP + plantilla HTTPS)
├── database/            Notas de BD
└── scripts/             deploy.sh
```

## Regla de arquitectura

- Código exclusivo de un módulo: `apps/frontend/src/modules/<modulo>`
- Código reutilizable: `src/components`, `src/hooks`, `src/modules/common`
- Frontend y backend se comunican únicamente mediante HTTP (JWT en `Authorization`)
- No importar archivos internos del backend desde el frontend
- Imports del frontend con alias `@/` (apunta a `apps/frontend/src`)
- Validación con `@unyx/shared-schemas` en ambos lados
