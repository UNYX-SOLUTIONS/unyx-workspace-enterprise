import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ActionButton,
  Card,
  EmptyState,
  LoadingSpinner,
  PageHeader,
  StatusBadge,
  SummaryCard,
} from "../../../components/common";

import { getProformas } from "../services/proformaService";
import { generatePdf } from "../utils/generatePdf";

function getDateTimestamp(dateValue) {
  if (!dateValue) return 0;

  if (typeof dateValue?.toDate === "function") {
    return dateValue.toDate().getTime();
  }

  if (dateValue?.seconds) {
    return dateValue.seconds * 1000;
  }

  const timestamp = new Date(dateValue).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getQuotationNumber(value) {
  const matches = String(value || "").match(/\d+/g);

  if (!matches) return 0;

  return Number(matches.join("")) || 0;
}

function getSortValue(proforma, key) {
  switch (key) {
    case "numero":
      return getQuotationNumber(proforma?.numero);

    case "cliente":
      return String(proforma?.cliente?.nombre || "")
        .trim()
        .toLowerCase();

    case "fecha":
      return getDateTimestamp(proforma?.fecha);

    case "estado":
      return String(proforma?.estado || "")
        .trim()
        .toLowerCase();

    case "total":
      return Number(proforma?.total || 0);

    default:
      return "";
  }
}

export default function ProformaHistoryPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [proformas, setProformas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingPdfNumber, setGeneratingPdfNumber] = useState(null);

  const [sortConfig, setSortConfig] = useState({
    key: "numero",
    direction: "desc",
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchProformas() {
      try {
        setLoading(true);

        const data = await getProformas();

        if (isMounted) {
          setProformas(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error al cargar proformas:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProformas();

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredProformas = useMemo(() => {
    if (!normalizedSearch) return proformas;

    return proformas.filter((proforma) => {
      const numero = String(proforma?.numero || "").toLowerCase();
      const cliente = String(
        proforma?.cliente?.nombre || ""
      ).toLowerCase();
      const ruc = String(proforma?.cliente?.ruc || "").toLowerCase();
      const estado = String(proforma?.estado || "").toLowerCase();

      return (
        numero.includes(normalizedSearch) ||
        cliente.includes(normalizedSearch) ||
        ruc.includes(normalizedSearch) ||
        estado.includes(normalizedSearch)
      );
    });
  }, [proformas, normalizedSearch]);

  const sortedProformas = useMemo(() => {
    return [...filteredProformas].sort((first, second) => {
      const firstValue = getSortValue(first, sortConfig.key);
      const secondValue = getSortValue(second, sortConfig.key);

      let comparison;

      if (
        typeof firstValue === "number" &&
        typeof secondValue === "number"
      ) {
        comparison = firstValue - secondValue;
      } else {
        comparison = String(firstValue).localeCompare(
          String(secondValue),
          "es",
          {
            numeric: true,
            sensitivity: "base",
          }
        );
      }

      return sortConfig.direction === "asc"
        ? comparison
        : -comparison;
    });
  }, [filteredProformas, sortConfig]);

  const summary = useMemo(() => {
    const total = proformas.reduce(
      (accumulator, proforma) =>
        accumulator + Number(proforma?.total || 0),
      0
    );

    const accepted = proformas.filter(
      (proforma) =>
        String(proforma?.estado || "").trim().toLowerCase() ===
        "aceptada"
    ).length;

    const drafts = proformas.filter(
      (proforma) =>
        String(proforma?.estado || "").trim().toLowerCase() ===
        "borrador"
    ).length;

    return {
      total,
      accepted,
      drafts,
      average: proformas.length > 0 ? total / proformas.length : 0,
    };
  }, [proformas]);

  function formatDate(dateValue) {
    if (!dateValue) return "Sin fecha";

    let date;

    if (typeof dateValue?.toDate === "function") {
      date = dateValue.toDate();
    } else if (dateValue?.seconds) {
      date = new Date(dateValue.seconds * 1000);
    } else {
      date = new Date(dateValue);
    }

    if (Number.isNaN(date.getTime())) {
      return "Fecha inválida";
    }

    return date.toLocaleDateString("es-EC");
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(Number(value || 0));
  }

  function handleSort(key) {
    setSortConfig((current) => {
      if (current.key === key) {
        return {
          key,
          direction:
            current.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key,
        direction: key === "numero" ? "desc" : "asc",
      };
    });
  }

  function sortIndicator(key) {
    if (sortConfig.key !== key) {
      return (
        <span
          className="text-sm font-bold text-[#7b8494]"
          aria-hidden="true"
        >
          ↕
        </span>
      );
    }

    return (
      <span
        className="text-sm font-bold text-[#174a8b]"
        aria-hidden="true"
      >
        {sortConfig.direction === "asc" ? "↑" : "↓"}
      </span>
    );
  }

  function getSortLabel(key) {
    if (sortConfig.key !== key) {
      return "sin ordenar";
    }

    return sortConfig.direction === "asc"
      ? "orden ascendente"
      : "orden descendente";
  }

  async function handleGeneratePdf(proforma) {
    try {
      setGeneratingPdfNumber(proforma.numero);
      await generatePdf(proforma);
    } catch (error) {
      console.error("Error al generar el PDF:", error);

      window.alert(
        `Error al generar el PDF:\n${
          error?.message || "Error desconocido"
        }`
      );
    } finally {
      setGeneratingPdfNumber(null);
    }
  }

  const sortableHeaderClass =
    "group flex w-full items-center gap-2 text-left text-xs " +
    "font-extrabold uppercase tracking-wide text-[#26364d] " +
    "transition-colors hover:text-[#174a8b] focus:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-[#2170e4]";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" />

        <p className="mt-4 font-medium text-[#374151]">
          Cargando proformas...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Historial de Proformas"
        subtitle="Consulta, revisa y gestiona las proformas emitidas."
        action={
          <button
            type="button"
            onClick={() => navigate("/proformas/nueva")}
            className="
              flex items-center gap-2 whitespace-nowrap rounded-lg
              bg-gradient-to-r from-[#2170e4] to-[#0058be]
              px-6 py-3 font-bold text-white transition-all
              hover:scale-105 hover:shadow-lg
            "
          >
            + Nueva Proforma
          </button>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Histórico"
          value={formatCurrency(summary.total)}
          icon="💵"
          color="blue"
        />

        <SummaryCard
          title="Aceptadas"
          value={summary.accepted}
          icon="✅"
          color="green"
        />

        <SummaryCard
          title="Borradores"
          value={summary.drafts}
          icon="📝"
          color="orange"
        />

        <SummaryCard
          title="Ticket Promedio"
          value={formatCurrency(summary.average)}
          icon="🎯"
          color="green"
        />
      </section>

      <Card className="overflow-hidden">
        <div className="space-y-4 border-b border-[#b7c3d7] bg-gradient-to-r from-[#eff4ff] to-[#dce9ff] p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="
                  rounded-lg border border-[#aebbd0] bg-white
                  px-4 py-2 text-sm font-semibold text-[#26364d]
                  transition-colors hover:bg-[#e5eeff]
                "
              >
                🔍 Filtrar
              </button>

              <button
                type="button"
                className="
                  rounded-lg border border-[#aebbd0] bg-white
                  px-4 py-2 text-sm font-semibold text-[#26364d]
                  transition-colors hover:bg-[#e5eeff]
                "
              >
                📥 Exportar
              </button>
            </div>

            <label className="w-full sm:max-w-xs">
              <span className="sr-only">
                Buscar proforma
              </span>

              <input
                type="search"
                placeholder="Buscar proforma..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="
                  w-full rounded-lg border border-[#aebbd0]
                  bg-white px-4 py-2 text-[#111827]
                  placeholder:text-[#6b7280] outline-none
                  transition-all focus:border-[#2170e4]
                  focus:ring-2 focus:ring-[#2170e4]
                "
              />
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#b7c3d7] bg-[#e7effd]">
                <th
                  scope="col"
                  aria-sort={
                    sortConfig.key === "numero"
                      ? sortConfig.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className="px-4 py-4 sm:px-6"
                >
                  <button
                    type="button"
                    onClick={() => handleSort("numero")}
                    className={sortableHeaderClass}
                    title={`Número: ${getSortLabel("numero")}`}
                  >
                    <span>Número</span>
                    {sortIndicator("numero")}
                  </button>
                </th>

                <th
                  scope="col"
                  aria-sort={
                    sortConfig.key === "cliente"
                      ? sortConfig.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className="px-4 py-4 sm:px-6"
                >
                  <button
                    type="button"
                    onClick={() => handleSort("cliente")}
                    className={sortableHeaderClass}
                    title={`Cliente: ${getSortLabel("cliente")}`}
                  >
                    <span>Cliente</span>
                    {sortIndicator("cliente")}
                  </button>
                </th>

                <th
                  scope="col"
                  aria-sort={
                    sortConfig.key === "fecha"
                      ? sortConfig.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className="hidden px-4 py-4 sm:px-6 md:table-cell"
                >
                  <button
                    type="button"
                    onClick={() => handleSort("fecha")}
                    className={sortableHeaderClass}
                    title={`Fecha: ${getSortLabel("fecha")}`}
                  >
                    <span>Fecha</span>
                    {sortIndicator("fecha")}
                  </button>
                </th>

                <th
                  scope="col"
                  aria-sort={
                    sortConfig.key === "estado"
                      ? sortConfig.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className="px-4 py-4 sm:px-6"
                >
                  <button
                    type="button"
                    onClick={() => handleSort("estado")}
                    className={sortableHeaderClass}
                    title={`Estado: ${getSortLabel("estado")}`}
                  >
                    <span>Estado</span>
                    {sortIndicator("estado")}
                  </button>
                </th>

                <th
                  scope="col"
                  aria-sort={
                    sortConfig.key === "total"
                      ? sortConfig.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className="hidden px-4 py-4 sm:table-cell sm:px-6"
                >
                  <button
                    type="button"
                    onClick={() => handleSort("total")}
                    className={`${sortableHeaderClass} justify-end`}
                    title={`Total: ${getSortLabel("total")}`}
                  >
                    <span>Total</span>
                    {sortIndicator("total")}
                  </button>
                </th>

                <th
                  scope="col"
                  className="
                    px-4 py-4 text-center text-xs font-extrabold
                    uppercase tracking-wide text-[#26364d] sm:px-6
                  "
                >
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#d1d8e3]">
              {sortedProformas.map((proforma) => (
                <tr
                  key={proforma.id || proforma.numero}
                  className="
                    group bg-white transition-colors
                    hover:bg-[#f3f7ff]
                  "
                >
                  <td className="px-4 py-4 sm:px-6">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/proformas/${proforma.numero}/editar`
                        )
                      }
                      className="
                        font-bold text-[#145dbf]
                        transition-colors hover:text-[#0b438f]
                        hover:underline
                      "
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
                    {formatDate(proforma.fecha)}
                  </td>

                  <td className="px-4 py-4 sm:px-6">
                    <StatusBadge
                      status={proforma.estado || "Emitida"}
                    />
                  </td>

                  <td className="hidden px-4 py-4 text-right font-extrabold text-[#111827] sm:table-cell sm:px-6">
                    {formatCurrency(proforma.total)}
                  </td>

                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex justify-center gap-2 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                      <ActionButton
                        label={
                          generatingPdfNumber === proforma.numero
                            ? "Generando..."
                            : "PDF"
                        }
                        variant="secondary"
                        disabled={
                          generatingPdfNumber === proforma.numero
                        }
                        onClick={() =>
                          handleGeneratePdf(proforma)
                        }
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
                        normalizedSearch
                          ? "Intenta con otra búsqueda."
                          : "Crea tu primera proforma para comenzar."
                      }
                      action={
                        !normalizedSearch ? (
                          <button
                            type="button"
                            onClick={() =>
                              navigate("/proformas/nueva")
                            }
                            className="
                              rounded-lg bg-[#2170e4]
                              px-6 py-2 font-bold text-white
                              transition-colors hover:bg-[#0058be]
                            "
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
            Mostrando{" "}
            <span className="font-extrabold text-[#111827]">
              {sortedProformas.length}
            </span>{" "}
            de{" "}
            <span className="font-extrabold text-[#111827]">
              {proformas.length}
            </span>{" "}
            proformas
          </p>

          <p className="text-xs font-medium text-[#4b5563]">
            Ordenado por{" "}
            <span className="font-bold text-[#174a8b]">
              {sortConfig.key}
            </span>{" "}
            en orden{" "}
            <span className="font-bold text-[#174a8b]">
              {sortConfig.direction === "asc"
                ? "ascendente"
                : "descendente"}
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
}