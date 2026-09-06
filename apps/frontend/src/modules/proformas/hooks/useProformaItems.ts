import { useCallback, useMemo, useState } from "react";
import { calculateTotals, type Totals } from "@/modules/common/utils/monetary";

export interface ProformaItemState {
  id: string;
  codigo: string;
  descripcion: string;
  marca: string;
  cantidad: number;
  precio: number;
}

export interface ProductSelector {
  ref?: string | null;
  codigo?: string | null;
  name?: string | null;
  nombre?: string | null;
  brand?: string | null;
  marca?: string | null;
  price?: unknown;
  precio?: unknown;
}

export interface ItemInput {
  id?: string;
  codigo?: string | null;
  descripcion?: string;
  marca?: string | null;
  cantidad?: string | number | null;
  precio?: string | number | null;
}

export type ProformaItemField = "codigo" | "descripcion" | "marca" | "cantidad" | "precio";

function newItemId(): string {
  return crypto.randomUUID();
}

export function useProformaItems() {
  const [items, setItems] = useState<ProformaItemState[]>([]);

  const addProduct = useCallback((product: ProductSelector) => {
    setItems((current) => [
      ...current,
      {
        id: newItemId(),
        codigo: String(product.ref || product.codigo || ""),
        descripcion: String(product.name || product.nombre || ""),
        marca: String(product.brand || product.marca || ""),
        cantidad: 1,
        precio: Number(product.price || product.precio || 0),
      },
    ]);
  }, []);

  const addManual = useCallback((description: string) => {
    setItems((current) => [
      ...current,
      {
        id: newItemId(),
        codigo: "",
        descripcion: description,
        marca: "",
        cantidad: 1,
        precio: 0,
      },
    ]);
  }, []);

  const updateItem = useCallback((id: string, field: ProformaItemField, value: string | number) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === "cantidad" || field === "precio" ? Number(value) : value,
            }
          : item
      )
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const loadItems = useCallback((list: ItemInput[]) => {
    setItems(
      (list || []).map((item) => ({
        id: item.id || newItemId(),
        codigo: String(item.codigo || ""),
        descripcion: String(item.descripcion || ""),
        marca: String(item.marca || ""),
        cantidad: Number(item.cantidad || 0),
        precio: Number(item.precio || 0),
      }))
    );
  }, []);

  const totals: Totals = useMemo(() => calculateTotals(items), [items]);

  return { items, loadItems, addProduct, addManual, updateItem, removeItem, totals };
}

export type UseProformaItems = ReturnType<typeof useProformaItems>;
