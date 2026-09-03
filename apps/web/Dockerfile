FROM node:22-alpine AS builder

WORKDIR /workspace

RUN corepack enable

# Archivos principales del monorepo
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY turbo.json ./

# Package.json necesarios para resolver el workspace
COPY apps/web/package.json ./apps/web/package.json

COPY packages/shared-schemas/package.json ./packages/shared-schemas/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json

# Instalación reproducible
RUN pnpm install --frozen-lockfile

# Código fuente
COPY apps/web ./apps/web
COPY packages ./packages

# Build del frontend
RUN pnpm --filter @unyx/web build


# ==========================================
# Production
# ==========================================
FROM nginx:alpine

COPY --from=builder /workspace/apps/web/dist /usr/share/nginx/html

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


