#!/bin/bash
# deploy.sh - Despliegue de UNYX Workspace (Proyecto B) en el VPS global
set -e

echo "Desplegando UNYX Workspace en el VPS global..."

# 1. Validar que la red externa existe
if ! docker network inspect empresa-network &>/dev/null; then
  echo "ERROR: la red 'empresa-network' no existe en el VPS."
  echo "El administrador del VPS debe crearla primero:"
  echo "  docker network create empresa-network"
  exit 1
fi

# 2. Validar variables de entorno de producción
if [ ! -f .env.production ]; then
  echo "ERROR: archivo .env.production no encontrado."
  echo "Copia .env.example a .env.production y completa los valores reales."
  exit 1
fi

# 3. Validar que postgres-unyx existe y es alcanzable en la red
if ! docker ps --format '{{.Names}}' | grep -q '^postgres-unyx$'; then
  echo "ERROR: el contenedor 'postgres-unyx' no está corriendo."
  echo "El administrador del VPS debe crearlo (ver README, sección VPS)."
  exit 1
fi

# 4. Construir y levantar los servicios del proyecto
echo "Construyendo imagenes y levantando contenedores..."
docker compose --env-file .env.production up -d --build

# 5. Aplicar migraciones y seed (idempotentes) desde dentro de la red
echo "Aplicando migraciones de Prisma..."
docker compose --env-file .env.production run --rm backend pnpm --filter @unyx/backend prisma:deploy

echo "Aplicando seed (usuarios y secuencias)..."
docker compose --env-file .env.production run --rm backend pnpm --filter @unyx/backend prisma:seed

# 6. Verificar estado de los servicios
echo "Estado de los servicios:"
docker compose ps

# 7. Verificar healthchecks del backend
echo "Esperando healthcheck del backend..."
for i in $(seq 1 12); do
  if [ "$(docker inspect -f '{{.State.Health.Status}}' unyx-backend 2>/dev/null)" = "healthy" ]; then
    break
  fi
  sleep 5
done

docker compose ps

echo "Despliegue completado."
echo "Aplicacion: https://workspace.unyxsolutions.com"
echo "Logs: docker compose logs -f backend"
