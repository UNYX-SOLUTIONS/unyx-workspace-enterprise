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

export function getProformaStatusMeta(status?: string | null): StatusMeta {
  return (
    PROFORMA_STATUS_MAP[status ?? ""] || {
      label: String(status || "Desconocido"),
      badge: "border-gray-300 bg-gray-100 text-gray-700",
    }
  );
}
