import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../middleware/errorHandler.js";
import type {
  createMaintenanceSchema,
  updateMaintenanceSchema,
} from "./mantenimientos.validation.js";

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>;

export function formatMaintenanceNumber(sequence: number): string {
  return `MANT-${String(sequence).padStart(8, "0")}`;
}

async function nextMaintenanceNumber(tx: Prisma.TransactionClient): Promise<number> {
  const rows = await tx.$queryRaw<Array<{ value: number }>>`
    INSERT INTO "Sequence" ("key", "value", "updatedAt")
    VALUES ('mantenimiento', 1, now())
    ON CONFLICT ("key") DO UPDATE
    SET "value" = "Sequence"."value" + 1, "updatedAt" = now()
    RETURNING "value"
  `;
  return rows[0]?.value ?? 0;
}

function asJson(value: unknown): Prisma.InputJsonValue | undefined {
  return value === undefined || value === null ? undefined : (value as Prisma.InputJsonValue);
}

export async function findMaintenance(identifier: string) {
  const maintenance = await prisma.maintenance.findFirst({
    where: { deletedAt: null, OR: [{ id: identifier }, { numero: identifier }] },
  });
  if (!maintenance) {
    throw new AppError(404, "MAINTENANCE_NOT_FOUND", "El mantenimiento no existe");
  }
  return maintenance;
}

export async function listMaintenances({
  page,
  pageSize,
  search,
}: {
  page: number;
  pageSize: number;
  search?: string;
}) {
  const where = {
    deletedAt: null,
    ...(search
      ? {
          OR: [
            { numero: { contains: search, mode: "insensitive" as const } },
            { tecnicoResponsable: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.maintenance.findMany({
      where,
      orderBy: { sequenceNumber: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.maintenance.count({ where }),
  ]);

  return {
    data,
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

export async function previewNextMaintenanceNumber(): Promise<string> {
  const sequence = await prisma.sequence.findUnique({ where: { key: "mantenimiento" } });
  return formatMaintenanceNumber((sequence?.value ?? 0) + 1);
}

export async function createMaintenance(input: CreateMaintenanceInput, userId: string) {
  return prisma.$transaction(async (tx) => {
    const sequence = await nextMaintenanceNumber(tx);

    return tx.maintenance.create({
      data: {
        numero: formatMaintenanceNumber(sequence),
        sequenceNumber: sequence,
        fecha: new Date(input.fecha),
        estado: input.estado,
        tecnicoResponsable: input.tecnicoResponsable,
        cliente: asJson(input.cliente),
        equipo: asJson(input.equipo),
        problemasReportados: input.problemasReportados,
        diagnosticoInicial: asJson(input.diagnosticoInicial),
        diagnosticoFinal: asJson(input.diagnosticoFinal),
        checklist: asJson(input.checklist),
        accionesRealizadas: input.accionesRealizadas,
        hallazgos: input.hallazgos,
        recomendaciones: input.recomendaciones,
        conclusion: input.conclusion,
        observaciones: input.observaciones,
        notas: input.notas,
        createdById: userId,
      },
    });
  });
}

export async function updateMaintenance(identifier: string, input: UpdateMaintenanceInput) {
  const existing = await findMaintenance(identifier);

  const data: Prisma.MaintenanceUpdateInput = {};
  if (input.fecha !== undefined) data.fecha = new Date(input.fecha);
  if (input.estado !== undefined) data.estado = input.estado;
  if (input.tecnicoResponsable !== undefined) data.tecnicoResponsable = input.tecnicoResponsable;
  if (input.cliente !== undefined) data.cliente = asJson(input.cliente);
  if (input.equipo !== undefined) data.equipo = asJson(input.equipo);
  if (input.problemasReportados !== undefined) {
    data.problemasReportados = input.problemasReportados;
  }
  if (input.diagnosticoInicial !== undefined) {
    data.diagnosticoInicial = asJson(input.diagnosticoInicial);
  }
  if (input.diagnosticoFinal !== undefined) {
    data.diagnosticoFinal = asJson(input.diagnosticoFinal);
  }
  if (input.checklist !== undefined) data.checklist = asJson(input.checklist);
  if (input.accionesRealizadas !== undefined) {
    data.accionesRealizadas = input.accionesRealizadas;
  }
  if (input.hallazgos !== undefined) data.hallazgos = input.hallazgos;
  if (input.recomendaciones !== undefined) data.recomendaciones = input.recomendaciones;
  if (input.conclusion !== undefined) data.conclusion = input.conclusion;
  if (input.observaciones !== undefined) data.observaciones = input.observaciones;
  if (input.notas !== undefined) data.notas = input.notas;

  return prisma.maintenance.update({
    where: { id: existing.id },
    data,
  });
}

export async function deleteMaintenance(identifier: string) {
  const existing = await findMaintenance(identifier);
  await prisma.maintenance.update({
    where: { id: existing.id },
    data: { deletedAt: new Date() },
  });
  return { id: existing.id, numero: existing.numero };
}
