import { useCallback, useEffect, useState } from "react";
import {
  getProformaStats,
  type DateRange,
  type ProformaStats,
} from "@/modules/proformas/services/proformaService";

const EMPTY_STATS: ProformaStats = {
  totalProformas: 0,
  borradores: { count: 0, monto: 0 },
  enviadas: { count: 0, monto: 0 },
  aceptadas: { count: 0, monto: 0 },
  canceladas: { count: 0, monto: 0 },
  expiradas: { count: 0, monto: 0 },
  emitidas: 0,
  tasaAceptacion: 0,
  ticketPromedio: 0,
};

export function useProformaStats(range: DateRange = {}) {
  const [stats, setStats] = useState<ProformaStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  const desde = range.desde ?? "";
  const hasta = range.hasta ?? "";

  const reload = useCallback(async () => {
    try {
      setStats(await getProformaStats({ desde, hasta }));
    } catch {
      // Sin estadísticas no se bloquea la vista; se mantienen los valores previos.
    } finally {
      setLoading(false);
    }
  }, [desde, hasta]);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await getProformaStats({ desde, hasta });
        if (active) setStats(data);
      } catch {
        // mantener valores previos
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [desde, hasta]);

  return { stats, loading, reload };
}
