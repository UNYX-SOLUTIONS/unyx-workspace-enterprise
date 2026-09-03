import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const EXPORT_DIR = process.env.FIRESTORE_EXPORT_DIR || "./firestore-export";

const STATE_MAP = {
  borrador: "BORRADOR",
  emitida: "EMITIDA",
  aceptada: "ACEPTADA",
  cerrada: "CERRADA",
};

function readExport(name) {
  const file = path.join(EXPORT_DIR, `${name}.json`);
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, "utf8");
  if (!raw.trim()) return [];

  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) {
    return parsed.map((item) => ({ id: item.id || item.docId, ...(item.data || item) }));
  }
  return Object.entries(parsed).map(([id, data]) => ({ id, ...data }));
}

function toDecimal(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2) : "0.00";
}

function toDate(value) {
  if (!value) return new Date();
  if (typeof value?.toDate === "function") return value.toDate();
  if (value?.seconds) return new Date(value.seconds * 1000);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

async function migrateClients(clients) {
  let created = 0;
  for (const client of clients) {
    const ruc = String(client.ruc || "").trim();
    if (!ruc) continue;
    await prisma.client.upsert({
      where: { ruc },
      update: {},
      create: {
        nombre: String(client.nombre || "Sin nombre").trim(),
        ruc,
        email: String(client.email || "").trim() || null,
        telefono: String(client.telefono || "").trim() || null,
        direccion: String(client.direccion || "").trim() || null,
        ciudad: String(client.ciudad || "").trim() || "Guayaquil",
        estado: String(client.estado || "Activo"),
      },
    });
    created += 1;
  }
  return created;
}

async function migrateProducts(products) {
  let created = 0;
  for (const product of products) {
    const ref = String(product.ref || "").trim();
    if (!ref) continue;
    await prisma.product.upsert({
      where: { codigo: ref },
      update: {},
      create: {
        codigo: ref,
        nombre: String(product.name || "Sin nombre").trim(),
        marca: String(product.brand || "").trim() || null,
        categoria: String(product.category || "").trim() || null,
        precio: toDecimal(product.price),
      },
    });
    created += 1;
  }
  return created;
}

async function migrateProformas(proformas) {
  const sorted = [...proformas].sort((first, second) => {
    const firstNumber = Number(String(first.numero || "").replace(/\D/g, "")) || 0;
    const secondNumber = Number(String(second.numero || "").replace(/\D/g, "")) || 0;
    return firstNumber - secondNumber;
  });

  let created = 0;
  let maxSequence = 0;

  for (const proforma of sorted) {
    const numero = String(proforma.numero || "").trim();
    if (!numero) continue;

    const existing = await prisma.proforma.findUnique({ where: { numero } });
    if (existing) continue;

    const ruc = String(proforma.cliente?.ruc || "").trim();
    let client = ruc ? await prisma.client.findUnique({ where: { ruc } }) : null;

    if (!client && proforma.cliente?.nombre) {
      client = await prisma.client.upsert({
        where: { ruc: ruc || `migrado-${numero}` },
        update: {},
        create: {
          nombre: String(proforma.cliente.nombre).trim(),
          ruc: ruc || `migrado-${numero}`,
          email: String(proforma.cliente.email || "").trim() || null,
          telefono: String(proforma.cliente.telefono || "").trim() || null,
          direccion: String(proforma.cliente.direccion || "").trim() || null,
          ciudad: String(proforma.cliente.ciudad || "").trim() || "Guayaquil",
        },
      });
    }

    if (!client) continue;

    const estado = STATE_MAP[String(proforma.estado || "").trim().toLowerCase()] || "EMITIDA";
    const items = Array.isArray(proforma.items) ? proforma.items : [];
    const sequenceNumber = Number(String(numero).replace(/\D/g, "")) || 0;
    maxSequence = Math.max(maxSequence, sequenceNumber);

    await prisma.proforma.create({
      data: {
        numero,
        sequenceNumber,
        fecha: toDate(proforma.fecha),
        validezDias: Number(proforma.validezDias || 30),
        notas: String(proforma.notas || "").trim() || null,
        subtotal: toDecimal(proforma.subtotal),
        iva: toDecimal(proforma.iva),
        total: toDecimal(proforma.total),
        estado,
        clientId: client.id,
        items: {
          create: items.map((item) => ({
            cantidad: toDecimal(item.cantidad),
            precio: toDecimal(item.precio),
            descripcion: String(item.descripcion || "Sin descripción").trim(),
            marca: String(item.marca || "").trim() || null,
            codigo: String(item.codigo || "").trim() || null,
          })),
        },
      },
    });

    created += 1;
  }

  if (maxSequence > 0) {
    await prisma.sequence.upsert({
      where: { key: "proforma" },
      update: { value: maxSequence },
      create: { key: "proforma", value: maxSequence },
    });
  }

  return created;
}

async function main() {
  const clients = readExport("clients");
  const products = readExport("products");
  const proformas = readExport("proformas");

  const migratedClients = await migrateClients(clients);
  const migratedProducts = await migrateProducts(products);
  const migratedProformas = await migrateProformas(proformas);

  console.log(
    `Migración completada: ${migratedClients} clientes, ${migratedProducts} productos, ${migratedProformas} proformas.`
  );
}

main()
  .catch((error) => {
    console.error("Error durante la migración:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
