import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../middleware/errorHandler.js";

const Decimal = Prisma.Decimal;
const IVA_RATE = "0.15";

const STATUS_TRANSITIONS = {
  BORRADOR: ["BORRADOR", "EMITIDA"],
  EMITIDA: ["EMITIDA", "ACEPTADA", "CERRADA"],
  ACEPTADA: ["ACEPTADA", "CERRADA"],
  CERRADA: ["CERRADA"],
};

const PROFORMA_INCLUDE = { cliente: true, items: true };

export function formatProformaNumber(sequence) {
  return String(sequence).padStart(8, "0");
}

async function nextProformaNumber(tx) {
  const rows = await tx.$queryRaw`
    INSERT INTO "Sequence" ("key", "value", "updatedAt")
    VALUES ('proforma', 1, now())
    ON CONFLICT ("key") DO UPDATE
    SET "value" = "Sequence"."value" + 1, "updatedAt" = now()
    RETURNING "value"
  `;
  return rows[0].value;
}

function computeTotals(items) {
  const computed = items.map((item) => {
    const cantidad = new Decimal(item.cantidad).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    const precio = new Decimal(item.precio).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    return {
      ...item,
      cantidad,
      precio,
      linea: cantidad.mul(precio).toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    };
  });

  const subtotal = computed.reduce((sum, item) => sum.add(item.linea), new Decimal(0));
  const iva = subtotal.mul(IVA_RATE).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const total = subtotal.add(iva);

  return { items: computed, subtotal, iva, total };
}

function mapItemsForCreate(items) {
  return items.map((item) => ({
    cantidad: item.cantidad,
    precio: item.precio,
    descripcion: item.descripcion,
    marca: item.marca,
    codigo: item.codigo,
  }));
}

async function resolveClient(tx, input) {
  if (input.clienteId) {
    const client = await tx.client.findFirst({
      where: { id: input.clienteId, deletedAt: null },
    });
    if (!client) throw new AppError(404, "CLIENT_NOT_FOUND", "El cliente indicado no existe");
    return client;
  }

  if (input.cliente) {
    const ruc = String(input.cliente.ruc || "").trim();
    const existing = await tx.client.findUnique({ where: { ruc } });
    if (existing) return existing;
    return tx.client.create({ data: { ...input.cliente, estado: "Activo" } });
  }

  throw new AppError(400, "CLIENT_REQUIRED", "Debe indicar el cliente de la proforma");
}

export async function findProforma(identifier) {
  const proforma = await prisma.proforma.findFirst({
    where: { deletedAt: null, OR: [{ id: identifier }, { numero: identifier }] },
    include: PROFORMA_INCLUDE,
  });
  if (!proforma) throw new AppError(404, "PROFORMA_NOT_FOUND", "La proforma no existe");
  return proforma;
}

export async function listProformas({ page, pageSize, search }) {
  const where = {
    deletedAt: null,
    ...(search
      ? {
          OR: [
            { numero: { contains: search, mode: "insensitive" } },
            { cliente: { nombre: { contains: search, mode: "insensitive" } } },
            { cliente: { ruc: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.proforma.findMany({
      where,
      include: PROFORMA_INCLUDE,
      orderBy: { sequenceNumber: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.proforma.count({ where }),
  ]);

  return {
    data,
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

export async function previewNextProformaNumber() {
  const sequence = await prisma.sequence.findUnique({ where: { key: "proforma" } });
  return formatProformaNumber((sequence?.value ?? 0) + 1);
}

export async function createProforma(input, userId) {
  const { items: rawItems, ...rest } = input;
  const { items, subtotal, iva, total } = computeTotals(rawItems);

  return prisma.$transaction(async (tx) => {
    const cliente = await resolveClient(tx, input);
    const sequence = await nextProformaNumber(tx);
    const numero = formatProformaNumber(sequence);

    return tx.proforma.create({
      data: {
        numero,
        sequenceNumber: sequence,
        fecha: new Date(rest.fecha),
        validezDias: rest.validezDias,
        notas: rest.notas,
        estado: rest.estado,
        subtotal,
        iva,
        total,
        clientId: cliente.id,
        createdById: userId,
        items: { create: mapItemsForCreate(items) },
      },
      include: PROFORMA_INCLUDE,
    });
  });
}

export async function updateProforma(identifier, input) {
  const existing = await findProforma(identifier);

  const nextEstado = input.estado ?? existing.estado;
  if (!STATUS_TRANSITIONS[existing.estado]?.includes(nextEstado)) {
    throw new AppError(
      409,
      "INVALID_STATUS_TRANSITION",
      `No se puede cambiar la proforma de ${existing.estado} a ${nextEstado}`
    );
  }

  const data = {};
  if (input.validezDias !== undefined) data.validezDias = input.validezDias;
  if (input.notas !== undefined) data.notas = input.notas;
  if (input.fecha !== undefined) data.fecha = new Date(input.fecha);
  if (input.estado !== undefined) data.estado = input.estado;

  return prisma.$transaction(async (tx) => {
    if (input.clienteId || input.cliente) {
      const cliente = await resolveClient(tx, input);
      data.clientId = cliente.id;
    }

    if (Array.isArray(input.items)) {
      const { items, subtotal, iva, total } = computeTotals(input.items);
      data.subtotal = subtotal;
      data.iva = iva;
      data.total = total;
      await tx.proformaItem.deleteMany({ where: { proformaId: existing.id } });
      data.items = { create: mapItemsForCreate(items) };
    }

    return tx.proforma.update({
      where: { id: existing.id },
      data,
      include: PROFORMA_INCLUDE,
    });
  });
}

export async function deleteProforma(identifier) {
  const existing = await findProforma(identifier);
  await prisma.proforma.update({
    where: { id: existing.id },
    data: { deletedAt: new Date() },
  });
  return { id: existing.id, numero: existing.numero };
}
