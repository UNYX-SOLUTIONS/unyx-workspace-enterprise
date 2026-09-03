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

import { ClientForm, type ClientFormValues } from "../components/ClientForm";
import { getInitials } from "../../../utils/stringUtils";

import {
  getClients,
  addClient,
  updateClient,
  deleteClient,
  type ClientDto,
} from "../services/clientService";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<ClientDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientDto | null>(null);
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

  const handleOpenModal = (client: ClientDto | null = null) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleSaveClient = async (formData: ClientFormValues) => {
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
      window.alert(
        `Error al guardar cliente:\n${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!window.confirm("¿Deseas eliminar este cliente?")) return;

    try {
      await deleteClient(clientId);
      await refreshClients();
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      window.alert(
        `Error al eliminar cliente:\n${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
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
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#2170e4] to-[#0058be] px-6 py-3 font-bold text-white transition-all hover:scale-105 hover:shadow-lg"
          >
            + Nuevo Cliente
          </button>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Total Clientes" value={totalClientes} icon="👥" color="blue" />
        <SummaryCard title="Activos" value={activos} icon="✅" color="green" />
        <SummaryCard title="Pendientes" value={pendientes} icon="⏳" color="orange" />
        <SummaryCard title="Inactivos" value={inactivos} icon="❌" color="red" />
      </section>

      <Card className="overflow-hidden">
        <div className="space-y-4 border-b border-[#c7c6cb] bg-gradient-to-r from-[#eff4ff] to-[#dce9ff] p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button className="rounded-lg border border-[#c7c6cb] bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-[#e5eeff]">
                📊 Filtrar
              </button>
              <button className="rounded-lg border border-[#c7c6cb] bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-[#e5eeff]">
                🔤 Ordenar
              </button>
            </div>

            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[#c7c6cb] bg-white px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-[#2170e4] sm:max-w-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#c7c6cb] bg-[#eff4ff]">
                <th className="px-4 py-4 text-xs font-bold uppercase text-[#46464b] sm:px-6">
                  Cliente
                </th>
                <th className="hidden px-4 py-4 text-xs font-bold uppercase text-[#46464b] sm:px-6 md:table-cell">
                  RUC
                </th>
                <th className="hidden px-4 py-4 text-xs font-bold uppercase text-[#46464b] sm:px-6 lg:table-cell">
                  Teléfono
                </th>
                <th className="px-4 py-4 text-xs font-bold uppercase text-[#46464b] sm:px-6">
                  Estado
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold uppercase text-[#46464b] sm:px-6">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#c7c6cb]">
              {filteredClients.map((client) => (
                <tr key={client.id} className="transition-colors group hover:bg-[#eff4ff]">
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2170e4] to-[#0058be] text-sm font-bold text-white">
                        {getInitials(client.nombre)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-bold text-[#010105]">{client.nombre}</p>
                        <p className="truncate text-xs text-[#46464b]">
                          {client.email || "Sin correo"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="hidden px-4 py-4 font-mono text-sm text-[#0b1c30] sm:px-6 md:table-cell">
                    {client.ruc}
                  </td>

                  <td className="hidden px-4 py-4 text-sm text-[#0b1c30] sm:px-6 lg:table-cell">
                    {client.telefono || "Sin teléfono"}
                  </td>

                  <td className="px-4 py-4 sm:px-6">
                    <StatusBadge status={client.estado || "Activo"} />
                  </td>

                  <td className="px-4 py-4 text-right sm:px-6">
                    <div className="flex justify-end gap-2 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
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
                  <td colSpan={5} className="p-8 text-center">
                    <EmptyState
                      icon="🔍"
                      title="No se encontraron clientes"
                      description={
                        search ? "Intenta con otra búsqueda" : "Agrega tu primer cliente para comenzar"
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#c7c6cb] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
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
