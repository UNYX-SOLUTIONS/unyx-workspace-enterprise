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
  ACEPTADA: {
    label: "Aceptada",
    badge: "border-green-300 bg-green-100 text-green-700",
  },
  CERRADA: {
    label: "Cerrada",
    badge: "border-blue-300 bg-blue-100 text-blue-700",
  },
};

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
