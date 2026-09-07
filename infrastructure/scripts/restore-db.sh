#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="/docker/unyx-workspace-enterprise"
ENV_FILE="$PROJECT_DIR/.env.production"

cd "$PROJECT_DIR"

if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR: $ENV_FILE not found."
    exit 1
fi

if [ $# -ne 1 ]; then
    echo "Usage:"
    echo "./infrastructure/scripts/restore-db.sh <backup.dump>"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup not found:"
    echo "$BACKUP_FILE"
    exit 1
fi

set -a
source "$ENV_FILE"
set +a

echo "========================================"
echo "UNYX Workspace Database Restore"
echo "========================================"

echo ""
echo "WARNING:"
echo "This operation will replace the current database contents."
echo ""
echo "Database:"
echo "$POSTGRES_DB"
echo ""
echo "Backup:"
echo "$BACKUP_FILE"
echo ""

read -r -p "Are you sure you want to continue? [y/N]: " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo ""
echo "Creating safety backup..."

./infrastructure/scripts/backup-db.sh

echo ""
echo "Stopping application services..."

docker compose \
    --env-file "$ENV_FILE" \
    stop frontend backend

echo ""
echo "Terminating active database connections..."

docker exec unyx-workspace-db \
    psql \
    -U "$POSTGRES_USER" \
    -d postgres \
    -c "SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = '$POSTGRES_DB'
        AND pid <> pg_backend_pid();" \
    > /dev/null

echo ""
echo "Restoring database..."

cat "$BACKUP_FILE" | docker exec -i unyx-workspace-db \
    pg_restore \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    --clean \
    --if-exists \
    --no-owner \
    --exit-on-error

echo ""
echo "Applying any pending Prisma migrations..."

docker compose \
    --env-file "$ENV_FILE" \
    run --rm backend \
    pnpm --filter @unyx/backend exec prisma migrate deploy \
    --schema prisma/schema.prisma

echo ""
echo "Starting application..."

docker compose \
    --env-file "$ENV_FILE" \
    up -d backend frontend

echo ""
echo "Restore completed successfully."