import { useCallback, useEffect, useState, useTransition } from "react";
import { listProformas } from "../services/proformaService";

export function useProformaHistory() {
  const [proformas, setProformas] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await listProformas({ page, pageSize, search });
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

  const updateSearch = useCallback((value) => {
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
