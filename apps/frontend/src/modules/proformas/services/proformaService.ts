import { api } from "@/config/api";
import type { ProformaEstado, ProformaInput } from "@unyx/shared-schemas";
import type { Paginated } from "@unyx/shared-types";

export interface ProformaItemDto {
  id: string;
  cantidad: string;
  precio: string;
  descripcion: string;
  marca: string | null;
  codigo: string | null;
}

export interface ProformaClienteDto {
  id: string;
  nombre: string;
  ruc: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  ciudad: string | null;
}

export interface ProformaDto {
  id: string;
  numero: string;
  sequenceNumber: number;
  fecha: string;
  validezDias: number;
  notas: string | null;
  subtotal: string;
  iva: string;
  total: string;
  estado: string;
  cliente: ProformaClienteDto;
  items: ProformaItemDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ListOptions {
  page?: number;
  pageSize?: number;
  search?: string;
}

export async function listProformas(options: ListOptions = {}): Promise<Paginated<ProformaDto>> {
  const { page = 1, pageSize = 50, search = "" } = options;
  const { data } = await api.get<Paginated<ProformaDto>>("/proformas", {
    params: { page, pageSize, search: search || undefined },
  });
  return data;
}

export async function getProforma(numeroOrId: string): Promise<ProformaDto> {
  const { data } = await api.get<ProformaDto>(`/proformas/${encodeURIComponent(numeroOrId)}`);
  return data;
}

export async function previewNextProformaNumber(): Promise<string> {
  const { data } = await api.get<{ numero: string }>("/proformas/numero-siguiente");
  return data.numero;
}

export async function createProforma(payload: ProformaInput): Promise<ProformaDto> {
  const { data } = await api.post<ProformaDto>("/proformas", payload);
  return data;
}

export async function updateProforma(
  numeroOrId: string,
  payload: Partial<ProformaInput>
): Promise<ProformaDto> {
  const { data } = await api.put<ProformaDto>(
    `/proformas/${encodeURIComponent(numeroOrId)}`,
    payload
  );
  return data;
}

export async function saveProforma(payload: ProformaInput & { id?: string }): Promise<ProformaDto> {
  if (payload.id) {
    const { id, ...rest } = payload;
    return updateProforma(id, rest);
  }
  return createProforma(payload);
}

export async function updateProformaStatus(
  numeroOrId: string,
  estado: ProformaEstado
): Promise<ProformaDto> {
  return updateProforma(numeroOrId, { estado });
}

export async function deleteProforma(
  numeroOrId: string
): Promise<{ id: string; numero: string }> {
  const { data } = await api.delete<{ id: string; numero: string }>(
    `/proformas/${encodeURIComponent(numeroOrId)}`
  );
  return data;
}
