import { z } from "zod";
import { proformaInputSchema } from "@unyx/shared-schemas";

const createProformaSchema = proformaInputSchema
  .extend({
    validezDias: proformaInputSchema.shape.validezDias.default(30),
    estado: proformaInputSchema.shape.estado.default("BORRADOR"),
  })
  .refine((data) => Boolean(data.clienteId) || Boolean(data.cliente), {
    message: "Debe indicar el cliente registrado (clienteId) o los datos del cliente",
  });

const updateProformaSchema = proformaInputSchema.partial();

const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;

const proformaQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().trim().optional(),
  desde: z.string().regex(fechaRegex, "Formato de fecha inválido (YYYY-MM-DD)").optional(),
  hasta: z.string().regex(fechaRegex, "Formato de fecha inválido (YYYY-MM-DD)").optional(),
});

const proformaStatsQuerySchema = z.object({
  desde: z.string().regex(fechaRegex, "Formato de fecha inválido (YYYY-MM-DD)").optional(),
  hasta: z.string().regex(fechaRegex, "Formato de fecha inválido (YYYY-MM-DD)").optional(),
});

const proformaMonthlyQuerySchema = z.object({
  meses: z.coerce.number().int().min(1).max(24).default(6),
});

export {
  createProformaSchema,
  proformaMonthlyQuerySchema,
  proformaQuerySchema,
  proformaStatsQuerySchema,
  updateProformaSchema,
};
