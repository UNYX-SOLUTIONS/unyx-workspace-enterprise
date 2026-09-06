# Mapa de carpetas

```text
unyx-workspace-enterprise/
├── apps/
│   ├── web/                             Frontend React 19 + TypeScript (Vite)
│   │   ├── Dockerfile                   Build multi-etapa + nginx
│   │   ├── nginx.conf
│   │   ├── eslint.config.js
│   │   ├── tsconfig.json                (alias @ → src)
│   │   ├── tsconfig.node.json
│   │   ├── vite.config.ts               (alias @, manualChunks)
│   │   └── src/
│   │       ├── app/                     router (lazy), ProtectedRoute, navigation
│   │       ├── assets/
│   │       ├── components/              common/ y layout/
│   │       ├── config/                  api (axios+JWT), i18n
│   │       ├── contexts/                Auth, Theme, Toast
│   │       ├── hooks/                   useAuth, useTheme, useToast
│   │       ├── layouts/                 MainLayout
│   │       └── modules/
│   │           ├── autenticacion/
│   │           ├── clientes/            pages, components, services
│   │           ├── common/              utils (monetary, dateHelpers, statusMap)
│   │           ├── configuracion/
│   │           ├── dashboard/
│   │           ├── errores/
│   │           ├── mantenimientos/      pages, components, hooks, services, utils, constants
│   │           ├── productos/           pages, components, services
│   │           └── proformas/           pages, components, hooks, services, utils
│   └── api/                             Backend Express 5 + TypeScript + Prisma
│       ├── Dockerfile                   (generate + build tsc; CMD: migrate+seed+start)
│       ├── eslint.config.js
│       ├── tsconfig.json
│       ├── vitest.config.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   ├── seed.ts                  usuarios admin/demo + secuencias
│       │   └── migrate-firestore.ts     migración Firestore → PostgreSQL
│       ├── tests/                       vitest (auth, proformas, mantenimientos, errorHandler)
│       └── src/
│           ├── app.ts / server.ts
│           ├── config/                  env (Zod), prisma
│           ├── middleware/              auth (requireAuth/requireRole), errorHandler
│           ├── types/                   express.d.ts (req.user)
│           ├── utils/                   logger (pino)
│           └── modules/                 auth, clientes, productos, proformas, mantenimientos, health
│                                    (cada uno: routes + controller + service + validation)
├── packages/
│   ├── shared-types/                    Tipos compartidos (compilado a dist + .d.ts)
│   ├── shared-schemas/                  Esquemas Zod compartidos + tipos inferidos
│   └── eslint-config/                   ESLint 9 + typescript-eslint
├── infrastructure/
│   ├── nginx/                           nginx.conf + nginx.https.conf (Let's Encrypt)
│   ├── database/                        Notas de BD
│   └── scripts/                         deploy.sh
├── .github/
│   ├── workflows/                       ci.yml (lint+type-check+build+test+audit), docker.yml
│   └── CODEOWNERS
├── docker-compose.yml                   web, api, postgres, redis, nginx + healthchecks
├── pnpm-workspace.yaml
├── turbo.json                           dev, build, type-check, lint, test
├── MIGRACION-FIRESTORE.md               Guía de migración de datos
├── auditoria-codigo-unyx.Rmd            Auditoría técnica + estado de remediación
├── package.json                         scripts: dev, build, type-check, lint, test, docker:*
└── README.md
```
