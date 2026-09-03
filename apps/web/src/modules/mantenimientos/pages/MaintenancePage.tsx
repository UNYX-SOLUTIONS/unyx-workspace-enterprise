import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import { useLocation, useNavigate } from "react-router-dom";

import Card from "../../../components/common/Card";
import InputField from "../../../components/common/InputField";
import PageHeader from "../../../components/common/PageHeader";

import { EquipmentForm, type EquipmentState } from "../components/EquipmentForm";
import { MaintenanceChecklist } from "../components/MaintenanceChecklist";
import { createMaintenanceChecklist, type ChecklistItem } from "../constants/maintenanceChecklist";

import { getClients, type ClientDto } from "../../clientes/services/clientService";

import {
  getMaintenance,
  previewNextMaintenanceNumber,
  saveMaintenance,
  type MaintenanceRecord,
} from "../services/maintenanceService";

import { generateMaintenancePdf } from "../utils/generateMaintenancePdf";
import { parseMaintenanceDiagnostic } from "../utils/importMaintenanceDiagnostic";

const TODAY = () => new Date().toISOString().split("T")[0];

interface ClienteFormState {
  nombre: string;
  ruc: string;
  direccion: string;
  telefono: string;
  ciudad: string;
}

interface DiagnosticState {
  tiempoEncendido: string;
  usoCpu: string;
  usoRam: string;
  usoDisco: string;
  espacioDisponible: string;
  temperaturaReposo: string;
  temperaturaMaxima: string;
  estadoDisco: string;
  estadoBateria: string;
  condicionFisica: string;
}

const EMPTY_CLIENT: ClienteFormState = {
  nombre: "",
  ruc: "",
  direccion: "",
  telefono: "",
  ciudad: "Guayaquil",
};

const EMPTY_EQUIPMENT: EquipmentState = {
  tipo: "Laptop",
  marca: "",
  modelo: "",
  numeroSerie: "",
  sistemaOperativo: "",
  procesador: "",
  ram: "",
  almacenamiento: "",
  cargadorEntregado: false,
  accesorios: "",
};

const EMPTY_DIAGNOSTIC: DiagnosticState = {
  tiempoEncendido: "",
  usoCpu: "",
  usoRam: "",
  usoDisco: "",
  espacioDisponible: "",
  temperaturaReposo: "",
  temperaturaMaxima: "",
  estadoDisco: "",
  estadoBateria: "",
  condicionFisica: "",
};

const REPORTED_PROBLEMS = [
  "Lentitud general",
  "Inicio lento",
  "Sobrecalentamiento",
  "Ruido del ventilador",
  "Bloqueos",
  "Reinicios inesperados",
  "Baja duración de batería",
  "Poco espacio disponible",
  "Problemas de conexión",
];

function normalizeTextList(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean).join("\n");
  }

  return typeof value === "string" ? value : "";
}

function normalizeDate(value: unknown): string {
  if (!value) return TODAY();

  if (typeof value === "object" && value !== null && "toDate" in value) {
    const toDate = (value as { toDate: () => Date }).toDate;
    if (typeof toDate === "function") return toDate().toISOString().split("T")[0];
  }

  if (typeof value === "object" && value !== null && "seconds" in value) {
    const seconds = (value as { seconds?: unknown }).seconds;
    if (typeof seconds === "number") {
      return new Date(seconds * 1000).toISOString().split("T")[0];
    }
  }

  return String(value).slice(0, 10);
}

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const TextArea = ({ label, value, onChange, placeholder = "", rows = 4 }: TextAreaProps) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold !text-[#111827]">{label}</span>

    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="
        w-full resize-y rounded-lg
        border border-[#c7c6cb] bg-white
        p-3 !text-[#111827]
        placeholder:!text-[#6b7280]
        outline-none transition-all
        focus:border-[#2170e4]
        focus:ring-2 focus:ring-[#2170e4]
      "
    />
  </label>
);

interface DiagnosticFieldsProps {
  value: DiagnosticState;
  onChange: (value: DiagnosticState) => void;
  includeCondition?: boolean;
}

function DiagnosticFields({ value, onChange, includeCondition = false }: DiagnosticFieldsProps) {
  const update = (field: keyof DiagnosticState, nextValue: string) => {
    onChange({
      ...value,
      [field]: nextValue,
    });
  };

  const fields: Array<[keyof DiagnosticState, string, string]> = [
    ["tiempoEncendido", "Tiempo de encendido", "Ej: 45 segundos"],
    ["usoCpu", "CPU en reposo", "Ej: 8 %"],
    ["usoRam", "RAM en reposo", "Ej: 4.2 GB / 8 GB"],
    ["usoDisco", "Disco en reposo", "Ej: 3 %"],
    ["espacioDisponible", "Espacio disponible", "Ej: 120 GB"],
    ["temperaturaReposo", "Temperatura en reposo", "Ej: 48 °C"],
    ["temperaturaMaxima", "Temperatura máxima", "Ej: 82 °C"],
  ];

  if (includeCondition) {
    fields.push(
      ["estadoDisco", "Estado del disco", "Ej: Bueno, 92 % de vida"],
      ["estadoBateria", "Estado de la batería", "Ej: 18 % de desgaste"],
      ["condicionFisica", "Condición física", "Ej: Operativa con desgaste"]
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {fields.map(([field, label, placeholder]) => (
        <InputField
          key={field}
          label={label}
          value={value[field] || ""}
          placeholder={placeholder}
          onChange={(event) => update(field, event.target.value)}
        />
      ))}
    </div>
  );
}

export default function MaintenancePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedMaintenanceNumber: string | null =
    (location.state as { selectedMaintenanceNumber?: string } | null)
      ?.selectedMaintenanceNumber || null;

  const [numero, setNumero] = useState("");
  const [fecha, setFecha] = useState(TODAY());
  const [estado, setEstado] = useState("En revisión");
  const [tecnicoResponsable, setTecnicoResponsable] = useState("");

  const [cliente, setCliente] = useState<ClienteFormState>({ ...EMPTY_CLIENT });

  const [equipo, setEquipo] = useState<EquipmentState>({ ...EMPTY_EQUIPMENT });

  const [problemasReportados, setProblemasReportados] = useState<string[]>([]);

  const [otroProblema, setOtroProblema] = useState("");

  const [diagnosticoInicial, setDiagnosticoInicial] = useState<DiagnosticState>({
    ...EMPTY_DIAGNOSTIC,
  });

  const [diagnosticoFinal, setDiagnosticoFinal] = useState<DiagnosticState>({
    ...EMPTY_DIAGNOSTIC,
  });

  const [checklist, setChecklist] = useState<ChecklistItem[]>(createMaintenanceChecklist());

  const [accionesRealizadas, setAccionesRealizadas] = useState("");

  const [hallazgos, setHallazgos] = useState("");
  const [recomendaciones, setRecomendaciones] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [clients, setClients] = useState<ClientDto[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const diagnosticFileInput = useRef<HTMLInputElement>(null);

  const summary = useMemo(() => {
    return checklist.reduce<Record<string, number>>((accumulator, item) => {
      accumulator[item.estado] = (accumulator[item.estado] || 0) + 1;
      return accumulator;
    }, {});
  }, [checklist]);

  function applyMaintenanceData(data: MaintenanceRecord, fallbackNumber = "") {
    setNumero(String(data.numero || fallbackNumber));
    setFecha(normalizeDate(data.fecha));
    setEstado(String(data.estado || "En revisión"));

    setTecnicoResponsable(String(data.tecnicoResponsable || ""));

    setCliente({
      ...EMPTY_CLIENT,
      ...(data.cliente as Partial<ClienteFormState> | undefined),
    });

    setClientSearch(String((data.cliente as Partial<ClienteFormState> | undefined)?.nombre || ""));

    setEquipo({
      ...EMPTY_EQUIPMENT,
      ...(data.equipo as Partial<EquipmentState> | undefined),
    });

    setProblemasReportados(
      Array.isArray(data.problemasReportados)
        ? (data.problemasReportados as string[])
        : []
    );

    setOtroProblema("");

    setDiagnosticoInicial({
      ...EMPTY_DIAGNOSTIC,
      ...(data.diagnosticoInicial as Partial<DiagnosticState> | undefined),
    });

    setDiagnosticoFinal({
      ...EMPTY_DIAGNOSTIC,
      ...(data.diagnosticoFinal as Partial<DiagnosticState> | undefined),
    });

    setChecklist(
      Array.isArray(data.checklist) && data.checklist.length > 0
        ? (data.checklist as ChecklistItem[])
        : createMaintenanceChecklist()
    );

    setAccionesRealizadas(normalizeTextList(data.accionesRealizadas));

    setHallazgos(normalizeTextList(data.hallazgos));

    setRecomendaciones(normalizeTextList(data.recomendaciones));

    setConclusion(
      normalizeTextList(data.conclusion || data.conclusionTecnica)
    );

    setObservaciones(
      normalizeTextList(data.observaciones || data.observacionesAdicionales)
    );

    setIsEditing(true);
  }

  async function loadMaintenance(number: string) {
    if (!number) return false;

    const data = await getMaintenance(number);

    if (!data) {
      window.alert("No se encontró el mantenimiento indicado.");
      return false;
    }

    applyMaintenanceData(data, number);

    return true;
  }

  useEffect(() => {
    let isMounted = true;

    async function initializeMaintenance() {
      try {
        setLoading(true);

        const clientList = await getClients();

        if (!isMounted) return;

        setClients(Array.isArray(clientList) ? clientList : []);

        if (selectedMaintenanceNumber) {
          const loaded = await loadMaintenance(selectedMaintenanceNumber);

          if (loaded && isMounted) {
            navigate(location.pathname, {
              replace: true,
              state: null,
            });
          }

          return;
        }

        const nextNumber = await previewNextMaintenanceNumber();

        if (isMounted) {
          setNumero(nextNumber);
          setIsEditing(false);
        }
      } catch (error) {
        console.error("Error inicializando mantenimiento:", error);

        if (isMounted) {
          window.alert("No fue posible inicializar el mantenimiento.");
        }
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

  function buildData(): MaintenanceRecord {
    return {
      numero,
      fecha,
      estado,
      tecnicoResponsable,
      cliente,
      equipo,

      problemasReportados: [...problemasReportados, otroProblema.trim()].filter(Boolean),

      diagnosticoInicial,
      diagnosticoFinal,
      checklist,
      accionesRealizadas,

      hallazgos: hallazgos.split("\n").map((item) => item.trim()).filter(Boolean),

      recomendaciones: recomendaciones
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),

      conclusion,
      observaciones,
    };
  }

  function validate() {
    if (!numero) {
      window.alert("El mantenimiento debe tener un número.");
      return false;
    }

    if (!cliente.nombre.trim()) {
      window.alert("Seleccione o ingrese el cliente.");
      return false;
    }

    if (!equipo.marca.trim()) {
      window.alert("Ingrese la marca del equipo.");
      return false;
    }

    if (!equipo.modelo.trim()) {
      window.alert("Ingrese el modelo del equipo.");
      return false;
    }

    return true;
  }

  async function save(downloadPdf = false) {
    if (!validate()) return;

    try {
      setLoading(true);

      const data = buildData();

      await saveMaintenance(data);

      setIsEditing(true);

      if (downloadPdf) {
        await generateMaintenancePdf(data);
      }

      window.alert(
        downloadPdf
          ? "Mantenimiento guardado e informe generado."
          : "Mantenimiento guardado correctamente."
      );
    } catch (error) {
      console.error("Error guardando mantenimiento:", error);

      window.alert(
        error instanceof Error
          ? error.message
          : "No fue posible guardar el mantenimiento."
      );
    } finally {
      setLoading(false);
    }
  }

  async function searchMaintenance() {
    if (!numero.trim()) {
      window.alert("Ingrese el número del mantenimiento.");
      return;
    }

    try {
      setLoading(true);
      await loadMaintenance(numero.trim());
    } catch (error) {
      console.error("Error buscando mantenimiento:", error);

      window.alert("Ocurrió un error al buscar el mantenimiento.");
    } finally {
      setLoading(false);
    }
  }

  function selectClient(client: ClientDto) {
    setCliente({
      nombre: client.nombre || "",
      ruc: client.ruc || "",
      direccion: client.direccion || "",
      telefono: client.telefono || "",
      ciudad: client.ciudad || "Guayaquil",
    });

    setClientSearch(client.nombre || "");
    setShowClientDropdown(false);
  }

  function toggleProblem(problem: string) {
    setProblemasReportados((current) =>
      current.includes(problem)
        ? current.filter((item) => item !== problem)
        : [...current, problem]
    );
  }

  async function importDiagnostic(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const fileContent = (await file.text()).replace(/^\uFEFF/, "");

      const rawDiagnostic: unknown = JSON.parse(fileContent);

      const imported = parseMaintenanceDiagnostic(rawDiagnostic, checklist);

      setEquipo((current) => ({
        ...current,
        ...imported.equipo,
      }));

      setDiagnosticoInicial((current) => ({
        ...current,
        ...imported.diagnosticoInicial,
      }));

      setChecklist(imported.checklist);

      setAccionesRealizadas(normalizeTextList(imported.accionesRealizadas));

      setHallazgos(normalizeTextList(imported.hallazgos));

      setRecomendaciones(normalizeTextList(imported.recomendaciones));

      setConclusion(normalizeTextList(imported.conclusion));

      setObservaciones(normalizeTextList(imported.observaciones));

      window.alert(
        "Diagnóstico importado correctamente. Revise los campos pendientes antes de guardar."
      );
    } catch (error) {
      console.error("Error importando diagnóstico:", error);

      window.alert(
        error instanceof Error
          ? error.message
          : "No fue posible importar el archivo JSON."
      );
    } finally {
      event.target.value = "";
    }
  }

  const filteredClients = useMemo(() => {
    const normalizedClientSearch = clientSearch.trim().toLowerCase();

    if (!normalizedClientSearch) {
      return clients;
    }

    return clients.filter((client) => {
      const searchableText = [
        client?.nombre,
        client?.ruc,
        client?.email,
        client?.telefono,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedClientSearch);
    });
  }, [clients, clientSearch]);

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title={
          isEditing
            ? `Editar mantenimiento ${numero}`
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
        onChange={importDiagnostic}
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
            value={numero}
            onChange={(event) => setNumero(event.target.value)}
          />

          <InputField
            label="Fecha"
            type="date"
            value={fecha}
            onChange={(event) => setFecha(event.target.value)}
          />

          <label className="block">
            <span className="mb-2 block text-sm font-semibold !text-[#111827]">Estado</span>

            <select
              value={estado}
              onChange={(event) => setEstado(event.target.value)}
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
            value={tecnicoResponsable}
            onChange={(event) => setTecnicoResponsable(event.target.value)}
          />
        </div>
      </Card>

      <Card className="overflow-visible p-6">
        <p className="mb-6 text-xl font-bold !text-[#111827]">Datos del cliente</p>

        <div className="relative mb-4">
          <input
            value={clientSearch}
            onChange={(event) => {
              setClientSearch(event.target.value);
              setShowClientDropdown(true);
            }}
            onFocus={() => setShowClientDropdown(true)}
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

          {showClientDropdown && (
            <div
              className="
                absolute z-40 mt-2 max-h-72
                w-full overflow-y-auto
                rounded-xl border border-[#c7c6cb]
                bg-white shadow-xl
              "
            >
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => selectClient(client)}
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

              {filteredClients.length === 0 && (
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
            ] as Array<[keyof ClienteFormState, string]>
          ).map(([field, label]) => (
            <InputField
              key={field}
              label={label}
              value={cliente[field]}
              onChange={(event) =>
                setCliente((current) => ({
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

        <EquipmentForm equipo={equipo} onChange={setEquipo} />
      </Card>

      <Card className="p-6">
        <p className="mb-6 text-xl font-bold !text-[#111827]">Problemas reportados</p>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REPORTED_PROBLEMS.map((problem) => (
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
                checked={problemasReportados.includes(problem)}
                onChange={() => toggleProblem(problem)}
                className="accent-[#2170e4]"
              />

              {problem}
            </label>
          ))}
        </div>

        <InputField
          label="Otro problema"
          value={otroProblema}
          onChange={(event) => setOtroProblema(event.target.value)}
        />
      </Card>

      <Card className="p-6">
        <p className="mb-6 text-xl font-bold !text-[#111827]">Diagnóstico inicial</p>

        <DiagnosticFields
          value={diagnosticoInicial}
          onChange={setDiagnosticoInicial}
          includeCondition
        />
      </Card>

      <Card className="p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xl font-bold !text-[#111827]">Checklist técnico</p>

          <p className="text-sm font-medium !text-[#4b5563]">
            Conformes: {summary.Conforme || 0}
            {" · "}
            Observaciones: {summary["Observación"] || 0}
            {" · "}
            Pendientes: {summary.Pendiente || 0}
            {" · "}
            No aplica: {summary["No aplica"] || 0}
          </p>
        </div>

        <MaintenanceChecklist items={checklist} onChange={setChecklist} />
      </Card>

      <Card className="p-6">
        <p className="mb-6 text-xl font-bold !text-[#111827]">Diagnóstico final</p>

        <DiagnosticFields value={diagnosticoFinal} onChange={setDiagnosticoFinal} />
      </Card>

      <Card className="space-y-5 p-6">
        <p className="text-xl font-bold !text-[#111827]">Resultados del mantenimiento</p>

        <TextArea
          label="Acciones realizadas"
          value={accionesRealizadas}
          onChange={setAccionesRealizadas}
          placeholder="Describe las actividades ejecutadas."
        />

        <TextArea
          label="Hallazgos"
          value={hallazgos}
          onChange={setHallazgos}
          placeholder="Escribe un hallazgo por línea."
        />

        <TextArea
          label="Recomendaciones"
          value={recomendaciones}
          onChange={setRecomendaciones}
          placeholder="Escribe una recomendación por línea."
        />

        <TextArea
          label="Conclusión técnica"
          value={conclusion}
          onChange={setConclusion}
          placeholder="Describe la condición final del equipo."
        />

        <TextArea
          label="Observaciones adicionales"
          value={observaciones}
          onChange={setObservaciones}
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
