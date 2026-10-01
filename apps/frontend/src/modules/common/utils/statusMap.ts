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
    badge: "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    hoverBorder: "hover:border-l-slate-400",
  },
  ENVIADA: {
    label: "ENVIADA",
    dot: "bg-amber-500",
    badge: "border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
    hoverBorder: "hover:border-l-amber-500",
  },
  ACEPTADA: {
    label: "ACEPTADA",
    dot: "bg-emerald-500",
    badge: "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    hoverBorder: "hover:border-l-emerald-500",
  },
  CANCELADA: {
    label: "CANCELADA",
    dot: "bg-rose-500",
    badge: "border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400",
    hoverBorder: "hover:border-l-rose-500",
    reversible: true,
  },
  EXPIRADA: {
    label: "EXPIRADA",
    dot: "bg-orange-500",
    badge: "border-orange-200 dark:border-orange-500/30 bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400",
    hoverBorder: "hover:border-l-orange-500",
    reversible: true,
  },
};

export const MAINTENANCE_STATUS_MAP: Record<string, StatusMeta> = {
  "En revisión": {
    label: "En revisión",
    dot: "bg-violet-500",
    badge: "border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400",
    hoverBorder: "",
  },
  "En mantenimiento": {
    label: "En mantenimiento",
    dot: "bg-orange-500",
    badge: "border-orange-200 dark:border-orange-500/30 bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400",
    hoverBorder: "",
  },
  Finalizado: {
    label: "Finalizado",
    dot: "bg-blue-500",
    badge: "border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",
    hoverBorder: "",
  },
  Entregado: {
    label: "Entregado",
    dot: "bg-emerald-500",
    badge: "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    hoverBorder: "",
  },
};

const UNKNOWN_META: StatusMeta = {
  label: "DESCONOCIDO",
  dot: "bg-slate-300",
  badge: "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  hoverBorder: "",
};

export function getProformaStatusMeta(status?: string | null): StatusMeta {
  return PROFORMA_STATUS_MAP[status ?? ""] || { ...UNKNOWN_META, label: status || "DESCONOCIDO" };
}

export function getMaintenanceStatusMeta(status?: string | null): StatusMeta {
  return MAINTENANCE_STATUS_MAP[status ?? ""] || { ...UNKNOWN_META, label: status || "SIN ESTADO" };
}
