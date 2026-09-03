import { api } from "../../../config/api";

function toProductView(product) {
  return {
    ...product,
    ref: product.codigo,
    name: product.nombre,
    brand: product.marca,
    category: product.categoria,
    price: Number(product.precio ?? 0),
  };
}

export async function getProducts({ page = 1, pageSize = 200, search = "" } = {}) {
  const { data } = await api.get("/productos", {
    params: { page, pageSize, search: search || undefined },
  });
  return data.data.map(toProductView);
}

export async function addProduct(product) {
  const { data } = await api.post("/productos", product);
  return toProductView(data);
}

export async function updateProduct(id, product) {
  const { data } = await api.put(`/productos/${encodeURIComponent(id)}`, product);
  return toProductView(data);
}

export async function deleteProduct(id) {
  const { data } = await api.delete(`/productos/${encodeURIComponent(id)}`);
  return data;
}
