import { useEffect, useState } from "react";
import {
  SummaryCard,
  StatusBadge,
  PageHeader,
  Card,
  EmptyState,
  ActionButton,
  Modal,
  LoadingSpinner,
} from "../../../components/common";

import { ClientForm } from "../components/ClientForm";
import { getInitials } from "../../../utils/stringUtils";

import {
  getClients,
  addClient,
  updateClient,
  deleteClient,
} from "../services/clientService";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchClients() {
      try {
        setLoading(true);
        const data = await getClients();

        if (isMounted) {
          setClients(data);
        }
      } catch (error) {
        console.error("Error al cargar clientes:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchClients();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error("Error al recargar clientes:", error);
    }
  };

  const handleOpenModal = (client = null) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleSaveClient = async (formData) => {
    try {
      setIsSubmitting(true);

      if (editingClient) {
        await updateClient(editingClient.id, formData);
      } else {
        await addClient(formData);
      }

      await refreshClients();
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      alert(`Error al guardar cliente:\n${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!confirm("¿Deseas eliminar este cliente?")) return;

    try {
      await deleteClient(clientId);
      await refreshClients();
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      alert(`Error al eliminar cliente:\n${error.message}`);
    }
  };

  const filteredClients = clients.filter((client) => {
    const nombre = client.nombre || "";
    const ruc = client.ruc || "";
    const email = client.email || "";

    return (
      nombre.toLowerCase().includes(search.toLowerCase()) ||
      ruc.includes(search) ||
      email.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalClientes = clients.length;
  const activos = clients.filter((c) => c.estado === "Activo").length;
  const pendientes = clients.filter((c) => c.estado === "Pendiente").length;
  const inactivos = clients.filter((c) => c.estado === "Inactivo").length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-[#46464b]">Cargando clientes...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Directorio de Clientes"
        subtitle="Gestiona y visualiza la información de contacto de tus clientes."
        action={
          <button
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-r from-[#2170e4] to-[#0058be] text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all hover:scale-105"
          >
            + Nuevo Cliente
          </button>
        }
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Total Clientes" value={totalClientes} icon="👥" color="blue" />
        <SummaryCard title="Activos" value={activos} icon="✅" color="green" />
        <SummaryCard title="Pendientes" value={pendientes} icon="⏳" color="orange" />
        <SummaryCard title="Inactivos" value={inactivos} icon="❌" color="red" />
      </section>

      <Card className="overflow-hidden">
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#eff4ff] to-[#dce9ff] border-b border-[#c7c6cb] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              <button className="px-4 py-2 bg-white border border-[#c7c6cb] rounded-lg hover:bg-[#e5eeff] transition-colors font-medium text-sm">
                📊 Filtrar
              </button>
              <button className="px-4 py-2 bg-white border border-[#c7c6cb] rounded-lg hover:bg-[#e5eeff] transition-colors font-medium text-sm">
                🔤 Ordenar
              </button>
            </div>

            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:max-w-xs bg-white border border-[#c7c6cb] rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#2170e4] transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#eff4ff] border-b border-[#c7c6cb]">
                <th className="px-4 sm:px-6 py-4 text-xs font-bold text-[#46464b] uppercase">
                  Cliente
                </th>
                <th className="hidden md:table-cell px-4 sm:px-6 py-4 text-xs font-bold text-[#46464b] uppercase">
                  RUC
                </th>
                <th className="hidden lg:table-cell px-4 sm:px-6 py-4 text-xs font-bold text-[#46464b] uppercase">
                  Teléfono
                </th>
                <th className="px-4 sm:px-6 py-4 text-xs font-bold text-[#46464b] uppercase">
                  Estado
                </th>
                <th className="px-4 sm:px-6 py-4 text-xs font-bold text-[#46464b] uppercase text-right">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#c7c6cb]">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-[#eff4ff] transition-colors group">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2170e4] to-[#0058be] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {getInitials(client.nombre)}
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-[#010105] truncate">
                          {client.nombre}
                        </p>
                        <p className="text-xs text-[#46464b] truncate">
                          {client.email || "Sin correo"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="hidden md:table-cell px-4 sm:px-6 py-4 text-sm text-[#0b1c30] font-mono">
                    {client.ruc}
                  </td>

                  <td className="hidden lg:table-cell px-4 sm:px-6 py-4 text-sm text-[#0b1c30]">
                    {client.telefono || "Sin teléfono"}
                  </td>

                  <td className="px-4 sm:px-6 py-4">
                    <StatusBadge status={client.estado || "Activo"} />
                  </td>

                  <td className="px-4 sm:px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <ActionButton
                        label="Editar"
                        variant="secondary"
                        onClick={() => handleOpenModal(client)}
                      />
                      <ActionButton
                        label="Eliminar"
                        variant="danger"
                        onClick={() => handleDeleteClient(client.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}

              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center">
                    <EmptyState
                      icon="🔍"
                      title="No se encontraron clientes"
                      description={
                        search
                          ? "Intenta con otra búsqueda"
                          : "Agrega tu primer cliente para comenzar"
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 sm:p-6 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-[#c7c6cb]">
          <p className="text-sm text-[#46464b]">
            Mostrando <span className="font-bold">{filteredClients.length}</span> de{" "}
            <span className="font-bold">{clients.length}</span> clientes
          </p>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingClient ? "Editar Cliente" : "Nuevo Cliente"}
        size="lg"
      >
        <ClientForm
          initialData={editingClient}
          onSubmit={handleSaveClient}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
}