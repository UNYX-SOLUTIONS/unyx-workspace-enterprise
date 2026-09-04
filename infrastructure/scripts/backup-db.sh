#!/bin/bash
# backup-db.sh - Respaldo de PostgreSQL de UNYX Workspace (postgres-unyx)
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/unyx_workspace_${TIMESTAMP}.sql"

mkdir -p "${BACKUP_DIR}"

echo "Creando backup de unyx_workspace (postgres-unyx)..."

docker exec postgres-unyx pg_dump -U unyx_user -d unyx_workspace > "${BACKUP_FILE}"

gzip "${BACKUP_FILE}"
echo "Backup guardado: ${BACKUP_FILE}.gz"

# Mantener solo los últimos 7 días
find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +7 -delete

# Opcional: copiar a almacenamiento externo (S3, etc.)
# aws s3 cp "${BACKUP_FILE}.gz" "s3://backups-empresa/unyx/"

echo "Respaldo completado."
