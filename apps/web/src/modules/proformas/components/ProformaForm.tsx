import { useEffect, useMemo, useState } from "react";

import { Card, InputField, Modal } from "../../../components/common";
import { useToast } from "../../../hooks/useToast";
import { ClientForm } from "../../clientes/components/ClientForm";
import { addClient, getClients, type ClientDto } from "../../clientes/services/clientService";
import type { UseProformaForm } from "../hooks/useProformaForm";

export interface ProformaFormProps {
  form: UseProformaForm;
}

export default function ProformaForm({ form }: ProformaFormProps) {
  const { showError, showSuccess } = useToast();

  const [clients, setClients] = useState<ClientDto[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    getClients({ pageSize: 100 })
      .then((data) => {
        if (active) setClients(Array.isArray(data) ? data : []);
      })
      .catch(() => showError("No fue posible cargar los clientes."));
    return () => {
      active = false;
    };
  }, [showError]);

  const filteredClients = useMemo(() => {
    const search = clientSearch.trim().toLowerCase();
    if (!search) return clients;
    return clients.filter(
      (client) =>
        String(client.nombre || "").toLowerCase().includes(search) ||
        String(client.ruc || "").includes(clientSearch.trim()) ||
        String(client.email || "").toLowerCase().includes(search)
    );
  }, [clients, clientSearch]);

  const handleCreateClient = async (formData: unknown) => {
    const savedClient = await addClient(formData);
    const updated = await getClients({ pageSize: 100 });
    setClients(Array.isArray(updated) ? updated : []);
    const created = updated.find((client) => client.id === savedClient.id);
    if (created) {
      form.selectCliente(created);
      setClientSearch(created.nombre || "");
    }
    setIsClientModalOpen(false);
    showSuccess("Cliente creado y seleccionado.");
  };

  return (
    <>
      <Card className="p-6">
        <h3 className="mb-6 text-xl font-bold text-[#010105]">Datos de la Proforma</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InputField label="Número" value={form.numero} readOnly placeholder="Auto generado" />
          <InputField
            label="Fecha de Emisión"
            type="date"
            value={form.fecha}
            onChange={(event) => form.setField("fecha", event.target.value)}
          />
          <InputField
            label="Validez (días)"
            type="number"
            min="1"
            value={form.validezDias}
            onChange={(event) => form.setField("validezDias", Number(event.target.value))}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-6 text-xl font-bold text-[#010105]">Datos del Cliente</h3>

        <div className="relative mb-4">
          <label className="mb-2 block text-sm font-semibold text-[#010105]">
            Buscar cliente registrado
          </label>
          <input
            type="text"
            value={clientSearch}
            onChange={(event) => {
              setClientSearch(event.target.value);
              setShowClientDropdown(true);
            }}
            onFocus={() => setShowClientDropdown(true)}
            placeholder="Buscar por nombre, RUC o correo..."
            className="w-full rounded-lg border border-[#c7c6cb] px-4 py-3 outline-none focus:ring-2 focus:ring-[#2170e4]"
          />

          {showClientDropdown && (
            <div className="absolute z-40 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-[#c7c6cb] bg-white shadow-xl">
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => {
                    form.selectCliente(client);
                    setClientSearch(client.nombre || "");
                    setShowClientDropdown(false);
                  }}
                  className="w-full border-b border-[#f0f0f0] px-4 py-3 text-left hover:bg-[#eff4ff]"
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
                className="w-full bg-[#eff4ff] px-4 py-3 text-left font-bold text-[#0058be] hover:bg-[#dce9ff]"
              >
                + Crear nuevo cliente
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            label="Razón Social / Nombre"
            value={form.cliente.nombre}
            onChange={(event) => form.updateCliente("nombre", event.target.value)}
          />
          <InputField
            label="Identificación / RUC"
            value={form.cliente.ruc}
            onChange={(event) => form.updateCliente("ruc", event.target.value)}
          />
          <InputField
            label="Teléfono"
            value={form.cliente.telefono}
            onChange={(event) => form.updateCliente("telefono", event.target.value)}
          />
          <InputField
            label="Ciudad"
            value={form.cliente.ciudad}
            onChange={(event) => form.updateCliente("ciudad", event.target.value)}
          />
          <InputField
            label="Dirección"
            value={form.cliente.direccion}
            onChange={(event) => form.updateCliente("direccion", event.target.value)}
            className="sm:col-span-2"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-xl font-bold text-[#010105]">Notas / Info Adicional</h3>
        <textarea
          className="h-24 w-full resize-none rounded-lg border border-[#c7c6cb] p-3 outline-none transition-all focus:ring-2 focus:ring-[#2170e4]"
          placeholder="Ej: forma de pago, plazos de entrega, garantía, etc."
          value={form.notas}
          onChange={(event) => form.setField("notas", event.target.value)}
        />
        <div className="mt-4 rounded-lg border-l-4 border-[#2170e4] bg-blue-50 p-4 text-sm text-[#46464b]">
          <strong className="text-[#010105]">NOTA:</strong> Proforma válida por{" "}
          {form.validezDias} días. Los precios pueden variar según disponibilidad.
        </div>
      </Card>

      <Modal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title="Nuevo Cliente"
        size="lg"
      >
        <ClientForm onSubmit={handleCreateClient} />
      </Modal>
    </>
  );
}
