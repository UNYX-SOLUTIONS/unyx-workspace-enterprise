import { api } from "../../../config/api";

export type ProductDto = {
  id: string;
  codigo: string;
  nombre: string;
  marca: string | null;
  categoria: string | null;
  precio: string;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductView = ProductDto & {
  ref: string;
  name: string;
  brand: string;
  category: string | null;
  price: number;
};

export interface ListOptions {
  page?: number;
  pageSize?: number;
  search?: string;
}

function toProductView(product: ProductDto): ProductView {
  return {
    ...product,
    ref: product.codigo,
    name: product.nombre,
    brand: product.marca ?? "",
    category: product.categoria,
    price: Number(product.precio ?? 0),
  };
}

export async function getProducts(options: ListOptions = {}): Promise<ProductView[]> {
  const { page = 1, pageSize = 200, search = "" } = options;
  const { data } = await api.get<{ data: ProductDto[] }>("/productos", {
    params: { page, pageSize, search: search || undefined },
  });
  return data.data.map(toProductView);
}

export async function addProduct(product: unknown): Promise<ProductView> {
  const { data } = await api.post<ProductDto>("/productos", product);
  return toProductView(data);
}

export async function updateProduct(id: string, product: unknown): Promise<ProductView> {
  const { data } = await api.put<ProductDto>(`/productos/${encodeURIComponent(id)}`, product);
  return toProductView(data);
}

export async function deleteProduct(id: string): Promise<{ id: string }> {
  const { data } = await api.delete<{ id: string }>(`/productos/${encodeURIComponent(id)}`);
  return data;
}
