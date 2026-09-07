# Despliegue en el VPS Global — Guía del equipo de UNYX

Esta guía es para desplegar UNYX Workspace (Proyecto B) en el VPS central de
la empresa. Solo necesitas **Docker y bash** en el VPS (no hace falta Node ni
pnpm: todo corre dentro de contenedores).

## Arquitectura (resumen)

```text
VPS Global
├── empresa-network (red Docker externa compartida)
├── postgres-unyx        ← PostgreSQL de UNYX (lo crea el equipo de UNYX)
│                          visible en PGAdmin como host "postgres-unyx":5432
├── unyx-backend (3000)  ← API Express + Prisma
├── unyx-frontend (80)   ← nginx: sirve la web y proxea /api → backend
└── unyx-redis
```

## Paso 0 — Obtener el código y los secretos

```bash
git clone <url-del-repo>
cd unyx-workspace-enterprise

cp .env.example .env.production
nano .env.production      # completa los secretos (ver abajo)
```

Variables de `.env.production` (las claves ya vienen en la plantilla):

| Variable | Qué poner |
|---|---|
| `UNYX_DB_PASSWORD` | Contraseña que elijas para el usuario `unyx_user` |
| `JWT_SECRET` | Texto aleatorio de 32+ caracteres |
| `SEED_ADMIN_PASSWORD` | Contraseña inicial del admin (cámbiala tras el primer login) |
| `CORS_ORIGIN` | `https://workspace.unyxsolutions.com` |

> Los archivos `.env.production`, `.env` y `.env.*` están en `.gitignore`:
> los secretos nunca se versionan.

## Paso 1 — Una sola vez: red y base de datos

```bash
# 1. Red compartida (si aún no existe en el VPS)
docker network create empresa-network

# 2. PostgreSQL de UNYX (usa LA MISMA contraseña que pusiste en UNYX_DB_PASSWORD)
docker run -d --name postgres-unyx --network empresa-network \
  --restart unless-stopped \
  -e POSTGRES_DB=unyx_workspace \
  -e POSTGRES_USER=unyx_user \
  -e POSTGRES_PASSWORD=<la-contraseña-de-UNYX_DB_PASSWORD> \
  -e TZ=America/Guayaquil \
  -p 5432:5432 postgres:16-alpine
```

Verificación: `docker exec postgres-unyx pg_isready -U unyx_user -d unyx_workspace`.

## Paso 2 — Desplegar (un solo comando)

```bash
bash infrastructure/scripts/deploy.sh
```

El script hace todo, en orden:

1. Valida que `empresa-network` y `postgres-unyx` existan.
2. Construye y levanta `unyx-backend`, `unyx-frontend` y `unyx-redis`.
3. Aplica las **migraciones** de Prisma (crea las tablas).
4. Aplica el **seed** (usuarios admin/demo + secuencias de numeración).
5. Espera el healthcheck del backend y muestra el estado final.

Equivalentes individuales (todos idempotentes, se pueden repetir):

```bash
docker compose --env-file .env.production up -d --build   # build + up
docker compose --env-file .env.production run --rm backend pnpm --filter @unyx/backend prisma:deploy  # migraciones
docker compose --env-file .env.production run --rm backend pnpm --filter @unyx/backend prisma:seed     # seed
```

## Paso 3 — Cargar los datos

La base nace vacía. Hay dos caminos:

**A. Restaurar un dump (recomendado, si ya hay una base migrada localmente)**

```bash
# En la máquina que tiene la base con datos:
docker exec postgres-unyx pg_dump -U unyx_user -d unyx_workspace > unyx_backup.sql

# Copia unyx_backup.sql al VPS y restaura:
docker exec -i postgres-unyx psql -U unyx_user -d unyx_workspace < unyx_backup.sql
```

**B. Re-migrar desde los JSON de Firestore**

Copia la carpeta `firestore_export/` (clients.json, products.json,
proformas.json, mantenimientos.json, counters.json) al VPS y ejecuta:

```bash
docker compose --env-file .env.production run --rm \
  -e FIRESTORE_EXPORT_DIR=/firestore-export \
  -v "$(pwd)/firestore_export:/firestore-export" \
  backend pnpm --filter @unyx/backend exec tsx prisma/migrate-firestore.ts
```

El script es idempotente, preserva la numeración y respeta los contadores.

## Paso 4 — Verificar

1. `docker compose --env-file .env.production ps` → los 3 contenedores `healthy`.
2. Health: `curl http://localhost/api/health` → `{"status":"ok",...}`.
3. Login: abre `http://<ip-del-vps>` con
   `admin@unyxsolutions.com` / la contraseña de `SEED_ADMIN_PASSWORD`.
4. PGAdmin: agrega un server con host `postgres-unyx`, puerto 5432, base
   `unyx_workspace`, usuario `unyx_user`.

## Problemas comunes

| Síntoma | Causa | Solución |
|---|---|---|
| Login responde 500 y la BD está vacía | Faltan migraciones/seed | `bash infrastructure/scripts/deploy.sh` (o `pnpm migrate:prod` + `pnpm seed:prod`) |
| Error "can't reach database server" | `postgres-unyx` caído o mal DATABASE_URL | `docker start postgres-unyx`; revisa que `.env.production` use `@postgres-unyx:5432` y la contraseña correcta |
| `Authentication failed` | Contraseña de `.env.production` ≠ contraseña del contenedor | Iguala `UNYX_DB_PASSWORD` con la del `docker run` del Paso 1 |
| "port is already allocated" | Puerto ocupado en el VPS | Revisa 80, 3000 y 5432 (`docker ps`, `ss -ltn`) |
| Tras reiniciar el VPS no levanta la BD | El contenedor se creó sin `--restart` | Revisa el Paso 1 con `--restart unless-stopped` |

## Operación diaria

```bash
docker compose --env-file .env.production logs -f backend    # logs en vivo
bash infrastructure/scripts/backup-db.sh                     # respaldo manual
# cron semanal sugerido:
# 0 3 * * 0 cd /ruta/del/repo && bash infrastructure/scripts/backup-db.sh
```
