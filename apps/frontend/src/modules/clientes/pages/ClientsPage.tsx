import { useEffect, useState } from "react";
import { Clock, SearchX, UserCheck, UserX, Users } from "lucide-react";
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
import { useToast } from "@/hooks/useToast";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

import { ClientForm, type ClientFormValues } from "@/modules/clientes/components/ClientForm";
import { getInitials } from "@/utils/stringUtils";

import {
  getClients,
  addClient,
  updateClient,
  deleteClient,
  type ClientDto,
} from "../services/clientService";

export default function ClientsPage() {
  const { showError, showSuccess } = useToast();
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<ClientDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);

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
      showSuccess(
        editingClient ? "Cliente actualizado correctamente." : "Cliente creado correctamente."
      );
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      showError(
        `Error al guardar cliente: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (deletingClientId !== clientId) {
      setDeletingClientId(clientId);
      return;
    }

    try {
      await deleteClient(clientId);
      setDeletingClientId(null);
      await refreshClients();
      showSuccess("Cliente eliminado.");
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      setDeletingClientId(null);
      showError(
        `Error al eliminar cliente: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  };

  const debouncedSearch = useDebouncedValue(search);
  const isSearching = search.trim() !== debouncedSearch.trim();
  const filteredClients = clients.filter((client) => {
    const nombre = client.nombre || "";
    const ruc = client.ruc || "";
    const email = client.email || "";
    const query = debouncedSearch.trim().toLowerCase();

    if (!query) return true;

    return (
      nombre.toLowerCase().includes(query) ||
      ruc.includes(debouncedSearch.trim()) ||
      email.toLowerCase().includes(query)
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
        <p className="mt-4 text-slate-600">Cargando clientes...</p>
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
            className="flex items-center gap-2 rounded-lg bg-blue-500 hover:bg-blue-600 px-6 py-3 font-bold text-white transition-all hover:scale-105 hover:shadow-lg"
          >
            + Nuevo Cliente
          </button>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Clientes"
          value={totalClientes}
          icon={<Users className="h-4 w-4" aria-hidden="true" />}
          color="blue"
        />
        <SummaryCard
          title="Activos"
          value={activos}
          icon={<UserCheck className="h-4 w-4" aria-hidden="true" />}
          color="green"
        />
        <SummaryCard
          title="Pendientes"
          value={pendientes}
          icon={<Clock className="h-4 w-4" aria-hidden="true" />}
          color="orange"
        />
        <SummaryCard
          title="Inactivos"
          value={inactivos}
          icon={<UserX className="h-4 w-4" aria-hidden="true" />}
          color="red"
        />
      </section>

      <Card className="overflow-hidden">
        <div className="space-y-4 border-b border-slate-200 bg-slate-50 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="w-full sm:max-w-xs">
              <span className="sr-only">Buscar cliente</span>
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </label>
          </div>
        </div>

        <div className="relative">
          <div
            className={`overflow-x-auto transition-opacity duration-150 ${
              isSearching ? "pointer-events-none opacity-50" : "opacity-100"
            }`}
          >
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-4 text-xs font-bold uppercase text-slate-600 sm:px-6">
                  Cliente
                </th>
                <th className="hidden px-4 py-4 text-xs font-bold uppercase text-slate-600 sm:px-6 md:table-cell">
                  RUC
                </th>
                <th className="hidden px-4 py-4 text-xs font-bold uppercase text-slate-600 sm:px-6 lg:table-cell">
                  Teléfono
                </th>
                <th className="px-4 py-4 text-xs font-bold uppercase text-slate-600 sm:px-6">
                  Estado
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold uppercase text-slate-600 sm:px-6">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="animate-fade-in transition-colors group hover:bg-slate-100">
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                        {getInitials(client.nombre)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900">{client.nombre}</p>
                        <p className="truncate text-xs text-slate-600">
                          {client.email || "Sin correo"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="hidden px-4 py-4 font-mono text-sm text-slate-900 sm:px-6 md:table-cell">
                    {client.ruc}
                  </td>

                  <td className="hidden px-4 py-4 text-sm text-slate-900 sm:px-6 lg:table-cell">
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
                        label={deletingClientId === client.id ? "¿Confirmar?" : "Eliminar"}
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
                      icon={<SearchX className="h-10 w-10 text-slate-300" aria-hidden="true" />}
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

          {isSearching && (
            <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-16">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <p className="text-sm text-slate-600">
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
