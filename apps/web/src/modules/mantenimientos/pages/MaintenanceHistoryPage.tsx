import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import PageHeader from "@/components/common/PageHeader";
import ActionButton from "@/components/common/ActionButton";
import { useToast } from "@/hooks/useToast";
import { formatDate, getDateTimestamp } from "@/modules/common/utils/dateHelpers";
import { getMaintenanceStatusMeta } from "@/modules/common/utils/statusMap";

import { getMaintenances, type MaintenanceRecord } from "@/modules/mantenimientos/services/maintenanceService";
import { generateMaintenancePdf } from "@/modules/mantenimientos/utils/generateMaintenancePdf";

type SortKey = "numero" | "fecha" | "cliente" | "equipo" | "serie" | "estado";

function getMaintenanceNumber(value: unknown): number {
  const numbers = String(value || "").match(/\d+/g);
  if (!numbers) return 0;
  return Number(numbers.join("")) || 0;
}

function getSortValue(maintenance: MaintenanceRecord, key: SortKey): string | number {
  switch (key) {
    case "numero":
      return getMaintenanceNumber(maintenance?.numero);

    case "fecha":
      return getDateTimestamp(maintenance?.fecha);

    case "cliente":
      return String(
        (maintenance?.cliente as { nombre?: unknown } | undefined)?.nombre || ""
      )
        .trim()
        .toLowerCase();

    case "equipo":
      return [
        (maintenance?.equipo as { marca?: unknown } | undefined)?.marca,
        (maintenance?.equipo as { modelo?: unknown } | undefined)?.modelo,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    case "serie":
      return String(
        (maintenance?.equipo as { numeroSerie?: unknown } | undefined)?.numeroSerie || ""
      )
        .trim()
        .toLowerCase();

    case "estado":
      return String(maintenance?.estado || "").trim().toLowerCase();

    default:
      return "";
  }
}

export default function MaintenanceHistoryPage() {
  const navigate = useNavigate();
  const { showError } = useToast();

  const [maintenances, setMaintenances] = useState<MaintenanceRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatingPdfNumber, setGeneratingPdfNumber] = useState<string | null>(null);

  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" }>({
    key: "numero",
    direction: "desc",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadMaintenances() {
      try {
        setLoading(true);
        setError("");

        const data = await getMaintenances();

        if (isMounted) {
          setMaintenances(Array.isArray(data) ? data : []);
        }
      } catch (loadError) {
        console.error("Error cargando mantenimientos:", loadError);

        if (isMounted) {
          setError("No fue posible cargar el historial de mantenimientos.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadMaintenances();

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredMaintenances = useMemo(() => {
    if (!normalizedSearch) {
      return maintenances;
    }

    return maintenances.filter((maintenance) => {
      const searchableContent = [
        maintenance?.numero,
        maintenance?.fecha,
        (maintenance?.cliente as { nombre?: unknown } | undefined)?.nombre,
        (maintenance?.cliente as { ruc?: unknown } | undefined)?.ruc,
        (maintenance?.equipo as { tipo?: unknown } | undefined)?.tipo,
        (maintenance?.equipo as { marca?: unknown } | undefined)?.marca,
        (maintenance?.equipo as { modelo?: unknown } | undefined)?.modelo,
        (maintenance?.equipo as { numeroSerie?: unknown } | undefined)?.numeroSerie,
        maintenance?.estado,
        maintenance?.tecnicoResponsable,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableContent.includes(normalizedSearch);
    });
  }, [maintenances, normalizedSearch]);

  const sortedMaintenances = useMemo(() => {
    return [...filteredMaintenances].sort((firstMaintenance, secondMaintenance) => {
      const firstValue = getSortValue(firstMaintenance, sortConfig.key);
      const secondValue = getSortValue(secondMaintenance, sortConfig.key);

      let comparison: number;

      if (typeof firstValue === "number" && typeof secondValue === "number") {
        comparison = firstValue - secondValue;
      } else {
        comparison = String(firstValue).localeCompare(String(secondValue), "es", {
          numeric: true,
          sensitivity: "base",
        });
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredMaintenances, sortConfig]);

  function handleSort(key: SortKey) {
    setSortConfig((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key,
        direction: key === "numero" ? "desc" : "asc",
      };
    });
  }

  function sortIndicator(key: SortKey) {
    if (sortConfig.key !== key) {
      return (
        <span className="!text-[#7b8494]" aria-hidden="true">
          ↕
        </span>
      );
    }

    return (
      <span className="!text-[#174a8b]" aria-hidden="true">
        {sortConfig.direction === "asc" ? "↑" : "↓"}
      </span>
    );
  }

  function handleEdit(maintenance: MaintenanceRecord) {
    navigate("/mantenimientos/nuevo", {
      state: {
        selectedMaintenanceNumber: maintenance.numero,
      },
    });
  }

  async function handleGeneratePdf(maintenance: MaintenanceRecord) {
    try {
      setGeneratingPdfNumber(maintenance.numero);
      await generateMaintenancePdf(maintenance);
    } catch (pdfError) {
      console.error("Error generando informe de mantenimiento:", pdfError);

      showError(
        `No fue posible generar el informe PDF: ${
          pdfError instanceof Error ? pdfError.message : "Error desconocido"
        }`
      );
    } finally {
      setGeneratingPdfNumber(null);
    }
  }

  const headerButtonClass = `
    flex w-full items-center gap-2 text-left
    text-xs font-extrabold uppercase tracking-wide
    !text-[#26364d] transition-colors
    hover:!text-[#174a8b]
  `;

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Historial de Mantenimientos"
        description="Consulta los equipos revisados y vuelve a generar sus informes técnicos."
        actions={
          <Link to="/mantenimientos/nuevo">
            <ActionButton label="Nuevo mantenimiento" />
          </Link>
        }
      />

      <div className="rounded-xl border border-[#c7c6cb] bg-white p-5 shadow-sm">
        <label className="block">
          <span className="sr-only">Buscar mantenimiento</span>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por número, cliente, RUC, marca, modelo o serie"
            className="
              w-full rounded-lg border border-[#aebbd0]
              bg-white px-4 py-3 !text-[#111827]
              placeholder:!text-[#6b7280] outline-none
              transition-all focus:border-[#2170e4]
              focus:ring-2 focus:ring-[#2170e4]
            "
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#c7c6cb] bg-white shadow-sm">
        {loading && (
          <div className="p-10 text-center">
            <p className="font-semibold !text-[#4b5563]">
              Cargando mantenimientos...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="p-10 text-center">
            <p className="font-semibold !text-[#b42318]">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#b7c3d7] bg-[#e7effd]">
                    <th className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => handleSort("numero")}
                        className={headerButtonClass}
                      >
                        Informe
                        {sortIndicator("numero")}
                      </button>
                    </th>

                    <th className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => handleSort("fecha")}
                        className={headerButtonClass}
                      >
                        Fecha
                        {sortIndicator("fecha")}
                      </button>
                    </th>

                    <th className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => handleSort("cliente")}
                        className={headerButtonClass}
                      >
                        Cliente
                        {sortIndicator("cliente")}
                      </button>
                    </th>

                    <th className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => handleSort("equipo")}
                        className={headerButtonClass}
                      >
                        Equipo
                        {sortIndicator("equipo")}
                      </button>
                    </th>

                    <th className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => handleSort("serie")}
                        className={headerButtonClass}
                      >
                        Serie
                        {sortIndicator("serie")}
                      </button>
                    </th>

                    <th className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => handleSort("estado")}
                        className={headerButtonClass}
                      >
                        Estado
                        {sortIndicator("estado")}
                      </button>
                    </th>

                    <th className="px-4 py-4 text-center text-xs font-extrabold uppercase tracking-wide !text-[#26364d]">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#d1d8e3]">
                  {sortedMaintenances.map((maintenance) => (
                    <tr
                      key={maintenance.id || maintenance.numero}
                      className="transition-colors hover:bg-[#f3f7ff]"
                    >
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => handleEdit(maintenance)}
                          className="font-mono font-extrabold !text-[#145dbf] hover:underline"
                        >
                          {maintenance.numero || "Sin número"}
                        </button>
                      </td>

                      <td className="px-4 py-4 font-medium !text-[#374151]">
                        {formatDate(maintenance.fecha, "Sin fecha")}
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-bold !text-[#111827]">
                          {String(
                            (maintenance?.cliente as { nombre?: unknown } | undefined)
                              ?.nombre || "Sin cliente"
                          )}
                        </p>

                        <p className="mt-1 text-xs !text-[#4b5563]">
                          {String(
                            (maintenance?.cliente as { ruc?: unknown } | undefined)?.ruc ||
                              "Sin identificación"
                          )}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-bold !text-[#111827]">
                          {[
                            (maintenance?.equipo as { marca?: unknown } | undefined)?.marca,
                            (maintenance?.equipo as { modelo?: unknown } | undefined)?.modelo,
                          ]
                            .filter(Boolean)
                            .join(" ") || "Sin información"}
                        </p>

                        <p className="mt-1 text-xs !text-[#4b5563]">
                          {String(
                            (maintenance?.equipo as { tipo?: unknown } | undefined)?.tipo ||
                              "Equipo"
                          )}
                        </p>
                      </td>

                      <td className="px-4 py-4 font-medium !text-[#374151]">
                        {String(
                          (maintenance?.equipo as { numeroSerie?: unknown } | undefined)
                            ?.numeroSerie || "Sin serie"
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                            getMaintenanceStatusMeta(String(maintenance.estado || "")).badge
                          }`}
                        >
                          {getMaintenanceStatusMeta(String(maintenance.estado || "")).label}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(maintenance)}
                            className="
                              rounded-lg border border-[#aebbd0]
                              bg-white px-3 py-2 font-semibold
                              !text-[#26364d] transition-colors
                              hover:bg-[#eff4ff]
                            "
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            disabled={generatingPdfNumber === maintenance.numero}
                            onClick={() => handleGeneratePdf(maintenance)}
                            className="
                              rounded-lg bg-[#2170e4]
                              px-3 py-2 font-semibold text-white
                              transition-colors hover:bg-[#0058be]
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                          >
                            {generatingPdfNumber === maintenance.numero
                              ? "Generando..."
                              : "PDF"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sortedMaintenances.length === 0 && (
              <div className="p-10 text-center">
                <p className="font-semibold !text-[#374151]">
                  {normalizedSearch
                    ? "No se encontraron mantenimientos con esa búsqueda."
                    : "Todavía no existen mantenimientos registrados."}
                </p>
              </div>
            )}

            <div className="border-t border-[#d1d8e3] bg-white px-5 py-4">
              <p className="text-sm font-medium !text-[#4b5563]">
                Mostrando{" "}
                <span className="font-extrabold !text-[#111827]">
                  {sortedMaintenances.length}
                </span>{" "}
                de{" "}
                <span className="font-extrabold !text-[#111827]">
                  {maintenances.length}
                </span>{" "}
                mantenimientos
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
