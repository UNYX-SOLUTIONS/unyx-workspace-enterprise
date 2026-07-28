import { useEffect, useMemo, useState } from "react";

import {
  ActionButton,
  Card,
  EmptyState,
  LoadingSpinner,
  Modal,
  PageHeader,
} from "../../../components/common";

import { ProductForm } from "../components/ProductForm";

import {
  addProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../services/productService";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      try {
        setLoading(true);
        const data = await getProducts();

        if (isMounted) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  async function refreshProducts() {
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al recargar productos:", error);
      throw error;
    }
  }

  function handleOpenModal(product = null) {
    setEditingProduct(product);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    if (isSubmitting) return;

    setIsModalOpen(false);
    setEditingProduct(null);
  }

  async function handleSaveProduct(formData) {
    try {
      setIsSubmitting(true);

      if (editingProduct?.id) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await addProduct(formData);
      }

      await refreshProducts();
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Error al guardar producto:", error);
      window.alert(
        `Error al guardar el producto:\n${
          error?.message || "Error desconocido"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteProduct(productId) {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar este producto?"
    );

    if (!confirmed) return;

    try {
      await deleteProduct(productId);
      await refreshProducts();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      window.alert(
        `Error al eliminar el producto:\n${
          error?.message || "Error desconocido"
        }`
      );
    }
  }

  const normalizedSearch = search.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    if (!normalizedSearch) return products;

    return products.filter((product) => {
      const name = String(product?.name || "").toLowerCase();
      const ref = String(product?.ref || "").toLowerCase();
      const brand = String(product?.brand || "").toLowerCase();
      const category = String(product?.category || "").toLowerCase();

      return (
        name.includes(normalizedSearch) ||
        ref.includes(normalizedSearch) ||
        brand.includes(normalizedSearch) ||
        category.includes(normalizedSearch)
      );
    });
  }, [products, normalizedSearch]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-[#46464b]">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Gestión de Productos"
        subtitle="Administra el catálogo para usarlo en tus proformas."
        action={
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-gradient-to-r from-[#2170e4] to-[#0058be] px-6 py-3 font-bold text-white transition-all hover:scale-105 hover:shadow-lg"
          >
            + Nuevo Producto
          </button>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[#c7c6cb] bg-gradient-to-r from-[#eff4ff] to-[#dce9ff] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-[#c7c6cb] bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-[#e5eeff]"
            >
              📊 Filtrar
            </button>

            <button
              type="button"
              className="rounded-lg border border-[#c7c6cb] bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-[#e5eeff]"
            >
              🔤 Ordenar
            </button>
          </div>

          <label className="w-full sm:max-w-xs">
            <span className="sr-only">Buscar producto</span>
            <input
              type="search"
              placeholder="Buscar producto..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-[#c7c6cb] bg-white px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-[#2170e4]"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#c7c6cb] bg-[#eff4ff]">
                <th className="px-4 py-4 text-xs font-bold uppercase text-[#46464b] sm:px-6">
                  Ref
                </th>
                <th className="px-4 py-4 text-xs font-bold uppercase text-[#46464b] sm:px-6">
                  Producto
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold uppercase text-[#46464b] sm:px-6">
                  Precio
                </th>
                <th className="px-4 py-4 text-center text-xs font-bold uppercase text-[#46464b] sm:px-6">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#c7c6cb]">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="group transition-colors hover:bg-[#eff4ff]"
                >
                  <td className="px-4 py-4 font-mono text-xs font-bold text-[#2170e4] sm:px-6">
                    {product?.ref || "Sin referencia"}
                  </td>

                  <td className="px-4 py-4 sm:px-6">
                    <p className="font-bold text-[#010105]">
                      {product?.name || "Producto sin nombre"}
                    </p>
                    <p className="mt-1 text-xs text-[#46464b]">
                      {product?.category || product?.brand || "Sin categoría"}
                    </p>
                  </td>

                  <td className="px-4 py-4 text-right font-bold text-[#010105] sm:px-6">
                    ${Number(product?.price || 0).toFixed(2)}
                  </td>

                  <td className="px-4 py-4 text-center sm:px-6">
                    <div className="flex justify-center gap-2 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                      <ActionButton
                        label="Editar"
                        variant="primary"
                        onClick={() => handleOpenModal(product)}
                      />
                      <ActionButton
                        label="Eliminar"
                        variant="danger"
                        onClick={() => handleDeleteProduct(product.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <EmptyState
                      icon="📦"
                      title={
                        normalizedSearch ? "Sin resultados" : "Sin productos"
                      }
                      description={
                        normalizedSearch
                          ? "No se encontraron productos con esa búsqueda."
                          : "Crea tu primer producto para comenzar."
                      }
                      action={
                        !normalizedSearch ? (
                          <button
                            type="button"
                            onClick={() => handleOpenModal()}
                            className="rounded-lg bg-[#2170e4] px-6 py-2 font-bold text-white transition-colors hover:bg-[#0058be]"
                          >
                            + Crear Producto
                          </button>
                        ) : null
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#c7c6cb] bg-white p-4 text-sm text-[#46464b] sm:p-6">
          Mostrando{" "}
          <span className="font-bold">{filteredProducts.length}</span> de{" "}
          <span className="font-bold">{products.length}</span> productos
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
        size="lg"
      >
        <ProductForm
          initialData={editingProduct}
          onSubmit={handleSaveProduct}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
}
