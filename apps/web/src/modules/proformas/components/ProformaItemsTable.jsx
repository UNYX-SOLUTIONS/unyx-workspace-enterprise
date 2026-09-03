import { useEffect, useMemo, useState } from "react";

import { Card, Modal } from "../../../components/common";
import { useToast } from "../../../hooks/useToast";
import { ProductForm } from "../../productos/components/ProductForm";
import { addProduct, getProducts } from "../../productos/services/productService";
import { formatCurrency, lineTotalCents } from "../utils/monetary";

export default function ProformaItemsTable({ items }) {
  const { showError, showSuccess } = useToast();

  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    getProducts({ pageSize: 200 })
      .then((data) => {
        if (active) setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => showError("No fue posible cargar los productos."));
    return () => {
      active = false;
    };
  }, [showError]);

  const filteredProducts = useMemo(() => {
    const search = productSearch.trim().toLowerCase();
    if (!search) return products;
    return products.filter(
      (product) =>
        String(product.name || "").toLowerCase().includes(search) ||
        String(product.ref || "").toLowerCase().includes(search) ||
        String(product.brand || "").toLowerCase().includes(search)
    );
  }, [products, productSearch]);

  const handleCreateProduct = async (formData) => {
    const savedProduct = await addProduct(formData);
    const updated = await getProducts({ pageSize: 200 });
    setProducts(Array.isArray(updated) ? updated : []);
    const created = updated.find((product) => product.id === savedProduct.id);
    if (created) {
      items.addProduct(created);
      setProductSearch("");
      setShowProductDropdown(false);
    }
    setIsProductModalOpen(false);
    showSuccess("Producto creado y añadido.");
  };

  return (
    <Card className="overflow-visible">
      <div className="border-b border-[#c7c6cb] bg-gradient-to-r from-[#eff4ff] to-[#dce9ff] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="text-xl font-bold text-[#010105]">Detalle de Ítems</h3>

          <div className="relative w-full lg:w-[420px]">
            <input
              type="text"
              value={productSearch}
              onChange={(event) => {
                setProductSearch(event.target.value);
                setShowProductDropdown(true);
              }}
              onFocus={() => setShowProductDropdown(true)}
              placeholder="Buscar producto por nombre, código o marca..."
              className="w-full rounded-lg border border-[#c7c6cb] bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-[#2170e4]"
            />

            {showProductDropdown && (
              <div className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-[#c7c6cb] bg-white shadow-xl">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      items.addProduct(product);
                      setProductSearch("");
                      setShowProductDropdown(false);
                    }}
                    className="w-full border-b border-[#f0f0f0] px-4 py-3 text-left hover:bg-[#eff4ff]"
                  >
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-bold text-[#010105]">{product.name}</p>
                        <p className="text-xs text-[#46464b]">
                          {product.ref} · {product.brand || "Sin marca"}
                        </p>
                      </div>
                      <p className="whitespace-nowrap font-bold text-[#2170e4]">
                        {formatCurrency(Math.round(Number(product.price || 0) * 100))}
                      </p>
                    </div>
                  </button>
                ))}

                {productSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      items.addManual(productSearch);
                      setProductSearch("");
                      setShowProductDropdown(false);
                    }}
                    className="w-full bg-[#eff4ff] px-4 py-3 text-left font-bold text-[#0058be] hover:bg-[#dce9ff]"
                  >
                    + Añadir ítem manual: "{productSearch}"
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowProductDropdown(false);
                    setIsProductModalOpen(true);
                  }}
                  className="w-full border-t border-[#c7c6cb] bg-white px-4 py-3 text-left font-bold text-[#010105] hover:bg-[#eff4ff]"
                >
                  + Crear producto nuevo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#dce9ff] text-left">
              <th className="px-4 py-3 font-bold text-[#010105]">Código</th>
              <th className="px-4 py-3 font-bold text-[#010105]">Descripción</th>
              <th className="px-4 py-3 text-right font-bold text-[#010105]">Cantidad</th>
              <th className="px-4 py-3 text-right font-bold text-[#010105]">Precio</th>
              <th className="px-4 py-3 text-right font-bold text-[#010105]">Total</th>
              <th className="w-12 px-4 py-3 text-center" />
            </tr>
          </thead>
          <tbody>
            {items.items.map((item) => (
              <tr key={item.id} className="border-b transition-colors hover:bg-[#eff4ff]">
                <td className="px-4 py-3">
                  <input
                    className="w-full bg-transparent font-mono text-xs outline-none"
                    value={item.codigo}
                    onChange={(event) => items.updateItem(item.id, "codigo", event.target.value)}
                    placeholder="Código"
                  />
                </td>
                <td className="min-w-[280px] px-4 py-3">
                  <input
                    className="w-full bg-transparent outline-none"
                    value={item.descripcion}
                    onChange={(event) => items.updateItem(item.id, "descripcion", event.target.value)}
                    placeholder="Descripción"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-20 bg-transparent text-right outline-none"
                    value={item.cantidad}
                    onChange={(event) => items.updateItem(item.id, "cantidad", event.target.value)}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-24 bg-transparent text-right outline-none"
                    value={item.precio}
                    onChange={(event) => items.updateItem(item.id, "precio", event.target.value)}
                  />
                </td>
                <td className="px-4 py-3 text-right font-bold text-[#2170e4]">
                  {formatCurrency(lineTotalCents(item.cantidad, item.precio))}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => items.removeItem(item.id)}
                    className="font-bold text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}

            {items.items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#46464b]">
                  Busca un producto o añade un ítem manual para empezar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title="Nuevo Producto"
        size="lg"
      >
        <ProductForm onSubmit={handleCreateProduct} />
      </Modal>
    </Card>
  );
}
