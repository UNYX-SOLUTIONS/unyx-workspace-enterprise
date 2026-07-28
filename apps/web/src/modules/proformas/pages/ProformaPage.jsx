import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  previewNextProformaNumber,
  saveProforma,
  getProforma,
} from "../services/proformaService";
import { getProducts, addProduct } from "../../productos/services/productService";
import { ProductForm } from "../../productos/components/ProductForm";
import { Modal, PageHeader, Card, InputField } from "../../../components/common";

import { generatePdf } from "../utils/generatePdf";

import { ClientForm } from "../../clientes/components/ClientForm"; 
import { getClients, addClient } from "../../clientes/services/clientService";

const IVA_RATE = 0.15;
export default function ProformaPage() {
  const { numero: routeNumero } = useParams();
  const [numero, setNumero] = useState("");
  const [loading, setLoading] = useState(false);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [validezDias, setValidezDias] = useState(30); 
  const [notas, setNotas] = useState("");
const [clients, setClients] = useState([]);
const [clientSearch, setClientSearch] = useState("");
const [showClientDropdown, setShowClientDropdown] = useState(false);
const [isClientModalOpen, setIsClientModalOpen] = useState(false);

const [products, setProducts] = useState([]);
const [productSearch, setProductSearch] = useState("");
const [showProductDropdown, setShowProductDropdown] = useState(false);
const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [cliente, setCliente] = useState({
    nombre: "",
    ruc: "",
    direccion: "",
    telefono: "",
    ciudad: "Guayaquil",
  });

const [items, setItems] = useState([]);

useEffect(() => {
  if (routeNumero) return;

  async function cargar() {
    try {
      const next = await previewNextProformaNumber();
      setNumero(next);
    } catch (error) {
      console.error("Error cargando número de proforma:", error);
    }
  }

  cargar();
}, [routeNumero]);


useEffect(() => {
  async function fetchClients() {
    try {
      const data = await getClients();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando clientes:", error);
    }
  }

  fetchClients();
}, []);

useEffect(() => {
  async function fetchProducts() {
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  }

  fetchProducts();
}, []);

useEffect(() => {
  if (!routeNumero) return;

  async function loadSelectedProforma() {
    try {
      const data = await getProforma(routeNumero);

      if (!data) {
        alert("No se encontró la proforma seleccionada.");
        return;
      }

      setNumero(data.numero || routeNumero);
      setCliente(data.cliente || {
        nombre: "",
        ruc: "",
        direccion: "",
        telefono: "",
        ciudad: "Guayaquil",
      });
      setItems(data.items || []);
      setFecha(data.fechaInput || new Date().toISOString().split("T")[0]);
      setValidezDias(data.validezDias || 5); 
      setNotas(data.notas || "");

    } catch (error) {
      console.error("Error cargando proforma:", error);
      alert("Error cargando la proforma.");
    }
  }

  loadSelectedProforma();
}, [routeNumero]);

const seleccionarProducto = (product) => {
  setItems((prev) => [
    ...prev,
    {
      codigo: product.ref || "",
      descripcion: product.name || "",
      cantidad: 1,
      precio: Number(product.price || 0),
    },
  ]);

  setProductSearch("");
  setShowProductDropdown(false);
};

const agregarItemManual = () => {
  setItems((prev) => [
    ...prev,
    {
      codigo: "",
      descripcion: productSearch || "",
      cantidad: 1,
      precio: 0,
    },
  ]);

  setProductSearch("");
  setShowProductDropdown(false);
};




const seleccionarCliente = (client) => {
  setCliente({
    nombre: client.nombre || "",
    ruc: client.ruc || "",
    direccion: client.direccion || "",
    telefono: client.telefono || "",
    ciudad: client.ciudad || "Guayaquil",
  });

  setClientSearch(client.nombre);
  setShowClientDropdown(false);
};

  const subtotal = items.reduce(
    (acc, item) => acc + Number(item.cantidad || 0) * Number(item.precio || 0),
    0
  );

  const iva = subtotal * IVA_RATE;
  const total = subtotal + iva;

  const actualizarCliente = (campo, valor) => {
    setCliente({ ...cliente, [campo]: valor });
  };

  const actualizarItem = (index, campo, valor) => {
    const nuevosItems = [...items];

    nuevosItems[index][campo] =
      campo === "cantidad" || campo === "precio" ? Number(valor) : valor;

    setItems(nuevosItems);
  };
 

  const eliminarItem = (index) => {
    setItems((currentItems) =>
      currentItems.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const buscarProforma = async () => {
    if (!numero) return alert("Ingrese un número de proforma");

    setLoading(true);

    try {
      const data = await getProforma(numero);

      if (!data) {
        alert("No se encontró una proforma con ese número.");
        return;
      }

      setCliente(data.cliente || cliente);
      setItems(data.items || items);
      setFecha(data.fechaInput || fecha);
      setValidezDias(data.validezDias || 5); 
      setNotas(data.notas || "");

      alert("Proforma cargada correctamente.");
    } catch (error) {
      console.error(error);
      alert("Error al buscar la proforma.");
    } finally {
      setLoading(false);
    }
  };

  const guardar = async () => {
    if (!numero || !cliente.nombre || !cliente.ruc) {
      alert("Ingrese número de proforma, cliente y RUC.");
      return;
    }

    const data = {
      numero,
      cliente,
      items,
      subtotal,
      iva,
      total,
      fecha: new Date(fecha).toISOString(),
      fechaInput: fecha,
      validezDias, 
      notas,
      estado: "emitida",
    };

    setLoading(true);

    try {
      await saveProforma(data);
   await    generatePdf(data);
const siguienteNumero = await previewNextProformaNumber();
      setNumero(siguienteNumero);

      setItems([
        {
          codigo: "",
          descripcion: "",
          marca: "",
          cantidad: 1,
          precio: 0,
        },
      ]);

      alert("Proforma guardada correctamente.");
    } catch (error) {
      console.error(error);
      alert("Error al guardar la proforma.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title={routeNumero ? "Editar Proforma" : "Crear Nueva Proforma"}
        subtitle="Complete los campos para generar la proforma oficial."
        action={
          <div className="flex gap-3 flex-col sm:flex-row w-full sm:w-auto">
            <button
              type="button"
              onClick={buscarProforma}
              disabled={loading}
              className="px-4 py-2 border border-[#c7c6cb] rounded-lg font-semibold hover:bg-[#eff4ff] transition-colors disabled:opacity-50"
            >
              🔍 Buscar
            </button>
            <button
              type="button"
              onClick={guardar}
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-[#2170e4] to-[#0058be] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "⏳ Procesando..." : "📄 Emitir"}
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Datos del Emisor */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6 text-[#010105]">📋 Datos del Emisor</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Razón Social" value="UNYX SOLUTIONS S.A.S." readOnly />
              <InputField label="RUC" value="0993406012001" readOnly />
              <InputField label="Teléfono" value="+593 98 336 1386" readOnly />
              <InputField label="Dirección" value="Guayaquil, Ecuador" readOnly className="sm:col-span-2" />
            </div>
          </Card>

          {/* Datos de la Proforma */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6 text-[#010105]">📝 Datos de la Proforma</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <InputField
                label="Número"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="Auto generado"
              />
              <InputField
                label="Fecha de Emisión"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              /> 
              <InputField
                label="Validez (días)"
                type="number"
                value={validezDias}
                onChange={(e) => setValidezDias(Number(e.target.value))}
              />
            </div>
          </Card>

          {/* Datos del Cliente */}
        <Card className="p-6">
  <h3 className="text-xl font-bold mb-6 text-[#010105]">
    👥 Datos del Cliente
  </h3>

  <div className="relative mb-4">
    <label className="block text-sm font-semibold text-[#010105] mb-2">
      Buscar cliente registrado
    </label>

    <input
      type="text"
      value={clientSearch}
      onChange={(e) => {
        setClientSearch(e.target.value);
        setShowClientDropdown(true);
      }}
      onFocus={() => setShowClientDropdown(true)}
      placeholder="Buscar por nombre, RUC o correo..."
      className="w-full px-4 py-3 border border-[#c7c6cb] rounded-lg outline-none focus:ring-2 focus:ring-[#2170e4]"
    />

    {showClientDropdown && (
      <div className="absolute z-40 mt-2 w-full bg-white border border-[#c7c6cb] rounded-xl shadow-xl max-h-72 overflow-y-auto">
        {clients
          .filter((client) => {
            const search = clientSearch.toLowerCase();
            return (
              client.nombre?.toLowerCase().includes(search) ||
              client.ruc?.includes(clientSearch) ||
              client.email?.toLowerCase().includes(search)
            );
          })
          .map((client) => (
            <button
              key={client.id}
              type="button"
              onClick={() => seleccionarCliente(client)}
              className="w-full text-left px-4 py-3 hover:bg-[#eff4ff] border-b border-[#f0f0f0]"
            >
              <p className="font-bold text-[#010105]">{client.nombre}</p>
              <p className="text-xs text-[#46464b]">
                {client.ruc} · {client.email || "Sin correo"}
              </p>
            </button>
          ))}

        <button
          type="button"
          onClick={() => {
            setShowClientDropdown(false);
            setIsClientModalOpen(true);
          }}
          className="w-full text-left px-4 py-3 bg-[#eff4ff] text-[#0058be] font-bold hover:bg-[#dce9ff]"
        >
          + Crear nuevo cliente
        </button>
      </div>
    )}
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <InputField
      label="Razón Social / Nombre"
      value={cliente.nombre}
      onChange={(e) => actualizarCliente("nombre", e.target.value)}
    />

    <InputField
      label="Identificación / RUC"
      value={cliente.ruc}
      onChange={(e) => actualizarCliente("ruc", e.target.value)}
    />

    <InputField
      label="Teléfono"
      value={cliente.telefono}
      onChange={(e) => actualizarCliente("telefono", e.target.value)}
    />

    <InputField
      label="Ciudad"
      value={cliente.ciudad}
      onChange={(e) => actualizarCliente("ciudad", e.target.value)}
    />

    <InputField
      label="Dirección"
      value={cliente.direccion}
      onChange={(e) => actualizarCliente("direccion", e.target.value)}
      className="sm:col-span-2"
    />
  </div>

  <Modal
    isOpen={isClientModalOpen}
    onClose={() => setIsClientModalOpen(false)}
    title="Nuevo Cliente"
    size="lg"
  >
    <ClientForm
      onSubmit={async (formData) => {
        const savedClient = await addClient(formData);
        const updatedClients = await getClients();

        setClients(Array.isArray(updatedClients) ? updatedClients : []);

        const createdClient = updatedClients.find(
          (c) => c.id === savedClient.id
        );

        if (createdClient) {
          seleccionarCliente(createdClient);
        }

        setIsClientModalOpen(false);
      }}
    />
  </Modal>
</Card>
          {/* Detalle de Ítems */}
       <Card className="overflow-visible">
  <div className="p-6 bg-gradient-to-r from-[#eff4ff] to-[#dce9ff] border-b border-[#c7c6cb]">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <h3 className="text-xl font-bold text-[#010105]">
        📦 Detalle de Ítems
      </h3>

      <div className="relative w-full lg:w-[420px]">
        <input
          type="text"
          value={productSearch}
          onChange={(e) => {
            setProductSearch(e.target.value);
            setShowProductDropdown(true);
          }}
          onFocus={() => setShowProductDropdown(true)}
          placeholder="Buscar producto por nombre, código o marca..."
          className="w-full bg-white border border-[#c7c6cb] rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#2170e4]"
        />

        {showProductDropdown && (
          <div className="absolute z-50 mt-2 w-full bg-white border border-[#c7c6cb] rounded-xl shadow-xl max-h-72 overflow-y-auto">
            {products
              .filter((product) => {
                const search = productSearch.toLowerCase();

                return (
                  product.name?.toLowerCase().includes(search) ||
                  product.ref?.toLowerCase().includes(search) ||
                  product.brand?.toLowerCase().includes(search)
                );
              })
              .map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => seleccionarProducto(product)}
                  className="w-full text-left px-4 py-3 hover:bg-[#eff4ff] border-b border-[#f0f0f0]"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-bold text-[#010105]">
                        {product.name}
                      </p>
                      <p className="text-xs text-[#46464b]">
                        {product.ref} · {product.brand || "Sin marca"}
                      </p>
                    </div>

                    <p className="font-bold text-[#2170e4] whitespace-nowrap">
                      ${Number(product.price || 0).toFixed(2)}
                    </p>
                  </div>
                </button>
              ))}

            {productSearch && (
              <button
                type="button"
                onClick={agregarItemManual}
                className="w-full text-left px-4 py-3 bg-[#eff4ff] text-[#0058be] font-bold hover:bg-[#dce9ff]"
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
              className="w-full text-left px-4 py-3 bg-white text-[#010105] font-bold hover:bg-[#eff4ff] border-t border-[#c7c6cb]"
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
          <th className="px-4 py-3 font-bold text-[#010105]">
            Descripción
          </th>
          <th className="px-4 py-3 text-right font-bold text-[#010105]">
            Cantidad
          </th>
          <th className="px-4 py-3 text-right font-bold text-[#010105]">
            Precio
          </th>
          <th className="px-4 py-3 text-right font-bold text-[#010105]">
            Total
          </th>
          <th className="px-4 py-3 text-center w-12"></th>
        </tr>
      </thead>

      <tbody>
        {items.map((item, index) => (
          <tr
            key={index}
            className="border-b hover:bg-[#eff4ff] transition-colors"
          >
            <td className="px-4 py-3">
              <input
                className="w-full bg-transparent outline-none font-mono text-xs"
                value={item.codigo}
                onChange={(e) =>
                  actualizarItem(index, "codigo", e.target.value)
                }
                placeholder="Código"
              />
            </td>

            <td className="px-4 py-3 min-w-[280px]">
              <input
                className="w-full bg-transparent outline-none"
                value={item.descripcion}
                onChange={(e) =>
                  actualizarItem(index, "descripcion", e.target.value)
                }
                placeholder="Descripción"
              />
            </td>

            <td className="px-4 py-3 text-right">
              <input
                type="number"
                min="0"
                className="w-20 bg-transparent outline-none text-right"
                value={item.cantidad}
                onChange={(e) =>
                  actualizarItem(index, "cantidad", e.target.value)
                }
              />
            </td>

            <td className="px-4 py-3 text-right">
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-24 bg-transparent outline-none text-right"
                value={item.precio}
                onChange={(e) =>
                  actualizarItem(index, "precio", e.target.value)
                }
              />
            </td>

            <td className="px-4 py-3 text-right font-bold text-[#2170e4]">
              $
              {(Number(item.cantidad || 0) * Number(item.precio || 0)).toFixed(
                2
              )}
            </td>

            <td className="px-4 py-3 text-center">
              <button
                type="button"
                onClick={() => eliminarItem(index)}
                className="text-red-600 font-bold hover:text-red-800 transition-colors"
              >
                ✕
              </button>
            </td>
          </tr>
        ))}

        {items.length === 0 && (
          <tr>
            <td colSpan="6" className="p-8 text-center text-[#46464b]">
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
    <ProductForm
      onSubmit={async (formData) => {
        const savedProduct = await addProduct(formData);
        const updatedProducts = await getProducts();

        setProducts(Array.isArray(updatedProducts) ? updatedProducts : []);

        const createdProduct = updatedProducts.find(
          (p) => p.id === savedProduct.id
        );

        if (createdProduct) {
          seleccionarProducto(createdProduct);
        }

        setIsProductModalOpen(false);
      }}
    />
  </Modal>
</Card>
          {/* Notas */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 text-[#010105]">📌 Notas / Info Adicional</h3>
            <textarea
              className="w-full h-24 border border-[#c7c6cb] rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#2170e4] transition-all resize-none"
              placeholder="Ej: forma de pago, plazos de entrega, garantía, etc."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-[#2170e4] text-sm text-[#46464b]">
              <strong className="text-[#010105]">⚡ NOTA:</strong> Proforma válida
              por {validezDias} días. Los precios pueden variar según disponibilidad.
            </div>
          </Card>
        </div>

        {/* Resumen de Totales */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            <ResumenCard subtotal={subtotal} iva={iva} total={total} />
            <div className="space-y-3">
              <button
                type="button"
                onClick={guardar}
                disabled={loading}
                className="w-full px-6 py-3 bg-white border-2 border-[#2170e4] text-[#2170e4] rounded-lg font-bold hover:bg-[#eff4ff] transition-all disabled:opacity-50"
              >
                📄 Generar PDF
              </button>
              <button
                type="button"
                onClick={guardar}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#2170e4] to-[#0058be] text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? "⏳ Guardando..." : "💾 Guardar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResumenCard({ subtotal, iva, total }) {
  return (
    <Card className="bg-gradient-to-br from-[#010105] to-[#1a1c24] text-white p-6 sticky top-6">
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-[#3a3d48]">
            <span className="text-sm font-semibold text-[#b0b2bd]">Subtotal</span>
            <span className="text-lg font-bold">$ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-[#3a3d48]">
            <span className="text-sm font-semibold text-[#b0b2bd]">IVA (15%)</span>
            <span className="text-lg font-bold text-[#4ade80]">$ {iva.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t-2 border-[#2170e4]">
            <span className="text-lg font-bold">TOTAL</span>
            <span className="text-3xl font-bold text-[#2170e4]">$ {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}