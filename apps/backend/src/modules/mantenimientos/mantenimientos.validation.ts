import { z } from "zod";
import { maintenanceInputSchema } from "@unyx/shared-schemas";

export const createMaintenanceSchema = maintenanceInputSchema.extend({
  estado: maintenanceInputSchema.shape.estado.default("EN_REVISION"),
  problemasReportados: maintenanceInputSchema.shape.problemasReportados.default([]),
  hallazgos: maintenanceInputSchema.shape.hallazgos.default([]),
  recomendaciones: maintenanceInputSchema.shape.recomendaciones.default([]),
});

export const updateMaintenanceSchema = maintenanceInputSchema.partial();

export const maintenanceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().trim().optional(),
});
