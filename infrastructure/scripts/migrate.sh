#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="/docker/unyx-workspace-enterprise"
ENV_FILE="$PROJECT_DIR/.env.production"

cd "$PROJECT_DIR"

if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR: $ENV_FILE not found."
    exit 1
fi

echo "========================================"
echo "UNYX Workspace Prisma Migration"
echo "========================================"

echo ""
echo "Creating backup before migration..."

./infrastructure/scripts/backup-db.sh

echo ""
echo "Applying pending Prisma migrations..."

docker compose \
    --env-file "$ENV_FILE" \
    run --rm backend \
    pnpm --filter @unyx/backend exec prisma migrate deploy \
    --schema prisma/schema.prisma

echo ""
echo "Checking migration status..."

docker compose \
    --env-file "$ENV_FILE" \
    run --rm backend \
    pnpm --filter @unyx/backend exec prisma migrate status \
    --schema prisma/schema.prisma

echo ""
echo "Migration completed."