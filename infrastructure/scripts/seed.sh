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
echo "UNYX Workspace Database Seed"
echo "========================================"

echo ""
echo "This process initializes system data."
echo "It does NOT import historical business data."
echo ""

read -r -p "Continue? [y/N]: " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Seed cancelled."
    exit 0
fi

echo ""
echo "Creating database backup..."

./infrastructure/scripts/backup-db.sh

echo ""
echo "Running Prisma seed..."

docker compose \
    --env-file "$ENV_FILE" \
    run --rm backend \
    pnpm --filter @unyx/backend run prisma:seed

echo ""
echo "Seed completed successfully."