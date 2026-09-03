# Migración Firestore → PostgreSQL

Este documento describe cómo pasar los datos actuales (clientes, productos y
proformas) desde Firestore a la nueva capa de datos PostgreSQL/Prisma.

## 1. Exportar los datos de Firestore

Desde la consola de Firebase (Firestore Database → "Import/Export" o
"Manage collections"), exporta cada colección a un archivo JSON:

```text
firestore-export/
├── clients.json
├── products.json
└── proformas.json
```

Formatos aceptados por el script:

- Objeto con IDs de documento como claves: `{ "<docId>": { ...campos } }`
- Array de documentos: `[{ "id": "...", "data": { ...campos } }]`
- Array simple: `[{ "id": "...", ...campos }]`

## 2. Aplicar la migración de base de datos

```bash
cd apps/api
pnpm prisma:deploy
```

El Dockerfile de la API ejecuta este paso automáticamente al arrancar.

## 3. Crear el seed (usuarios y secuencia)

```bash
cd apps/api
pnpm prisma:seed
```

Usuarios creados:

| Usuario                      | Contraseña (por defecto) |
|------------------------------|--------------------------|
| admin@unyxsolutions.com      | `Admin123!`              |
| demo@unyxsolutions.com       | `Demo123!`               |

Cambia la contraseña del admin en producción definiendo `SEED_ADMIN_PASSWORD`
al ejecutar el seed.

## 4. Migrar los datos de Firestore

```bash
cd apps/api
$env:FIRESTORE_EXPORT_DIR = "../firestore-export"   # PowerShell
# export FIRESTORE_EXPORT_DIR="../firestore-export"  # sh
pnpm exec tsx prisma/migrate-firestore.ts
```

El script:

1. Crea clientes con `upsert` por RUC (no duplica).
2. Crea productos con `upsert` por referencia/código.
3. Crea proformas ordenadas por número, **preservando el número original**,
   el cliente, los ítems, los totales y mapeando el estado
   (`borrador` → BORRADOR, `emitida` → EMITIDA, `aceptada` → ACEPTADA,
   `cerrada` → CERRADA).
4. Ajusta la secuencia `proforma` al número máximo migrado, de modo que las
   nuevas proformas continúen la numeración sin colisiones.

Es idempotente: puede ejecutarse varias veces; los registros ya migrados se
omiten.

## 5. Verificación posterior

Recomendado: consultar el conteo por colección vía API tras iniciar sesión:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@unyxsolutions.com","password":"Admin123!"}'
```

Luego, con el token en `$TOKEN`:

```bash
curl http://localhost:3000/api/proformas?page=1&pageSize=5 \
  -H "Authorization: Bearer $TOKEN"
```

# Prueba manual del flujo completo

## Preparación

```bash
pnpm install
pnpm dev          # API en :3000, web en :5173
```

Si la API se ejecuta fuera de Docker, asegura `DATABASE_URL` apuntando a tu
PostgreSQL local y aplica migración + seed.

## Pasos

1. Abre `http://localhost:5173` → redirige a `/login`.
2. Ingresa con `admin@unyxsolutions.com` / `Admin123!` → redirige a
   `/dashboard` y muestra toast de bienvenida.
3. Ve a **Proformas** → **Nueva Proforma**:
   - El campo Número aparece auto-generado y bloqueado.
   - Busca/crea un cliente; los campos se completan.
   - Busca/crea un producto o añade ítems manuales.
   - Verifica que subtotal, IVA (15%) y total se calculan en vivo con 2
     decimales exactos.
4. Presiona **Guardar borrador** → toast de confirmación; el número mostrado
   es el asignado por el servidor.
5. Presiona **Emitir Proforma** → la proforma pasa a EMITIDA.
6. Presiona **Generar PDF** → se descarga el PDF con los datos actuales.
7. En **Historial de Proformas**: búsqueda con debounce, orden, badge de
   estado (Borrador/Emitida/Aceptada/Cerrada), paginación, exportar CSV y
   regenerar PDF.
8. Edita una proforma emitida (`/proformas/<numero>/editar`): el botón
   principal cambia a "Guardar cambios"; intenta no forzar transiciones
   inválidas (el servidor responde 409 con mensaje claro).
9. Cierra sesión (botón del menú de usuario en fase posterior) o borra
   `unyx_token` de localStorage → vuelve a `/login`.
10. Prueba negativa: petición a `/api/proformas` sin token → 401.

## Estados y transiciones

```text
BORRADOR → EMITIDA
EMITIDA  → ACEPTADA | CERRADA
ACEPTADA → CERRADA
CERRADA  → (final)
```

El servidor valida la transición y devuelve `409 INVALID_STATUS_TRANSITION`
si es inválida.
