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

export const maintenanceEstadoEnum = z.enum([
  "EN_REVISION",
  "EN_MANTENIMIENTO",
  "FINALIZADO",
  "ENTREGADO",
]);

export const maintenanceEquipoSchema = z.object({
  tipo: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  numeroSerie: z.string().optional(),
  sistemaOperativo: z.string().optional(),
  procesador: z.string().optional(),
  ram: z.string().optional(),
  almacenamiento: z.string().optional(),
  cargadorEntregado: z.boolean().optional(),
  accesorios: z.string().optional(),
});

export const maintenanceDiagnosticoSchema = z.record(z.string(), z.string());

export const maintenanceChecklistItemSchema = z.object({
  id: z.number(),
  categoria: z.string(),
  actividad: z.string(),
  estado: z.string(),
  observacion: z.string(),
});

export const maintenanceClienteSchema = z.object({
  nombre: z.string().optional(),
  ruc: z.string().optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  ciudad: z.string().optional(),
});

export const maintenanceInputSchema = z.object({
  fecha: z.string().min(1),
  estado: maintenanceEstadoEnum,
  tecnicoResponsable: z.string().optional(),
  cliente: maintenanceClienteSchema.optional(),
  equipo: maintenanceEquipoSchema.optional(),
  problemasReportados: z.array(z.string()),
  diagnosticoInicial: maintenanceDiagnosticoSchema.optional(),
  diagnosticoFinal: maintenanceDiagnosticoSchema.optional(),
  checklist: z.array(maintenanceChecklistItemSchema).optional(),
  accionesRealizadas: z.string().optional(),
  hallazgos: z.array(z.string()),
  recomendaciones: z.array(z.string()),
  conclusion: z.string().optional(),
  observaciones: z.string().optional(),
  notas: z.string().optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;
export type ClientStatus = z.infer<typeof clientStatusEnum>;
export type ProformaItemInput = z.infer<typeof proformaItemSchema>;
export type ProformaEstado = z.infer<typeof proformaEstadoEnum>;
export type ProformaInput = z.infer<typeof proformaInputSchema>;
export type MaintenanceEstado = z.infer<typeof maintenanceEstadoEnum>;
export type MaintenanceEquipoInput = z.infer<typeof maintenanceEquipoSchema>;
export type MaintenanceInput = z.infer<typeof maintenanceInputSchema>;
