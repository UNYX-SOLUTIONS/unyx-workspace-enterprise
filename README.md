# UNYX Workspace

Base empresarial monorepo para desarrollar los módulos internos de UNYX bajo un solo dominio:

```text
app.unyxsolutions.com/dashboard
app.unyxsolutions.com/proformas
app.unyxsolutions.com/mantenimientos
app.unyxsolutions.com/clientes
app.unyxsolutions.com/productos
```

## Tecnologías

### Frontend
- React + Vite
- React Router
- Tailwind CSS
- React Hook Form + Zod
- Axios
- i18next
- Contextos de autenticación, tema y notificaciones

### Backend
- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT
- Zod
- Helmet, CORS y rate limiting

### Infraestructura
- pnpm workspaces
- Turborepo
- Docker Compose
- Nginx
- Redis preparado
- GitHub Actions

## Inicio rápido

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Frontend: `http://localhost:5173`  
API: `http://localhost:3000/api/health`

## Docker

```bash
docker compose up -d --build
```

Aplicación: `http://localhost`

## Migración del proyecto actual

Mueve tus archivos existentes así:

```text
ProformPage.jsx
→ apps/web/src/modules/proformas/pages/ProformaPage.jsx

HistoryPage.jsx
→ apps/web/src/modules/proformas/pages/ProformaHistoryPage.jsx

proformaService.js
→ apps/web/src/modules/proformas/services/proformaService.js

generatePdf.js
→ apps/web/src/modules/proformas/utils/generatePdf.js

MaintenancePage.jsx
→ apps/web/src/modules/mantenimientos/pages/MaintenancePage.jsx

maintenanceService.js
→ apps/web/src/modules/mantenimientos/services/maintenanceService.js

generateMaintenancePdf.js
→ apps/web/src/modules/mantenimientos/utils/generateMaintenancePdf.js

ClientsPage.jsx
→ apps/web/src/modules/clientes/pages/ClientsPage.jsx

ProductsPage.jsx
→ apps/web/src/modules/productos/pages/ProductsPage.jsx
```

Los componentes compartidos deben ir en:

```text
apps/web/src/components/common
apps/web/src/components/layout
```

La configuración de Firebase debe permanecer en:

```text
apps/web/src/config/firebase.js
```

## Regla de arquitectura

- Código exclusivo de un módulo: `apps/web/src/modules/<modulo>`
- Código reutilizable en varios módulos: `components`, `hooks`, `services`, `utils`
- Frontend y backend se comunican únicamente mediante HTTP
- No importar archivos internos del backend desde el frontend
