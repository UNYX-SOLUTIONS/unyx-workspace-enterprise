#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="/docker/unyx-workspace-enterprise"
ENV_FILE="$PROJECT_DIR/.env.production"

cd "$PROJECT_DIR"

if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR: $ENV_FILE not found."
    exit 1
fi

set -a
source "$ENV_FILE"
set +a

echo "========================================"
echo "UNYX Workspace Deployment"
echo "========================================"

echo ""
echo "[1/8] Creating database backup..."

./infrastructure/scripts/backup-db.sh

echo ""
echo "[2/8] Pulling latest code..."

git pull --ff-only origin main

echo ""
echo "[3/8] Validating Docker Compose..."

docker compose \
    --env-file "$ENV_FILE" \
    config > /dev/null

echo "Docker Compose configuration is valid."

echo ""
echo "[4/8] Building application images..."

docker compose \
    --env-file "$ENV_FILE" \
    build

echo ""
echo "[5/8] Starting database services..."

docker compose \
    --env-file "$ENV_FILE" \
    up -d postgres redis

echo ""
echo "Waiting for PostgreSQL..."

until docker exec unyx-workspace-db \
    pg_isready \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    > /dev/null 2>&1
do
    echo "PostgreSQL is not ready yet..."
    sleep 2
done

echo "PostgreSQL is ready."

echo ""
echo "[6/8] Applying Prisma migrations..."

docker compose \
    --env-file "$ENV_FILE" \
    run --rm backend \
    pnpm --filter @unyx/backend exec prisma migrate deploy \
    --schema prisma/schema.prisma

echo ""
echo "[7/8] Starting application..."

docker compose \
    --env-file "$ENV_FILE" \
    up -d backend frontend

echo ""
echo "[8/8] Checking service status..."

sleep 5

docker compose \
    --env-file "$ENV_FILE" \
    ps

echo ""
echo "Checking API..."

if curl -fsS \
    "http://127.0.0.1:${WORKSPACE_HTTP_PORT:-8080}/api/health" \
    > /dev/null
then
    echo "API: OK"
else
    echo "WARNING: API health check failed."
    echo ""
    echo "Check logs with:"
    echo "docker logs unyx-backend"
fi

echo ""
echo "========================================"
echo "Deployment completed"
echo "========================================"