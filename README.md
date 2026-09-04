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
cd apps/api
pnpm prisma:migrate   # prisma migrate dev (desarrollo)
pnpm prisma:deploy    # aplica migraciones pendientes
pnpm prisma:seed      # usuarios admin/demo + secuencias
```

El contenedor de la API ejecuta `prisma:deploy` + `prisma:seed` al arrancar
(ambos idempotentes).

**Usuario inicial:** `admin@unyxsolutions.com` / `Admin123!` (cambiar en
producción con `SEED_ADMIN_PASSWORD`).

## Docker

```bash
docker compose up -d --build
```

Aplicación: `http://localhost` · API: `http://localhost/api/health`.

Servicios: `web` (nginx estático), `api` (Express compilado), `postgres`
(datos persistentes en volumen), `redis` (preparado) y `nginx` (proxy
reverso). Todos con healthchecks; `web` espera a que `api` esté saludable.

## HTTPS (producción)

Usa la plantilla `infrastructure/nginx/nginx.https.conf`:

1. Genera certificados con certbot (Let's Encrypt).
2. Renombra `server_name` con tu dominio.
3. Monta el archivo y los certificados en el servicio `nginx` del compose.

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

- Código exclusivo de un módulo: `apps/web/src/modules/<modulo>`
- Código reutilizable: `src/components`, `src/hooks`, `src/modules/common`
- Frontend y backend se comunican únicamente mediante HTTP (JWT en `Authorization`)
- No importar archivos internos del backend desde el frontend
- Imports del frontend con alias `@/` (apunta a `apps/web/src`)
- Validación con `@unyx/shared-schemas` en ambos lados
