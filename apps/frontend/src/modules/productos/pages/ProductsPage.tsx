import { useEffect, useMemo, useState } from "react";
import { PackageSearch } from "lucide-react";

import {
  ActionButton,
  Card,
  EmptyState,
  LoadingSpinner,
  Modal,
  PageHeader,
} from "../../../components/common";
import { useToast } from "@/hooks/useToast";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

import { ProductForm, type ProductFormValues } from "@/modules/productos/components/ProductForm";

import {
  addProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  type ProductView,
} from "../services/productService";

export default function ProductsPage() {
  const { showError, showSuccess } = useToast();
  const [products, setProducts] = useState<ProductView[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductView | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

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

  function handleOpenModal(product: ProductView | null = null) {
    setEditingProduct(product);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    if (isSubmitting) return;

    setIsModalOpen(false);
    setEditingProduct(null);
  }

  async function handleSaveProduct(formData: ProductFormValues) {
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
      showSuccess(
        editingProduct
          ? "Producto actualizado correctamente."
          : "Producto creado correctamente."
      );
    } catch (error) {
      console.error("Error al guardar producto:", error);
      showError(
        `Error al guardar el producto: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteProduct(productId: string) {
    if (deletingProductId !== productId) {
      setDeletingProductId(productId);
      return;
    }

    try {
      await deleteProduct(productId);
      setDeletingProductId(null);
      await refreshProducts();
      showSuccess("Producto eliminado.");
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      setDeletingProductId(null);
      showError(
        `Error al eliminar el producto: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  const debouncedSearch = useDebouncedValue(search);
  const isSearching = search.trim() !== debouncedSearch.trim();
  const normalizedSearch = debouncedSearch.trim().toLowerCase();

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
        <p className="mt-4 text-slate-600 dark:text-slate-400">Cargando productos...</p>
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
            className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-500 hover:bg-blue-600 px-6 py-3 font-bold text-white transition-all hover:scale-105 hover:shadow-lg"
          >
            + Nuevo Producto
          </button>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <label className="w-full sm:max-w-xs">
            <span className="sr-only">Buscar producto</span>
            <input
              type="search"
              placeholder="Buscar producto..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </label>
        </div>

        <div className="relative">
          <div
            className={`overflow-x-auto transition-opacity duration-150 ${
              isSearching ? "pointer-events-none opacity-50" : "opacity-100"
            }`}
          >
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <th className="px-4 py-4 text-xs font-bold uppercase text-slate-600 dark:text-slate-400 sm:px-6">
                  Ref
                </th>
                <th className="px-4 py-4 text-xs font-bold uppercase text-slate-600 dark:text-slate-400 sm:px-6">
                  Producto
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold uppercase text-slate-600 dark:text-slate-400 sm:px-6">
                  Precio
                </th>
                <th className="px-4 py-4 text-center text-xs font-bold uppercase text-slate-600 dark:text-slate-400 sm:px-6">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="animate-fade-in transition-colors group hover:bg-slate-100 dark:hover:bg-slate-800">
                  <td className="px-4 py-4 font-mono text-xs font-bold text-blue-600 sm:px-6">
                    {product?.ref || "Sin referencia"}
                  </td>

                  <td className="px-4 py-4 sm:px-6">
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      {product?.name || "Producto sin nombre"}
                    </p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {product?.category || product?.brand || "Sin categoría"}
                    </p>
                  </td>

                  <td className="px-4 py-4 text-right font-bold text-slate-900 dark:text-slate-100 sm:px-6">
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
                        label={deletingProductId === product.id ? "¿Confirmar?" : "Eliminar"}
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
                      icon={<PackageSearch className="h-10 w-10 text-slate-300" aria-hidden="true" />}
                      title={normalizedSearch ? "Sin resultados" : "Sin productos"}
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
                            className="rounded-lg bg-blue-500 px-6 py-2 font-bold text-white transition-colors hover:bg-blue-600"
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

          {isSearching && (
            <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-16">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-sm text-slate-600 dark:text-slate-400 sm:p-6">
          Mostrando <span className="font-bold">{filteredProducts.length}</span> de{" "}
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
