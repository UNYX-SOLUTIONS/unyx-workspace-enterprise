import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  EstadoMantenimiento,
  EstadoProforma,
  Prisma,
  PrismaClient,
} from "@prisma/client";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(
  __dirname,
  "data",
  "unyx_workspace_initial_data.json"
);

type LegacyClient = {
  id?: string;
  telefono?: string;
  direccion?: string;
  email?: string;
  nombre: string;
  updatedAt?: string;
  createdAt?: string;
  ruc: string;
  estado?: string;
  ciudad?: string;
};

type LegacyProduct = {
  id?: string;
  name: string;
  category?: string;
  brand?: string;
  createdAt?: string;
  updatedAt?: string;
  price: number;
  ref: string;
};

type LegacyProformaItem = {
  descripcion: string;
  codigo?: string;
  marca?: string;
  cantidad: number;
  precio: number;
};

type LegacyProforma = {
  id?: string;
  fechaInput?: string;
  fecha: string;
  subtotal: number;
  iva: number;
  notas?: string;
  total: number;
  updatedAt?: string;
  createdAt?: string;
  cliente: {
    direccion?: string;
    ruc: string;
    nombre: string;
    telefono?: string;
    ciudad?: string;
  };
  numero: string;
  estado?: string;
  validezDias?: number;
  items: LegacyProformaItem[];
};

type LegacyMaintenance = {
  id?: string;
  numero: string;
  fecha: string;
  estado?: string;
  tecnicoResponsable?: string;
  cliente?: unknown;
  equipo?: unknown;
  problemasReportados?: string[];
  diagnosticoInicial?: unknown;
  diagnosticoFinal?: unknown;
  checklist?: unknown;
  accionesRealizadas?: string;
  hallazgos?: string[];
  recomendaciones?: string[];
  conclusion?: string;
  observaciones?: string;
  createdAt?: string;
  updatedAt?: string;
};

type LegacyCounter =
  | {
      id: "mantenimientos";
      current: number;
    }
  | {
      id: "proformas";
      lastNumber: number;
      updatedAt?: string;
    };

type InitialData = {
  clients: LegacyClient[];
  products: LegacyProduct[];
  proformas: LegacyProforma[];
  mantenimientos: LegacyMaintenance[];
  counters: LegacyCounter[];
};

function loadInitialData(): InitialData {
  if (!fs.existsSync(DATA_FILE)) {
    throw new Error(
      `Initial data file not found: ${DATA_FILE}`
    );
  }

  const raw = fs.readFileSync(DATA_FILE, "utf8");

  return JSON.parse(raw) as InitialData;
}

function nullableString(value?: string): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function parseDate(
  value: string | undefined,
  fallback?: Date
): Date {
  if (!value) {
    return fallback ?? new Date();
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }

  return parsed;
}

function parseMaintenanceDate(value: string): Date {
  if (value.includes("T")) {
    return parseDate(value);
  }

  return parseDate(`${value}T00:00:00.000Z`);
}

function normalizeProformaEstado(
  value?: string
): EstadoProforma {
  const normalized = value
    ?.trim()
    .toUpperCase();

  switch (normalized) {
    case "EMITIDA":
      return EstadoProforma.EMITIDA;

    case "ACEPTADA":
      return EstadoProforma.ACEPTADA;

    case "CERRADA":
      return EstadoProforma.CERRADA;

    case "BORRADOR":
    default:
      return EstadoProforma.BORRADOR;
  }
}

function normalizeMaintenanceEstado(
  value?: string
): EstadoMantenimiento {
  const normalized = value
    ?.trim()
    .toLowerCase();

  switch (normalized) {
    case "finalizado":
      return EstadoMantenimiento.FINALIZADO;

    case "entregado":
      return EstadoMantenimiento.ENTREGADO;

    case "en mantenimiento":
      return EstadoMantenimiento.EN_MANTENIMIENTO;

    case "en revisión":
    case "en revision":
    default:
      return EstadoMantenimiento.EN_REVISION;
  }
}

function getProformaSequence(
  numero: string
): number {
  const parsed = Number(numero);

  if (!Number.isInteger(parsed)) {
    throw new Error(
      `Invalid proforma number: ${numero}`
    );
  }

  return parsed;
}

function getMaintenanceSequence(
  numero: string
): number {
  const match = numero.match(/(\d+)$/);

  if (!match) {
    throw new Error(
      `Invalid maintenance number: ${numero}`
    );
  }

  return Number(match[1]);
}

function toJsonValue(
  value: unknown
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
  if (
    value === undefined ||
    value === null
  ) {
    return Prisma.JsonNull;
  }

  return value as Prisma.InputJsonValue;
}

async function importClients(
  clients: LegacyClient[]
): Promise<void> {
  console.log("");
  console.log(
    `Importing ${clients.length} clients...`
  );

  for (const client of clients) {
    await prisma.client.upsert({
      where: {
        ruc: client.ruc,
      },

      update: {
        nombre: client.nombre,
        email: nullableString(client.email),
        telefono: nullableString(
          client.telefono
        ),
        direccion: nullableString(
          client.direccion
        ),
        ciudad: nullableString(
          client.ciudad
        ),
        estado:
          nullableString(client.estado) ??
          "Activo",
        deletedAt: null,
      },

      create: {
        nombre: client.nombre,
        ruc: client.ruc,
        email: nullableString(client.email),
        telefono: nullableString(
          client.telefono
        ),
        direccion: nullableString(
          client.direccion
        ),
        ciudad: nullableString(
          client.ciudad
        ),
        estado:
          nullableString(client.estado) ??
          "Activo",

        createdAt: parseDate(
          client.createdAt
        ),

        updatedAt: parseDate(
          client.updatedAt,
          parseDate(client.createdAt)
        ),
      },
    });

    console.log(
      `  ✓ Client: ${client.ruc} - ${client.nombre}`
    );
  }
}

async function importProducts(
  products: LegacyProduct[]
): Promise<void> {
  console.log("");
  console.log(
    `Importing ${products.length} products...`
  );

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        codigo: product.ref,
      },

      update: {
        nombre: product.name,
        marca: nullableString(product.brand),
        categoria: nullableString(
          product.category
        ),
        precio: new Prisma.Decimal(
          product.price
        ),
        activo: true,
      },

      create: {
        codigo: product.ref,
        nombre: product.name,
        marca: nullableString(product.brand),
        categoria: nullableString(
          product.category
        ),
        precio: new Prisma.Decimal(
          product.price
        ),
        activo: true,

        createdAt: parseDate(
          product.createdAt
        ),

        updatedAt: parseDate(
          product.updatedAt,
          parseDate(product.createdAt)
        ),
      },
    });

    console.log(
      `  ✓ Product: ${product.ref} - ${product.name}`
    );
  }
}

async function importProformas(
  proformas: LegacyProforma[]
): Promise<void> {
  console.log("");
  console.log(
    `Importing ${proformas.length} proformas...`
  );

  for (const proforma of proformas) {
    const existing =
      await prisma.proforma.findUnique({
        where: {
          numero: proforma.numero,
        },
      });

    if (existing) {
      console.log(
        `  ↷ Proforma ${proforma.numero} already exists. Skipping.`
      );

      continue;
    }

    const client =
      await prisma.client.findUnique({
        where: {
          ruc: proforma.cliente.ruc,
        },
      });

    if (!client) {
      throw new Error(
        `Client ${proforma.cliente.ruc} not found for proforma ${proforma.numero}`
      );
    }

    const items =
      await Promise.all(
        proforma.items.map(
          async (item) => {
            const product =
              item.codigo
                ? await prisma.product.findUnique({
                    where: {
                      codigo:
                        item.codigo,
                    },
                  })
                : null;

            return {
              cantidad:
                new Prisma.Decimal(
                  item.cantidad
                ),

              precio:
                new Prisma.Decimal(
                  item.precio
                ),

              descripcion:
                item.descripcion,

              marca:
                nullableString(
                  item.marca
                ),

              codigo:
                nullableString(
                  item.codigo
                ),

              productId:
                product?.id ?? null,
            };
          }
        )
      );

    await prisma.proforma.create({
      data: {
        numero: proforma.numero,

        sequenceNumber:
          getProformaSequence(
            proforma.numero
          ),

        fecha: parseDate(
          proforma.fecha
        ),

        validezDias:
          proforma.validezDias ?? 30,

        notas:
          nullableString(
            proforma.notas
          ),

        subtotal:
          new Prisma.Decimal(
            proforma.subtotal
          ),

        iva:
          new Prisma.Decimal(
            proforma.iva
          ),

        total:
          new Prisma.Decimal(
            proforma.total
          ),

        estado:
          normalizeProformaEstado(
            proforma.estado
          ),

        clientId:
          client.id,

        createdAt:
          parseDate(
            proforma.createdAt
          ),

        updatedAt:
          parseDate(
            proforma.updatedAt,
            parseDate(
              proforma.createdAt
            )
          ),

        items: {
          create: items,
        },
      },
    });

    console.log(
      `  ✓ Proforma ${proforma.numero}`
    );
  }
}

async function importMaintenances(
  maintenances: LegacyMaintenance[]
): Promise<void> {
  console.log("");
  console.log(
    `Importing ${maintenances.length} maintenances...`
  );

  for (const maintenance of maintenances) {
    const existing =
      await prisma.maintenance.findUnique({
        where: {
          numero:
            maintenance.numero,
        },
      });

    if (existing) {
      console.log(
        `  ↷ Maintenance ${maintenance.numero} already exists. Skipping.`
      );

      continue;
    }

    await prisma.maintenance.create({
      data: {
        numero:
          maintenance.numero,

        sequenceNumber:
          getMaintenanceSequence(
            maintenance.numero
          ),

        fecha:
          parseMaintenanceDate(
            maintenance.fecha
          ),

        estado:
          normalizeMaintenanceEstado(
            maintenance.estado
          ),

        tecnicoResponsable:
          nullableString(
            maintenance.tecnicoResponsable
          ),

        cliente:
          toJsonValue(
            maintenance.cliente
          ),

        equipo:
          toJsonValue(
            maintenance.equipo
          ),

        problemasReportados:
          maintenance.problemasReportados ??
          [],

        diagnosticoInicial:
          toJsonValue(
            maintenance.diagnosticoInicial
          ),

        diagnosticoFinal:
          toJsonValue(
            maintenance.diagnosticoFinal
          ),

        checklist:
          toJsonValue(
            maintenance.checklist
          ),

        accionesRealizadas:
          nullableString(
            maintenance.accionesRealizadas
          ),

        hallazgos:
          maintenance.hallazgos ?? [],

        recomendaciones:
          maintenance.recomendaciones ??
          [],

        conclusion:
          nullableString(
            maintenance.conclusion
          ),

        observaciones:
          nullableString(
            maintenance.observaciones
          ),

        createdAt:
          parseDate(
            maintenance.createdAt
          ),

        updatedAt:
          parseDate(
            maintenance.updatedAt,
            parseDate(
              maintenance.createdAt
            )
          ),
      },
    });

    console.log(
      `  ✓ Maintenance ${maintenance.numero}`
    );
  }
}

async function importCounters(
  counters: LegacyCounter[]
): Promise<void> {
  console.log("");
  console.log("Updating sequences...");

  for (const counter of counters) {
    if (
      counter.id === "proformas"
    ) {
      await prisma.sequence.upsert({
        where: {
          key: "proforma",
        },

        update: {
          value: counter.lastNumber,
        },

        create: {
          key: "proforma",
          value: counter.lastNumber,
        },
      });

      console.log(
        `  ✓ proforma = ${counter.lastNumber}`
      );
    }

    if (
      counter.id ===
      "mantenimientos"
    ) {
      await prisma.sequence.upsert({
        where: {
          key: "mantenimiento",
        },

        update: {
          value: counter.current,
        },

        create: {
          key: "mantenimiento",
          value: counter.current,
        },
      });

      console.log(
        `  ✓ mantenimiento = ${counter.current}`
      );
    }
  }
}

async function validateImport(): Promise<void> {
  console.log("");
  console.log("Validating imported data...");

  const [
    clients,
    products,
    proformas,
    maintenances,
  ] = await Promise.all([
    prisma.client.count({
      where: {
        deletedAt: null,
      },
    }),

    prisma.product.count({
      where: {
        activo: true,
      },
    }),

    prisma.proforma.count({
      where: {
        deletedAt: null,
      },
    }),

    prisma.maintenance.count({
      where: {
        deletedAt: null,
      },
    }),
  ]);

  const sequences =
    await prisma.sequence.findMany({
      orderBy: {
        key: "asc",
      },
    });

  console.log("");
  console.log("Database totals:");
  console.log(`  Clients: ${clients}`);
  console.log(`  Products: ${products}`);
  console.log(`  Proformas: ${proformas}`);
  console.log(
    `  Maintenances: ${maintenances}`
  );

  console.log("");
  console.log("Sequences:");

  for (const sequence of sequences) {
    console.log(
      `  ${sequence.key}: ${sequence.value}`
    );
  }
}

async function main(): Promise<void> {
  console.log(
    "========================================"
  );

  console.log(
    "UNYX Workspace Initial Data Import"
  );

  console.log(
    "========================================"
  );

  const data =
    loadInitialData();

  console.log("");
  console.log("JSON loaded successfully.");

  console.log({
    clients:
      data.clients.length,

    products:
      data.products.length,

    proformas:
      data.proformas.length,

    mantenimientos:
      data.mantenimientos.length,

    counters:
      data.counters.length,
  });

  await importClients(
    data.clients
  );

  await importProducts(
    data.products
  );

  await importProformas(
    data.proformas
  );

  await importMaintenances(
    data.mantenimientos
  );

  await importCounters(
    data.counters
  );

  await validateImport();

  console.log("");
  console.log(
    "========================================"
  );

  console.log(
    "Initial data import completed successfully."
  );

  console.log(
    "========================================"
  );
}

main()
  .catch((error) => {
    console.error("");
    console.error(
      "Initial data import failed:"
    );

    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });