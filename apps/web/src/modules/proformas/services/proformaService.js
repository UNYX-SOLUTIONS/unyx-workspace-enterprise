import { api } from "../../../config/api";

export async function listProformas({ page = 1, pageSize = 50, search = "" } = {}) {
  const { data } = await api.get("/proformas", {
    params: { page, pageSize, search: search || undefined },
  });
  return data;
}

export async function getProforma(numeroOrId) {
  const { data } = await api.get(`/proformas/${encodeURIComponent(numeroOrId)}`);
  return data;
}

export async function previewNextProformaNumber() {
  const { data } = await api.get("/proformas/numero-siguiente");
  return data.numero;
}

export async function createProforma(payload) {
  const { data } = await api.post("/proformas", payload);
  return data;
}

export async function updateProforma(numeroOrId, payload) {
  const { data } = await api.put(`/proformas/${encodeURIComponent(numeroOrId)}`, payload);
  return data;
}

export async function saveProforma(payload) {
  if (payload.id) {
    const { id, ...rest } = payload;
    void id;
    return updateProforma(payload.id, rest);
  }
  return createProforma(payload);
}

export async function updateProformaStatus(numeroOrId, estado) {
  return updateProforma(numeroOrId, { estado });
}

export async function deleteProforma(numeroOrId) {
  const { data } = await api.delete(`/proformas/${encodeURIComponent(numeroOrId)}`);
  return data;
}
