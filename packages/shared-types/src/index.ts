export type UserRole = "ADMIN" | "COMERCIAL" | "TECNICO" | "CLIENTE";

export type ProformaEstado = "BORRADOR" | "EMITIDA" | "ACEPTADA" | "CERRADA";

export type MantenimientoEstado =
  | "EN_REVISION"
  | "EN_MANTENIMIENTO"
  | "FINALIZADO"
  | "ENTREGADO";

export type ClientStatus = "Activo" | "Pendiente" | "Inactivo";

export interface UserSummary {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Client {
  id: string;
  nombre: string;
  ruc: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  ciudad: string | null;
  estado?: string;
}

export interface ProformaItem {
  id: string;
  codigo: string | null;
  descripcion: string;
  marca: string | null;
  cantidad: number;
  precio: number;
}

export interface Proforma {
  id: string;
  numero: string;
  sequenceNumber: number;
  fecha: string;
  validezDias: number;
  notas: string | null;
  subtotal: string;
  iva: string;
  total: string;
  estado: ProformaEstado;
  cliente: Client;
  items: ProformaItem[];
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}
