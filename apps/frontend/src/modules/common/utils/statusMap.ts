export interface StatusMeta {
  label: string;
  badge: string;
}

export const PROFORMA_STATUS_MAP: Record<string, StatusMeta> = {
  BORRADOR: {
    label: "Borrador",
    badge: "border-gray-300 bg-gray-100 text-gray-700",
  },
  EMITIDA: {
    label: "Emitida",
    badge: "border-amber-300 bg-amber-100 text-amber-700",
  },
  ENVIADA: {
    label: "Enviada",
    badge: "border-blue-300 bg-blue-100 text-blue-700",
  },
  APROBADA: {
    label: "Aprobada",
    badge: "border-green-300 bg-green-100 text-green-700",
  },
  CANCELADA: {
    label: "Cancelada",
    badge: "border-red-300 bg-red-50 text-red-700",
  },
};

// Flujo permitido: BORRADOR -> EMITIDA -> ENVIADA -> APROBADA
// y CANCELADA desde cualquier estado. Siempre se permite el estado actual.
export const PROFORMA_TRANSITIONS: Record<string, string[]> = {
  BORRADOR: ["BORRADOR", "EMITIDA", "CANCELADA"],
  EMITIDA: ["EMITIDA", "ENVIADA", "CANCELADA"],
  ENVIADA: ["ENVIADA", "APROBADA", "CANCELADA"],
  APROBADA: ["APROBADA", "CANCELADA"],
  CANCELADA: ["CANCELADA"],
};

export function getProformaTransitions(status?: string | null): string[] {
  return PROFORMA_TRANSITIONS[status ?? ""] ?? [status ?? ""];
}

export const MAINTENANCE_STATUS_MAP: Record<string, StatusMeta> = {
  "En revisión": {
    label: "En revisión",
    badge: "border-[#c4b5e8] bg-[#f0ebff] !text-[#59409b]",
  },
  "En mantenimiento": {
    label: "En mantenimiento",
    badge: "border-[#f1b77e] bg-[#fff0df] !text-[#8a4307]",
  },
  Finalizado: {
    label: "Finalizado",
    badge: "border-[#91b7eb] bg-[#e5eeff] !text-[#174a8b]",
  },
  Entregado: {
    label: "Entregado",
    badge: "border-[#86c7a5] bg-[#e4f7ed] !text-[#17603d]",
  },
};

export function getProformaStatusMeta(status?: string | null): StatusMeta {
  return (
    PROFORMA_STATUS_MAP[status ?? ""] || {
      label: String(status || "Desconocido"),
      badge: "border-gray-300 bg-gray-100 text-gray-700",
    }
  );
}

export function getMaintenanceStatusMeta(status?: string | null): StatusMeta {
  return (
    MAINTENANCE_STATUS_MAP[status ?? ""] || {
      label: String(status || "Sin estado"),
      badge: "border-[#c7c6cb] bg-[#f3f4f6] !text-[#374151]",
    }
  );
}
