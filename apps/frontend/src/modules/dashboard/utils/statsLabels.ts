import { getProformaStatusMeta } from "@/modules/common/utils/statusMap";
import type { EstadoStats, ProformaStats } from "@/modules/proformas/services/proformaService";

export interface FunnelRow {
  estado: string;
  label: string;
  dot: string;
  count: number;
  monto: number;
}

// Orden del embudo: borrador -> enviada -> aceptada, luego salidas (cancelada/expirada)
export function buildFunnelRows(stats: ProformaStats): FunnelRow[] {
  const rows: Array<[string, EstadoStats]> = [
    ["BORRADOR", stats.borradores],
    ["ENVIADA", stats.enviadas],
    ["ACEPTADA", stats.aceptadas],
    ["CANCELADA", stats.canceladas],
    ["EXPIRADA", stats.expiradas],
  ];

  return rows.map(([estado, value]) => {
    const meta = getProformaStatusMeta(estado);
    return {
      estado,
      label: meta.label,
      dot: meta.dot,
      count: value.count,
      monto: value.monto,
    };
  });
}
