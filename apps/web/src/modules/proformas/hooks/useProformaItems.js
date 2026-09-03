import { useCallback, useMemo, useState } from "react";
import { calculateTotals } from "../utils/monetary";

function newItemId() {
  return crypto.randomUUID();
}

export function useProformaItems() {
  const [items, setItems] = useState([]);

  const addProduct = useCallback((product) => {
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

  const addManual = useCallback((description) => {
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

  const updateItem = useCallback((id, field, value) => {
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

  const removeItem = useCallback((id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const loadItems = useCallback((list) => {
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

  const totals = useMemo(() => calculateTotals(items), [items]);

  return { items, loadItems, addProduct, addManual, updateItem, removeItem, totals };
}
