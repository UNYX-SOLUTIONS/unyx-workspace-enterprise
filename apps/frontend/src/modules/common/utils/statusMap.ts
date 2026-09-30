export interface StatusMeta {
  label: string;
  dot: string;
  badge: string;
  hoverBorder: string;
  reversible?: boolean;
}

// Orden del ciclo de vida para dropdowns y filtros
export const PROFORMA_ESTADOS = [
  "BORRADOR",
  "ENVIADA",
  "ACEPTADA",
  "CANCELADA",
  "EXPIRADA",
] as const;

export const PROFORMA_STATUS_MAP: Record<string, StatusMeta> = {
  BORRADOR: {
    label: "BORRADOR",
    dot: "bg-slate-400",
    badge: "border-slate-200 bg-slate-100 text-slate-700",
    hoverBorder: "hover:border-l-slate-400",
  },
  ENVIADA: {
    label: "ENVIADA",
    dot: "bg-amber-500",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    hoverBorder: "hover:border-l-amber-500",
  },
  ACEPTADA: {
    label: "ACEPTADA",
    dot: "bg-emerald-500",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    hoverBorder: "hover:border-l-emerald-500",
  },
  CANCELADA: {
    label: "CANCELADA",
    dot: "bg-rose-500",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    hoverBorder: "hover:border-l-rose-500",
    reversible: true,
  },
  EXPIRADA: {
    label: "EXPIRADA",
    dot: "bg-orange-500",
    badge: "border-orange-200 bg-orange-50 text-orange-700",
    hoverBorder: "hover:border-l-orange-500",
    reversible: true,
  },
};

export const MAINTENANCE_STATUS_MAP: Record<string, StatusMeta> = {
  "En revisión": {
    label: "En revisión",
    dot: "bg-violet-500",
    badge: "border-violet-200 bg-violet-50 text-violet-700",
    hoverBorder: "",
  },
  "En mantenimiento": {
    label: "En mantenimiento",
    dot: "bg-orange-500",
    badge: "border-orange-200 bg-orange-50 text-orange-700",
    hoverBorder: "",
  },
  Finalizado: {
    label: "Finalizado",
    dot: "bg-blue-500",
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    hoverBorder: "",
  },
  Entregado: {
    label: "Entregado",
    dot: "bg-emerald-500",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    hoverBorder: "",
  },
};

const UNKNOWN_META: StatusMeta = {
  label: "DESCONOCIDO",
  dot: "bg-slate-300",
  badge: "border-slate-200 bg-slate-100 text-slate-600",
  hoverBorder: "",
};

export function getProformaStatusMeta(status?: string | null): StatusMeta {
  return PROFORMA_STATUS_MAP[status ?? ""] || { ...UNKNOWN_META, label: status || "DESCONOCIDO" };
}

export function getMaintenanceStatusMeta(status?: string | null): StatusMeta {
  return MAINTENANCE_STATUS_MAP[status ?? ""] || { ...UNKNOWN_META, label: status || "SIN ESTADO" };
}
