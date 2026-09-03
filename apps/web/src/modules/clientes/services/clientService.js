import { api } from "../../../config/api";

export async function getClients({ page = 1, pageSize = 100, search = "" } = {}) {
  const { data } = await api.get("/clientes", {
    params: { page, pageSize, search: search || undefined },
  });
  return data.data;
}

export async function addClient(client) {
  const { data } = await api.post("/clientes", client);
  return data;
}

export async function updateClient(id, client) {
  const { data } = await api.put(`/clientes/${encodeURIComponent(id)}`, client);
  return data;
}

export async function deleteClient(id) {
  const { data } = await api.delete(`/clientes/${encodeURIComponent(id)}`);
  return data;
}
