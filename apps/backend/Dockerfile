FROM node:22-alpine

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./

COPY apps/backend/package.json apps/backend/package.json

COPY packages/shared-schemas/package.json packages/shared-schemas/package.json

RUN pnpm install --frozen-lockfile

COPY apps/backend apps/backend

COPY packages packages

RUN pnpm --filter @unyx/shared-schemas build

RUN pnpm --filter @unyx/backend prisma:generate

RUN pnpm --filter @unyx/backend build

EXPOSE 3000

# Las migraciones y el seed NO se ejecutan aquí.
# Se aplican de manera controlada durante el despliegue.

CMD ["sh", "-c", "pnpm --filter @unyx/backend start"]