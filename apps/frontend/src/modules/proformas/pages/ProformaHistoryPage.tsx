import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ActionButton,
  Card,
  EmptyState,
  PageHeader,
  SummaryCard,
} from "../../../components/common";
import { useToast } from "@/hooks/useToast";
import { getDateTimestamp } from "@/modules/common/utils/dateHelpers";
import { formatCurrency } from "@/modules/common/utils/monetary";
import { getProformaStatusMeta } from "@/modules/common/utils/statusMap";
import ProformaStatusBadge from "@/modules/proformas/components/ProformaStatusBadge";
import { useProformaHistory } from "@/modules/proformas/hooks/useProformaHistory";
import { generatePdf } from "@/modules/proformas/utils/generatePdf";
import type { ProformaDto } from "@/modules/proformas/services/proformaService";

type SortKey = "numero" | "cliente" | "fecha" | "estado" | "total";

function toDisplayCents(value: unknown): number {
  return Math.round(Number(value || 0) * 100);
}

function getQuotationNumber(value: unknown): number {
  const matches = String(value || "").match(/\d+/g);
  if (!matches) return 0;
  return Number(matches.join("")) || 0;
}

function getSortValue(proforma: ProformaDto, key: SortKey): string | number {
  switch (key) {
    case "numero":
      return getQuotationNumber(proforma?.numero);
    case "cliente":
      return String(proforma?.cliente?.nombre || "").trim().toLowerCase();
    case "fecha":
      return getDateTimestamp(proforma?.fecha);
    case "estado":
      return String(proforma?.estado || "").trim().toLowerCase();
    case "total":
      return toDisplayCents(proforma?.total);
    default:
      return "";
  }
}

export default function ProformaHistoryPage() {
  const navigate = useNavigate();
  const { showError } = useToast();
  const {
    proformas,
    total,
    totalPages,
    loading,
    error,
    search,
    updateSearch,
    page,
    setPage,
  } = useProformaHistory();

  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" }>({
    key: "numero",
    direction: "desc",
  });
  const [generatingPdfNumber, setGeneratingPdfNumber] = useState<string | null>(null);

  const sortedProformas = useMemo(() => {
    return [...proformas].sort((first, second) => {
      const firstValue = getSortValue(first, sortConfig.key);
      const secondValue = getSortValue(second, sortConfig.key);

      const comparison =
        typeof firstValue === "number" && typeof secondValue === "number"
          ? firstValue - secondValue
          : String(firstValue).localeCompare(String(secondValue), "es", {
              numeric: true,
              sensitivity: "base",
            });

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [proformas, sortConfig]);

  const summary = useMemo(() => {
    const totalAmount = proformas.reduce(
      (sum, proforma) => sum + toDisplayCents(proforma?.total),
      0
    );
    const accepted = proformas.filter((proforma) => proforma?.estado === "ACEPTADA").length;
    const drafts = proformas.filter((proforma) => proforma?.estado === "BORRADOR").length;
    return {
      totalAmount,
      accepted,
      drafts,
      average: proformas.length > 0 ? totalAmount / proformas.length : 0,
    };
  }, [proformas]);

  function handleSort(key: SortKey) {
    setSortConfig((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: key === "numero" ? "desc" : "asc" };
    });
  }

  function sortIndicator(key: SortKey) {
    if (sortConfig.key !== key) return <span aria-hidden="true">↕</span>;
    return <span aria-hidden="true">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>;
  }

  async function handleGeneratePdf(proforma: ProformaDto) {
    try {
      setGeneratingPdfNumber(proforma.numero);
      await generatePdf(proforma);
    } catch (pdfError) {
      const message = pdfError instanceof Error ? pdfError.message : "Error desconocido";
      showError(`Error al generar el PDF: ${message}`);
    } finally {
      setGeneratingPdfNumber(null);
    }
  }

  function handleExport() {
    const header = ["Número", "Fecha", "Cliente", "RUC", "Estado", "Total"];
    const rows = sortedProformas.map((proforma) => [
      proforma.numero,
      proforma.fecha ? new Date(proforma.fecha).toLocaleDateString("es-EC") : "",
      proforma?.cliente?.nombre || "",
      proforma?.cliente?.ruc || "",
      getProformaStatusMeta(proforma.estado).label,
      formatCurrency(toDisplayCents(proforma.total)),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "proformas.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const sortableHeaderClass =
    "group flex w-full items-center gap-2 text-left text-xs font-extrabold uppercase tracking-wide text-[#26364d] transition-colors hover:text-[#174a8b]";

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Historial de Proformas"
        subtitle="Consulta, revisa y gestiona las proformas emitidas."
        action={
          <button
            type="button"
            onClick={() => navigate("/proformas/nueva")}
            className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-gradient-to-r from-[#2170e4] to-[#0058be] px-6 py-3 font-bold text-white transition-all hover:scale-105 hover:shadow-lg"
          >
            + Nueva Proforma
          </button>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total (página)"
          value={formatCurrency(summary.totalAmount)}
          icon="💵"
          color="blue"
        />
        <SummaryCard title="Aceptadas" value={summary.accepted} icon="✅" color="green" />
        <SummaryCard title="Borradores" value={summary.drafts} icon="📝" color="orange" />
        <SummaryCard
          title="Ticket Promedio"
          value={formatCurrency(Math.round(summary.average))}
          icon="🎯"
          color="green"
        />
      </section>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[#b7c3d7] bg-gradient-to-r from-[#eff4ff] to-[#dce9ff] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-lg border border-[#aebbd0] bg-white px-4 py-2 text-sm font-semibold text-[#26364d] transition-colors hover:bg-[#e5eeff]"
          >
            📥 Exportar CSV
          </button>

          <label className="w-full sm:max-w-xs">
            <span className="sr-only">Buscar proforma</span>
            <input
              type="search"
              placeholder="Buscar proforma..."
              value={search}
              onChange={(event) => updateSearch(event.target.value)}
              className="w-full rounded-lg border border-[#aebbd0] bg-white px-4 py-2 text-[#111827] outline-none transition-all focus:border-[#2170e4] focus:ring-2 focus:ring-[#2170e4]"
            />
          </label>
        </div>

        {loading && (
          <div className="p-10 text-center font-medium text-[#374151]">Cargando proformas...</div>
        )}

        {!loading && error && (
          <div className="p-10 text-center font-semibold text-[#b42318]">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#b7c3d7] bg-[#e7effd]">
                    <th className="px-4 py-4 sm:px-6">
                      <button type="button" onClick={() => handleSort("numero")} className={sortableHeaderClass}>
                        Número {sortIndicator("numero")}
                      </button>
                    </th>
                    <th className="px-4 py-4 sm:px-6">
                      <button type="button" onClick={() => handleSort("cliente")} className={sortableHeaderClass}>
                        Cliente {sortIndicator("cliente")}
                      </button>
                    </th>
                    <th className="hidden px-4 py-4 sm:px-6 md:table-cell">
                      <button type="button" onClick={() => handleSort("fecha")} className={sortableHeaderClass}>
                        Fecha {sortIndicator("fecha")}
                      </button>
                    </th>
                    <th className="px-4 py-4 sm:px-6">
                      <button type="button" onClick={() => handleSort("estado")} className={sortableHeaderClass}>
                        Estado {sortIndicator("estado")}
                      </button>
                    </th>
                    <th className="hidden px-4 py-4 text-right sm:table-cell sm:px-6">
                      <button
                        type="button"
                        onClick={() => handleSort("total")}
                        className={`${sortableHeaderClass} justify-end`}
                      >
                        Total {sortIndicator("total")}
                      </button>
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-extrabold uppercase tracking-wide text-[#26364d] sm:px-6">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d1d8e3]">
                  {sortedProformas.map((proforma) => (
                    <tr
                      key={proforma.id || proforma.numero}
                      className="bg-white transition-colors hover:bg-[#f3f7ff]"
                    >
                        <td className="px-4 py-4 sm:px-6">
                          <button
                            type="button"
                            onClick={() => navigate(`/proformas/${proforma.numero}/editar`)}
                            className="font-bold text-[#145dbf] transition-colors hover:text-[#0b438f] hover:underline"
                          >
                            #{proforma.numero || "Sin número"}
                          </button>
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <p className="font-bold text-[#111827]">
                            {proforma?.cliente?.nombre || "Sin cliente"}
                          </p>
                          <p className="mt-1 text-xs font-medium text-[#4b5563]">
                            {proforma?.cliente?.ruc || "Sin RUC"}
                          </p>
                        </td>
                        <td className="hidden px-4 py-4 font-medium text-[#374151] sm:px-6 md:table-cell">
                          {proforma.fecha
                            ? new Date(proforma.fecha).toLocaleDateString("es-EC")
                            : "Sin fecha"}
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <ProformaStatusBadge status={proforma.estado} />
                        </td>
                        <td className="hidden px-4 py-4 text-right font-extrabold text-[#111827] sm:table-cell sm:px-6">
                          {formatCurrency(toDisplayCents(proforma.total))}
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <div className="flex justify-center gap-2">
                            <ActionButton
                              label={
                                generatingPdfNumber === proforma.numero
                                  ? "Generando..."
                                  : "PDF"
                              }
                              variant="secondary"
                              disabled={generatingPdfNumber === proforma.numero}
                              onClick={() => handleGeneratePdf(proforma)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}

                  {sortedProformas.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center">
                        <EmptyState
                          icon="📭"
                          title="No hay proformas"
                          description={
                            search ? "Intenta con otra búsqueda." : "Crea tu primera proforma para comenzar."
                          }
                          action={
                            !search ? (
                              <button
                                type="button"
                                onClick={() => navigate("/proformas/nueva")}
                                className="rounded-lg bg-[#2170e4] px-6 py-2 font-bold text-white transition-colors hover:bg-[#0058be]"
                              >
                                + Crear Proforma
                              </button>
                            ) : null
                          }
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 border-t border-[#c7c6cb] bg-white p-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <p className="font-medium text-[#374151]">
                Mostrando {proformas.length} de {total} proformas · Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="rounded-lg border border-[#aebbd0] bg-white px-4 py-2 font-semibold text-[#26364d] transition-colors hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  className="rounded-lg border border-[#aebbd0] bg-white px-4 py-2 font-semibold text-[#26364d] transition-colors hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
