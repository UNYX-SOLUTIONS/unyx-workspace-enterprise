FROM node:22-alpine AS builder

WORKDIR /workspace

RUN corepack enable

# Build args de entorno (inyectados como variables Vite en el build)
ARG VITE_API_URL
ARG VITE_APP_NAME
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_APP_NAME=${VITE_APP_NAME}

# Archivos principales del monorepo
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY turbo.json ./

# Package.json necesarios para resolver el workspace
COPY apps/frontend/package.json ./apps/frontend/package.json

COPY packages/shared-schemas/package.json ./packages/shared-schemas/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json

# Instalación reproducible
RUN pnpm install --frozen-lockfile

# Código fuente
COPY apps/frontend ./apps/frontend
COPY packages ./packages

# Compilar paquetes compartidos (tipos para el typecheck del web)
RUN pnpm --filter @unyx/shared-schemas --filter @unyx/shared-types build

# Build del frontend (typecheck + bundle)
RUN pnpm --filter @unyx/frontend build


# ==========================================
# Production
# ==========================================
FROM nginx:alpine

COPY --from=builder /workspace/apps/frontend/dist /usr/share/nginx/html

COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


