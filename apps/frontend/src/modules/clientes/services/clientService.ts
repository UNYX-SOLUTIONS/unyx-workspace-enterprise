import { api } from "@/config/api";

export type ClientDto = {
  id: string;
  nombre: string;
  ruc: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  ciudad: string | null;
  estado?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export interface ListOptions {
  page?: number;
  pageSize?: number;
  search?: string;
}

export async function getClients(options: ListOptions = {}): Promise<ClientDto[]> {
  const { page = 1, pageSize = 100, search = "" } = options;
  const { data } = await api.get<{ data: ClientDto[] }>("/clientes", {
    params: { page, pageSize, search: search || undefined },
  });
  return data.data;
}

export async function addClient(client: unknown): Promise<ClientDto> {
  const { data } = await api.post<ClientDto>("/clientes", client);
  return data;
}

export async function updateClient(id: string, client: unknown): Promise<ClientDto> {
  const { data } = await api.put<ClientDto>(`/clientes/${encodeURIComponent(id)}`, client);
  return data;
}

export async function deleteClient(id: string): Promise<{ id: string }> {
  const { data } = await api.delete<{ id: string }>(`/clientes/${encodeURIComponent(id)}`);
  return data;
}
