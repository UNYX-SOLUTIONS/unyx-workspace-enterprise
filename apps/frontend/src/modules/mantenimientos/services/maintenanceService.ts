import { api } from "@/config/api";
import type { MaintenanceEstado } from "@unyx/shared-schemas";

export interface MaintenanceRecord {
  id?: string;
  numero: string;
  [key: string]: unknown;
}

export interface MaintenanceDto {
  id: string;
  numero: string;
  sequenceNumber: number;
  fecha: string;
  estado: MaintenanceEstado;
  tecnicoResponsable?: string | null;
  cliente?: Record<string, unknown> | null;
  equipo?: Record<string, unknown> | null;
  problemasReportados: string[];
  diagnosticoInicial?: Record<string, string> | null;
  diagnosticoFinal?: Record<string, string> | null;
  checklist?: Array<Record<string, unknown>> | null;
  accionesRealizadas?: string | null;
  hallazgos: string[];
  recomendaciones: string[];
  conclusion?: string | null;
  observaciones?: string | null;
  notas?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const ESTADO_TO_ENUM: Record<string, MaintenanceEstado> = {
  "En revisión": "EN_REVISION",
  "En mantenimiento": "EN_MANTENIMIENTO",
  "Finalizado": "FINALIZADO",
  "Entregado": "ENTREGADO",
};

const ENUM_TO_ESTADO: Record<MaintenanceEstado, string> = {
  EN_REVISION: "En revisión",
  EN_MANTENIMIENTO: "En mantenimiento",
  FINALIZADO: "Finalizado",
  ENTREGADO: "Entregado",
};

function toEnum(estado: unknown): MaintenanceEstado {
  if (typeof estado === "string") {
    const mapped = ESTADO_TO_ENUM[estado];
    if (mapped) return mapped;
    const direct = estado.toUpperCase();
    if (direct in ENUM_TO_ESTADO) return direct as MaintenanceEstado;
  }
  return "EN_REVISION";
}

function toRecord(dto: MaintenanceDto): MaintenanceRecord {
  return {
    ...dto,
    estado: ENUM_TO_ESTADO[dto.estado] ?? dto.estado,
  };
}

function buildPayload(maintenance: MaintenanceRecord): Record<string, unknown> {
  const {
    id: _id,
    numero: _numero,
    sequenceNumber: _sequenceNumber,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...rest
  } = maintenance;

  return {
    ...rest,
    estado: toEnum(maintenance.estado),
  };
}

export async function previewNextMaintenanceNumber(): Promise<string> {
  const { data } = await api.get<{ numero: string }>("/mantenimientos/numero-siguiente");
  return data.numero;
}

export async function createMaintenance(maintenance: MaintenanceRecord): Promise<MaintenanceDto> {
  const { data } = await api.post<MaintenanceDto>("/mantenimientos", buildPayload(maintenance));
  return data;
}

export async function updateMaintenance(
  numeroOrId: string,
  maintenance: MaintenanceRecord
): Promise<MaintenanceDto> {
  const { data } = await api.put<MaintenanceDto>(
    `/mantenimientos/${encodeURIComponent(numeroOrId)}`,
    buildPayload(maintenance)
  );
  return data;
}

export async function saveMaintenance(maintenance: MaintenanceRecord): Promise<MaintenanceDto> {
  if (maintenance.id) {
    return updateMaintenance(maintenance.id, maintenance);
  }
  return createMaintenance(maintenance);
}

export async function getMaintenance(number: string): Promise<MaintenanceRecord | null> {
  try {
    const { data } = await api.get<MaintenanceDto>(`/mantenimientos/${encodeURIComponent(number)}`);
    return toRecord(data);
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 404) return null;
    throw error;
  }
}

export async function getMaintenances(): Promise<MaintenanceRecord[]> {
  const { data } = await api.get<{ data: MaintenanceDto[] }>("/mantenimientos", {
    params: { page: 1, pageSize: 200 },
  });
  return data.data.map(toRecord);
}

export async function updateMaintenanceStatus(
  numeroOrId: string,
  status: string
): Promise<MaintenanceDto> {
  const { data } = await api.put<MaintenanceDto>(
    `/mantenimientos/${encodeURIComponent(numeroOrId)}`,
    { estado: toEnum(status) }
  );
  return data;
}

export async function deleteMaintenance(numeroOrId: string): Promise<{ id: string; numero: string }> {
  const { data } = await api.delete<{ id: string; numero: string }>(
    `/mantenimientos/${encodeURIComponent(numeroOrId)}`
  );
  return data;
}
