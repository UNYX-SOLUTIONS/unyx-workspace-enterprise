import { useCallback, useEffect, useState, useTransition } from "react";
import { listProformas, type ProformaDto } from "@/modules/proformas/services/proformaService";

export interface UseProformaHistory {
  proformas: ProformaDto[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string;
  search: string;
  updateSearch: (value: string) => void;
  page: number;
  setPage: (page: number | ((current: number) => number)) => void;
  reload: () => Promise<void>;
  isPending: boolean;
}

const MIN_LOADING_MS = 350;

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

export function useProformaHistory(): UseProformaHistory {
  const [proformas, setProformas] = useState<ProformaDto[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const load = useCallback(async () => {
    const startedAt = Date.now();
    setLoading(true);
    setError("");
    try {
      const response = await listProformas({ page, pageSize, search });

      // Duración mínima para que el overlay de la tabla se perciba suave
      // (evita parpadeos con respuestas muy rápidas).
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_LOADING_MS) {
        await wait(MIN_LOADING_MS - elapsed);
      }

      setProformas(response.data);
      setTotal(response.meta.total);
    } catch {
      setError("No fue posible cargar el historial de proformas.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    const timer = window.setTimeout(load, 300);
    return () => window.clearTimeout(timer);
  }, [load]);

  const updateSearch = useCallback((value: string) => {
    startTransition(() => {
      setSearch(value);
      setPage(1);
    });
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    proformas,
    total,
    totalPages,
    loading,
    error,
    search,
    updateSearch,
    page,
    setPage,
    reload: load,
    isPending,
  };
}
