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
echo "UNYX Workspace Initial Data Import"
echo "========================================"

echo ""
echo "WARNING:"
echo "This process imports the initial business dataset."
echo ""
echo "It may create:"
echo "  Clients"
echo "  Products"
echo "  Proformas"
echo "  Maintenances"
echo "  Sequences"
echo ""

read -r -p "Continue? [y/N]: " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Import cancelled."
    exit 0
fi

echo ""
echo "[1/4] Creating database backup..."

./infrastructure/scripts/backup-db.sh

echo ""
echo "[2/4] Checking PostgreSQL..."

if ! docker exec unyx-workspace-db \
    pg_isready \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    > /dev/null 2>&1
then
    echo "ERROR: PostgreSQL is not ready."
    exit 1
fi

echo "PostgreSQL is ready."

echo ""
echo "[3/4] Importing initial data..."

docker compose \
    --env-file "$ENV_FILE" \
    run --rm backend \
    pnpm --filter @unyx/backend run import:initial-data

echo ""
echo "[4/4] Import completed."

echo ""
echo "========================================"
echo "Initial data import completed"
echo "========================================"