import { useMemo, useState, type ChangeEvent } from "react";
import { createMaintenanceChecklist, type ChecklistItem } from "@/modules/mantenimientos/constants/maintenanceChecklist";
import type { EquipmentState } from "@/modules/mantenimientos/components/EquipmentForm";
import { getClients, type ClientDto } from "@/modules/clientes/services/clientService";
import { getMaintenance, type MaintenanceRecord } from "@/modules/mantenimientos/services/maintenanceService";
import { parseMaintenanceDiagnostic } from "@/modules/mantenimientos/utils/importMaintenanceDiagnostic";
import { normalizeDate, todayIso } from "@/modules/common/utils/dateHelpers";

export interface ClienteFormState {
  nombre: string;
  ruc: string;
  direccion: string;
  telefono: string;
  ciudad: string;
}

export interface DiagnosticState {
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

export const EMPTY_CLIENT: ClienteFormState = {
  nombre: "",
  ruc: "",
  direccion: "",
  telefono: "",
  ciudad: "Guayaquil",
};

export const EMPTY_EQUIPMENT: EquipmentState = {
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

export const EMPTY_DIAGNOSTIC: DiagnosticState = {
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

export function normalizeTextList(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean).join("\n");
  }
  return typeof value === "string" ? value : "";
}

export function useMaintenanceForm() {
  const [numero, setNumero] = useState("");
  const [fecha, setFecha] = useState(todayIso());
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

  const [isEditing, setIsEditing] = useState(false);

  const summary = useMemo(() => {
    return checklist.reduce<Record<string, number>>((accumulator, item) => {
      accumulator[item.estado] = (accumulator[item.estado] || 0) + 1;
      return accumulator;
    }, {});
  }, [checklist]);

  const filteredClients = useMemo(() => {
    const normalizedClientSearch = clientSearch.trim().toLowerCase();

    if (!normalizedClientSearch) {
      return clients;
    }

    return clients.filter((client) => {
      const searchableText = [client?.nombre, client?.ruc, client?.email, client?.telefono]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedClientSearch);
    });
  }, [clients, clientSearch]);

  function applyMaintenanceData(data: MaintenanceRecord, fallbackNumber = "") {
    setNumero(String(data.numero || fallbackNumber));
    setFecha(normalizeDate(data.fecha));
    setEstado(String(data.estado || "En revisión"));

    setTecnicoResponsable(String(data.tecnicoResponsable || ""));

    setCliente({
      ...EMPTY_CLIENT,
      ...(data.cliente as Partial<ClienteFormState> | undefined),
    });

    setClientSearch(
      String((data.cliente as Partial<ClienteFormState> | undefined)?.nombre || "")
    );

    setEquipo({
      ...EMPTY_EQUIPMENT,
      ...(data.equipo as Partial<EquipmentState> | undefined),
    });

    setProblemasReportados(
      Array.isArray(data.problemasReportados) ? (data.problemasReportados as string[]) : []
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

    setConclusion(normalizeTextList(data.conclusion || data.conclusionTecnica));

    setObservaciones(normalizeTextList(data.observaciones || data.observacionesAdicionales));

    setIsEditing(true);
  }

  function reset() {
    setNumero("");
    setFecha(todayIso());
    setEstado("En revisión");
    setTecnicoResponsable("");
    setCliente({ ...EMPTY_CLIENT });
    setClientSearch("");
    setEquipo({ ...EMPTY_EQUIPMENT });
    setProblemasReportados([]);
    setOtroProblema("");
    setDiagnosticoInicial({ ...EMPTY_DIAGNOSTIC });
    setDiagnosticoFinal({ ...EMPTY_DIAGNOSTIC });
    setChecklist(createMaintenanceChecklist());
    setAccionesRealizadas("");
    setHallazgos("");
    setRecomendaciones("");
    setConclusion("");
    setObservaciones("");
    setIsEditing(false);
  }

  async function loadClients() {
    const clientList = await getClients();
    setClients(Array.isArray(clientList) ? clientList : []);
  }

  async function loadMaintenance(number: string): Promise<MaintenanceRecord | null> {
    if (!number) return null;

    const data = await getMaintenance(number);

    if (!data) {
      return null;
    }

    applyMaintenanceData(data, number);

    return data;
  }

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

      recomendaciones: recomendaciones.split("\n").map((item) => item.trim()).filter(Boolean),

      conclusion,
      observaciones,
    };
  }

  function validate(): boolean {
    if (!numero) return false;
    if (!cliente.nombre.trim()) return false;
    if (!equipo.marca.trim()) return false;
    if (!equipo.modelo.trim()) return false;
    return true;
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

  async function importDiagnostic(event: ChangeEvent<HTMLInputElement>): Promise<boolean> {
    const file = event.target.files?.[0];

    if (!file) return false;

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

      return true;
    } finally {
      event.target.value = "";
    }
  }

  return {
    numero,
    setNumero,
    fecha,
    setFecha,
    estado,
    setEstado,
    tecnicoResponsable,
    setTecnicoResponsable,
    cliente,
    setCliente,
    equipo,
    setEquipo,
    problemasReportados,
    otroProblema,
    setOtroProblema,
    diagnosticoInicial,
    setDiagnosticoInicial,
    diagnosticoFinal,
    setDiagnosticoFinal,
    checklist,
    setChecklist,
    accionesRealizadas,
    setAccionesRealizadas,
    hallazgos,
    setHallazgos,
    recomendaciones,
    setRecomendaciones,
    conclusion,
    setConclusion,
    observaciones,
    setObservaciones,
    clients,
    clientSearch,
    setClientSearch,
    showClientDropdown,
    setShowClientDropdown,
    isEditing,
    setIsEditing,
    summary,
    filteredClients,
    applyMaintenanceData,
    reset,
    loadClients,
    loadMaintenance,
    buildData,
    validate,
    selectClient,
    toggleProblem,
    importDiagnostic,
    REPORTED_PROBLEMS,
  };
}

export type UseMaintenanceForm = ReturnType<typeof useMaintenanceForm>;
