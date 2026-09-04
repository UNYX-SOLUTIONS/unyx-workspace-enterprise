import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Card from "@/components/common/Card";
import InputField from "@/components/common/InputField";
import PageHeader from "@/components/common/PageHeader";
import { useToast } from "@/hooks/useToast";

import { EquipmentForm } from "@/modules/mantenimientos/components/EquipmentForm";
import { MaintenanceChecklist } from "@/modules/mantenimientos/components/MaintenanceChecklist";
import {
  DiagnosticFields,
  TextArea,
} from "../components/MaintenanceDiagnosticFields";

import { useMaintenanceForm } from "@/modules/mantenimientos/hooks/useMaintenanceForm";
import { useMaintenanceSave } from "@/modules/mantenimientos/hooks/useMaintenanceSave";

export default function MaintenancePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();

  const selectedMaintenanceNumber =
    (location.state as { selectedMaintenanceNumber?: string } | null)
      ?.selectedMaintenanceNumber || null;

  const form = useMaintenanceForm();
  const { loading, setLoading, load, initialize, save, searchMaintenance } =
    useMaintenanceSave({ form });

  const diagnosticFileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function initializeMaintenance() {
      try {
        setLoading(true);

        if (selectedMaintenanceNumber) {
          const loaded = await load(selectedMaintenanceNumber);

          if (loaded && isMounted) {
            navigate(location.pathname, { replace: true, state: null });
          }

          return;
        }

        await initialize();
      } catch (error) {
        console.error("Error inicializando mantenimiento:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeMaintenance();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title={
          form.isEditing
            ? `Editar mantenimiento ${form.numero}`
            : "Mantenimiento Preventivo"
        }
        description="Registra el diagnóstico, las acciones realizadas y el resultado final del equipo."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={searchMaintenance}
              disabled={loading}
              className="
                rounded-lg border border-[#c7c6cb]
                bg-white px-4 py-2 font-semibold
                !text-[#26364d] transition-colors
                hover:bg-[#eff4ff]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Buscar
            </button>

            <button
              type="button"
              onClick={() => save(false)}
              disabled={loading}
              className="
                rounded-lg bg-gradient-to-r
                from-[#2170e4] to-[#0058be]
                px-5 py-2 font-semibold text-white
                transition-opacity
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading ? "Procesando..." : "Guardar"}
            </button>
          </div>
        }
      />

      <input
        ref={diagnosticFileInput}
        type="file"
        accept="application/json,.json"
        onChange={async (event) => {
          setLoading(true);
          try {
            const imported = await form.importDiagnostic(event);
            if (imported) {
              showSuccess(
                "Diagnóstico importado correctamente. Revise los campos pendientes antes de guardar."
              );
            }
          } catch (error) {
            console.error("Error importando diagnóstico:", error);
            showError(
              error instanceof Error
                ? error.message
                : "No fue posible importar el archivo JSON."
            );
          } finally {
            setLoading(false);
          }
        }}
        className="hidden"
      />

      <Card className="border-l-4 border-[#2170e4] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold !text-[#111827]">Importar diagnóstico automático</p>

            <p className="mt-1 text-sm !text-[#4b5563]">
              Selecciona el archivo JSON generado por el script de diagnóstico UNYX.
            </p>
          </div>

          <button
            type="button"
            onClick={() => diagnosticFileInput.current?.click()}
            className="
              rounded-lg bg-[#111827]
              px-5 py-2.5 font-semibold text-white
              transition-colors hover:bg-[#1f2937]
            "
          >
            Importar JSON
          </button>
        </div>
      </Card>

      <Card className="p-6">
        <p className="mb-6 text-xl font-bold !text-[#111827]">Datos del mantenimiento</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InputField
            label="Número"
            value={form.numero}
            onChange={(event) => form.setNumero(event.target.value)}
          />

          <InputField
            label="Fecha"
            type="date"
            value={form.fecha}
            onChange={(event) => form.setFecha(event.target.value)}
          />

          <label className="block">
            <span className="mb-2 block text-sm font-semibold !text-[#111827]">Estado</span>

            <select
              value={form.estado}
              onChange={(event) => form.setEstado(event.target.value)}
              className="
                w-full rounded-lg border
                border-[#c7c6cb] bg-white
                px-4 py-3 !text-[#111827]
                outline-none focus:ring-2
                focus:ring-[#2170e4]
              "
            >
              <option>En revisión</option>
              <option>En mantenimiento</option>
              <option>Finalizado</option>
              <option>Entregado</option>
            </select>
          </label>

          <InputField
            label="Técnico responsable"
            value={form.tecnicoResponsable}
            onChange={(event) => form.setTecnicoResponsable(event.target.value)}
          />
        </div>
      </Card>

      <Card className="overflow-visible p-6">
        <p className="mb-6 text-xl font-bold !text-[#111827]">Datos del cliente</p>

        <div className="relative mb-4">
          <input
            value={form.clientSearch}
            onChange={(event) => {
              form.setClientSearch(event.target.value);
              form.setShowClientDropdown(true);
            }}
            onFocus={() => form.setShowClientDropdown(true)}
            placeholder="Buscar por nombre, RUC o correo"
            className="
              w-full rounded-lg border
              border-[#c7c6cb] bg-white
              px-4 py-3 !text-[#111827]
              placeholder:!text-[#6b7280]
              outline-none focus:ring-2
              focus:ring-[#2170e4]
            "
          />

          {form.showClientDropdown && (
            <div
              className="
                absolute z-40 mt-2 max-h-72
                w-full overflow-y-auto
                rounded-xl border border-[#c7c6cb]
                bg-white shadow-xl
              "
            >
              {form.filteredClients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => form.selectClient(client)}
                  className="
                    w-full border-b
                    border-[#e5e7eb]
                    px-4 py-3 text-left
                    hover:bg-[#eff4ff]
                  "
                >
                  <p className="font-bold !text-[#111827]">{client.nombre}</p>

                  <p className="text-xs !text-[#4b5563]">
                    {client.ruc || "Sin identificación"}
                  </p>
                </button>
              ))}

              {form.filteredClients.length === 0 && (
                <p className="px-4 py-4 text-sm !text-[#4b5563]">
                  No se encontraron clientes.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(
            [
              ["nombre", "Razón social / Nombre"],
              ["ruc", "Identificación / RUC"],
              ["telefono", "Teléfono"],
              ["ciudad", "Ciudad"],
              ["direccion", "Dirección"],
            ] as Array<[keyof typeof form.cliente, string]>
          ).map(([field, label]) => (
            <InputField
              key={field}
              label={label}
              value={form.cliente[field]}
              onChange={(event) =>
                form.setCliente((current) => ({
                  ...current,
                  [field]: event.target.value,
                }))
              }
            />
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <p className="mb-6 text-xl font-bold !text-[#111827]">Identificación del equipo</p>

        <EquipmentForm equipo={form.equipo} onChange={form.setEquipo} />
      </Card>

      <Card className="p-6">
        <p className="mb-6 text-xl font-bold !text-[#111827]">Problemas reportados</p>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {form.REPORTED_PROBLEMS.map((problem) => (
            <label
              key={problem}
              className="
                flex items-center gap-3 rounded-lg
                border border-[#e1e1e5] p-3
                !text-[#111827]
              "
            >
              <input
                type="checkbox"
                checked={form.problemasReportados.includes(problem)}
                onChange={() => form.toggleProblem(problem)}
                className="accent-[#2170e4]"
              />

              {problem}
            </label>
          ))}
        </div>

        <InputField
          label="Otro problema"
          value={form.otroProblema}
          onChange={(event) => form.setOtroProblema(event.target.value)}
        />
      </Card>

      <Card className="p-6">
        <p className="mb-6 text-xl font-bold !text-[#111827]">Diagnóstico inicial</p>

        <DiagnosticFields
          value={form.diagnosticoInicial}
          onChange={form.setDiagnosticoInicial}
          includeCondition
        />
      </Card>

      <Card className="p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xl font-bold !text-[#111827]">Checklist técnico</p>

          <p className="text-sm font-medium !text-[#4b5563]">
            Conformes: {form.summary.Conforme || 0}
            {" · "}
            Observaciones: {form.summary["Observación"] || 0}
            {" · "}
            Pendientes: {form.summary.Pendiente || 0}
            {" · "}
            No aplica: {form.summary["No aplica"] || 0}
          </p>
        </div>

        <MaintenanceChecklist items={form.checklist} onChange={form.setChecklist} />
      </Card>

      <Card className="p-6">
        <p className="mb-6 text-xl font-bold !text-[#111827]">Diagnóstico final</p>

        <DiagnosticFields value={form.diagnosticoFinal} onChange={form.setDiagnosticoFinal} />
      </Card>

      <Card className="space-y-5 p-6">
        <p className="text-xl font-bold !text-[#111827]">Resultados del mantenimiento</p>

        <TextArea
          label="Acciones realizadas"
          value={form.accionesRealizadas}
          onChange={form.setAccionesRealizadas}
          placeholder="Describe las actividades ejecutadas."
        />

        <TextArea
          label="Hallazgos"
          value={form.hallazgos}
          onChange={form.setHallazgos}
          placeholder="Escribe un hallazgo por línea."
        />

        <TextArea
          label="Recomendaciones"
          value={form.recomendaciones}
          onChange={form.setRecomendaciones}
          placeholder="Escribe una recomendación por línea."
        />

        <TextArea
          label="Conclusión técnica"
          value={form.conclusion}
          onChange={form.setConclusion}
          placeholder="Describe la condición final del equipo."
        />

        <TextArea
          label="Observaciones adicionales"
          value={form.observaciones}
          onChange={form.setObservaciones}
          placeholder="Agrega cualquier observación adicional."
          rows={3}
        />
      </Card>

      <div className="flex flex-col justify-end gap-3 pb-8 sm:flex-row">
        <button
          type="button"
          onClick={() => save(false)}
          disabled={loading}
          className="
            rounded-lg border-2 border-[#2170e4]
            bg-white px-6 py-3 font-bold
            !text-[#2170e4]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading ? "Procesando..." : "Guardar mantenimiento"}
        </button>

        <button
          type="button"
          onClick={() => save(true)}
          disabled={loading}
          className="
            rounded-lg bg-gradient-to-r
            from-[#2170e4] to-[#0058be]
            px-6 py-3 font-bold text-white
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading ? "Procesando..." : "Guardar y generar PDF"}
        </button>
      </div>
    </div>
  );
}
