FROM node:22-alpine
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared-schemas/package.json packages/shared-schemas/package.json
RUN pnpm install --no-frozen-lockfile
COPY apps/api apps/api
COPY packages packages
RUN pnpm --filter @unyx/shared-schemas build
RUN pnpm --filter @unyx/api prisma:generate
RUN pnpm --filter @unyx/api build
EXPOSE 3000
CMD ["sh", "-c", "pnpm --filter @unyx/api prisma:deploy && pnpm --filter @unyx/api start"]
