import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Banknote, CheckCircle2, Download, FilePenLine, Inbox, Target } from "lucide-react";

import {
  Card,
  EmptyState,
  PageHeader,
  SummaryCard,
} from "../../../components/common";
import { useToast } from "@/hooks/useToast";
import { getDateTimestamp } from "@/modules/common/utils/dateHelpers";
import { formatCurrency } from "@/modules/common/utils/monetary";
import { getProformaStatusMeta } from "@/modules/common/utils/statusMap";
import ProformaDetailModal from "@/modules/proformas/components/ProformaDetailModal";
import ProformaRowActions from "@/modules/proformas/components/ProformaRowActions";
import ProformaStatusDropdown from "@/modules/proformas/components/ProformaStatusDropdown";
import ProformaStatusFilter, {
  type ProformaStatusFilterValue,
} from "@/modules/proformas/components/ProformaStatusFilter";
import { useProformaHistory } from "@/modules/proformas/hooks/useProformaHistory";
import {
  deleteProforma,
  duplicateProforma,
  updateProformaStatus,
} from "@/modules/proformas/services/proformaService";
import { generatePdf } from "@/modules/proformas/utils/generatePdf";
import type { ProformaDto } from "@/modules/proformas/services/proformaService";
import type { ProformaEstado } from "@unyx/shared-schemas";

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
  const { showError, showSuccess } = useToast();
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
    reload,
  } = useProformaHistory();

  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" }>({
    key: "numero",
    direction: "desc",
  });
  const [generatingPdfNumber, setGeneratingPdfNumber] = useState<string | null>(null);
  const [updatingStatusNumber, setUpdatingStatusNumber] = useState<string | null>(null);
  const [duplicatingNumber, setDuplicatingNumber] = useState<string | null>(null);
  const [deletingNumber, setDeletingNumber] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ProformaStatusFilterValue>("TODOS");
  const [detailProforma, setDetailProforma] = useState<ProformaDto | null>(null);

  const sortedProformas = useMemo(() => {
    const filtered =
      statusFilter === "TODOS"
        ? proformas
        : proformas.filter((proforma) => proforma.estado === statusFilter);

    return [...filtered].sort((first, second) => {
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
  }, [proformas, sortConfig, statusFilter]);

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

  async function handleStatusChange(proforma: ProformaDto, nextStatus: ProformaEstado) {
    if (nextStatus === proforma.estado) return;

    try {
      setUpdatingStatusNumber(proforma.numero);
      const updated = await updateProformaStatus(proforma.numero, nextStatus);
      showSuccess(
        `Proforma ${updated.numero}: estado actualizado a ${getProformaStatusMeta(updated.estado).label}.`
      );
      await reload();
    } catch (statusError) {
      const apiError = (statusError as { response?: { data?: { error?: string } } })?.response
        ?.data?.error;
      const message = statusError instanceof Error ? statusError.message : "Error desconocido";
      showError(apiError || `No se pudo cambiar el estado: ${message}`);
    } finally {
      setUpdatingStatusNumber(null);
    }
  }

  async function handleDuplicate(proforma: ProformaDto) {
    try {
      setDuplicatingNumber(proforma.numero);
      const copy = await duplicateProforma(proforma.numero);
      showSuccess(`Proforma duplicada como ${copy.numero} (borrador).`);
      await reload();
    } catch (duplicateError) {
      const apiError = (duplicateError as { response?: { data?: { error?: string } } })?.response
        ?.data?.error;
      showError(apiError || "No se pudo duplicar la proforma.");
    } finally {
      setDuplicatingNumber(null);
    }
  }

  async function handleDelete(proforma: ProformaDto) {
    try {
      setDeletingNumber(proforma.numero);
      await deleteProforma(proforma.numero);
      showSuccess(`Proforma ${proforma.numero} eliminada.`);
      await reload();
    } catch (deleteError) {
      const apiError = (deleteError as { response?: { data?: { error?: string } } })?.response
        ?.data?.error;
      showError(apiError || "No se pudo eliminar la proforma.");
    } finally {
      setDeletingNumber(null);
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
    "group flex w-full items-center gap-2 text-left text-xs font-extrabold uppercase tracking-wide text-slate-700 transition-colors hover:text-slate-900";

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Historial de Proformas"
        subtitle="Consulta, revisa y gestiona las proformas emitidas."
        action={
          <button
            type="button"
            onClick={() => navigate("/proformas/nueva")}
            className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-500 hover:bg-blue-600 px-6 py-3 font-bold text-white transition-all hover:scale-105 hover:shadow-lg"
          >
            + Nueva Proforma
          </button>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total (página)"
          value={formatCurrency(summary.totalAmount)}
          icon={<Banknote className="h-4 w-4" aria-hidden="true" />}
          color="blue"
        />
        <SummaryCard
          title="Aceptadas"
          value={summary.accepted}
          icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
          color="green"
        />
        <SummaryCard
          title="Borradores"
          value={summary.drafts}
          icon={<FilePenLine className="h-4 w-4" aria-hidden="true" />}
          color="orange"
        />
        <SummaryCard
          title="Ticket Promedio"
          value={formatCurrency(Math.round(summary.average))}
          icon={<Target className="h-4 w-4" aria-hidden="true" />}
          color="red"
        />
      </section>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Exportar CSV
          </button>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <ProformaStatusFilter value={statusFilter} onChange={setStatusFilter} />

            <label className="w-full sm:max-w-xs">
              <span className="sr-only">Buscar proforma</span>
              <input
                type="search"
                placeholder="Buscar proforma..."
                value={search}
                onChange={(event) => updateSearch(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {loading && (
          <div className="p-10 text-center font-medium text-slate-700">Cargando proformas...</div>
        )}

        {!loading && error && (
          <div className="p-10 text-center font-semibold text-red-700">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
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
                    <th className="px-4 py-4 text-center text-xs font-extrabold uppercase tracking-wide text-slate-700 sm:px-6">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedProformas.map((proforma) => {
                    const statusMeta = getProformaStatusMeta(proforma.estado);

                    return (
                      <tr
                        key={proforma.id || proforma.numero}
                        className={`animate-fade-in border-l-2 border-l-transparent bg-white transition-colors hover:bg-slate-50 ${statusMeta.hoverBorder}`}
                      >
                        <td className="px-4 py-4 sm:px-6">
                          <button
                            type="button"
                            onClick={() => navigate(`/proformas/${proforma.numero}/editar`)}
                            className="font-bold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                          >
                            #{proforma.numero || "Sin número"}
                          </button>
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <p className="font-bold text-slate-900">
                            {proforma?.cliente?.nombre || "Sin cliente"}
                          </p>
                          <p className="mt-1 text-xs font-medium text-slate-600">
                            {proforma?.cliente?.ruc || "Sin RUC"}
                          </p>
                        </td>
                        <td className="hidden px-4 py-4 font-medium text-slate-700 sm:px-6 md:table-cell">
                          {proforma.fecha
                            ? new Date(proforma.fecha).toLocaleDateString("es-EC")
                            : "Sin fecha"}
                        </td>
                        <td className="w-[160px] px-4 py-4 sm:px-6">
                          <div className="flex items-center gap-2">
                            <ProformaStatusDropdown
                              status={proforma.estado}
                              disabled={updatingStatusNumber === proforma.numero}
                              onSelect={(status) => handleStatusChange(proforma, status)}
                            />
                            {statusMeta.reversible && (
                              <span
                                title="Estado reversible: puede volver a aprobarse o editarse"
                                className="text-slate-400"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                >
                                  <path d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                                </svg>
                              </span>
                            )}
                          </div>
                          {(proforma.estado === "CANCELADA" || proforma.estado === "EXPIRADA") && (
                            <p className="mt-1 text-[10px] text-slate-400">
                              {statusMeta.label === "CANCELADA" ? "Cancelada" : "Expirada"} por el
                              cliente · reversible
                            </p>
                          )}
                          {updatingStatusNumber === proforma.numero && (
                            <p className="mt-1 text-[10px] font-medium text-slate-500">
                              Guardando...
                            </p>
                          )}
                        </td>
                        <td className="hidden px-4 py-4 text-right font-extrabold text-slate-900 sm:table-cell sm:px-6">
                          {formatCurrency(toDisplayCents(proforma.total))}
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <ProformaRowActions
                            numero={proforma.numero}
                            status={proforma.estado}
                            pendingPdf={generatingPdfNumber === proforma.numero}
                            deleting={deletingNumber === proforma.numero}
                            duplicating={duplicatingNumber === proforma.numero}
                            onView={() => setDetailProforma(proforma)}
                            onEdit={() => navigate(`/proformas/${proforma.numero}/editar`)}
                            onDuplicate={() => handleDuplicate(proforma)}
                            onDownloadPdf={() => handleGeneratePdf(proforma)}
                            onDelete={() => handleDelete(proforma)}
                            onChangeStatus={(status) => handleStatusChange(proforma, status)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                  {sortedProformas.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center">
                        <EmptyState
                          icon={<Inbox className="h-10 w-10 text-slate-300" aria-hidden="true" />}
                          title="No hay proformas"
                          description={
                            search ? "Intenta con otra búsqueda." : "Crea tu primera proforma para comenzar."
                          }
                          action={
                            !search ? (
                              <button
                                type="button"
                                onClick={() => navigate("/proformas/nueva")}
                                className="rounded-lg bg-blue-500 px-6 py-2 font-bold text-white transition-colors hover:bg-blue-600"
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

            <div className="flex flex-col gap-4 border-t border-slate-200 bg-white p-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <p className="font-medium text-slate-700">
                Mostrando {proformas.length} de {total} proformas · Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      <ProformaDetailModal
        isOpen={Boolean(detailProforma)}
        proforma={detailProforma}
        onClose={() => setDetailProforma(null)}
      />
    </div>
  );
}
