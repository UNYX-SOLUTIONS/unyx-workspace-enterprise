import { z } from "zod";

export const clientSchema = z.object({
  nombre: z.string().min(2),
  ruc: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
});

export const proformaItemSchema = z.object({
  codigo: z.string().min(1),
  descripcion: z.string().min(1),
  marca: z.string().optional(),
  cantidad: z.coerce.number().positive(),
  precio: z.coerce.number().nonnegative(),
});

export const proformaSchema = z.object({
  numero: z.string().min(1),
  fecha: z.string().min(1),
  validezDias: z.coerce.number().int().positive().default(5),
  cliente: clientSchema,
  items: z.array(proformaItemSchema).min(1),
  notas: z.string().optional(),
});
