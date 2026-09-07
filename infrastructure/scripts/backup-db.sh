#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="/docker/unyx-workspace-enterprise"
ENV_FILE="$PROJECT_DIR/.env.production"
BACKUP_DIR="$PROJECT_DIR/backups/postgres"

if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR: $ENV_FILE not found."
    exit 1
fi

set -a
source "$ENV_FILE"
set +a

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/unyx_workspace_$TIMESTAMP.dump"

echo "========================================"
echo "UNYX Workspace Database Backup"
echo "========================================"

if ! docker ps --format '{{.Names}}' | grep -q '^unyx-workspace-db$'; then
    echo "ERROR: unyx-workspace-db is not running."
    exit 1
fi

echo "Checking PostgreSQL..."

if ! docker exec unyx-workspace-db \
    pg_isready \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" > /dev/null 2>&1; then

    echo "ERROR: PostgreSQL is not ready."
    exit 1
fi

echo "Creating backup..."

docker exec unyx-workspace-db \
    pg_dump \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    -Fc \
    > "$BACKUP_FILE"

if [ ! -s "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file is empty."
    rm -f "$BACKUP_FILE"
    exit 1
fi

chmod 600 "$BACKUP_FILE"

echo ""
echo "Backup created successfully:"
echo "$BACKUP_FILE"

du -h "$BACKUP_FILE"

echo ""
echo "Removing backups older than 30 days..."

find "$BACKUP_DIR" \
    -type f \
    -name "unyx_workspace_*.dump" \
    -mtime +30 \
    -delete

echo "Backup process completed."