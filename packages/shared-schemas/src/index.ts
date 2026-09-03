import { z } from "zod";

export const clientSchema = z.object({
  nombre: z.string().trim().min(2),
  ruc: z.string().trim().min(10),
  email: z.email().optional().or(z.literal("")),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
});

export const clientStatusEnum = z.enum(["Activo", "Pendiente", "Inactivo"]);

export const proformaItemSchema = z.object({
  codigo: z.string().optional(),
  descripcion: z.string().trim().min(1),
  marca: z.string().optional(),
  cantidad: z.coerce.number().positive(),
  precio: z.coerce.number().nonnegative(),
});

export const proformaEstadoEnum = z.enum([
  "BORRADOR",
  "EMITIDA",
  "ACEPTADA",
  "CERRADA",
]);

export const proformaInputSchema = z.object({
  clienteId: z.string().optional(),
  cliente: clientSchema.optional(),
  fecha: z.string().min(1),
  validezDias: z.coerce.number().int().min(1).max(365),
  items: z.array(proformaItemSchema).min(1),
  notas: z.string().optional(),
  estado: proformaEstadoEnum,
});

export const proformaSchema = proformaInputSchema;

export type ClientInput = z.infer<typeof clientSchema>;
export type ClientStatus = z.infer<typeof clientStatusEnum>;
export type ProformaItemInput = z.infer<typeof proformaItemSchema>;
export type ProformaEstado = z.infer<typeof proformaEstadoEnum>;
export type ProformaInput = z.infer<typeof proformaInputSchema>;
