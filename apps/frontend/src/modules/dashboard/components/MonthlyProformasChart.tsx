import { useMemo, useState } from "react";
import type { MonthlyStatsRow } from "@/modules/proformas/services/proformaService";
import { formatCurrency } from "@/modules/common/utils/monetary";

const monthFormatter = new Intl.DateTimeFormat("es-EC", { month: "short" });
const monthFormatterFull = new Intl.DateTimeFormat("es-EC", { month: "long", year: "numeric" });

function labelFor(mes: string): string {
  const [year, month] = mes.split("-").map(Number);
  return monthFormatter.format(new Date(year, month - 1, 1)).replace(".", "");
}

function fullLabelFor(mes: string): string {
  const [year, month] = mes.split("-").map(Number);
  return monthFormatterFull.format(new Date(year, month - 1, 1));
}

const toCents = (value: unknown) => Math.round(Number(value || 0) * 100);

export interface MonthlyProformasChartProps {
  rows: MonthlyStatsRow[];
}

export default function MonthlyProformasChart({ rows }: MonthlyProformasChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { max, totals } = useMemo(() => {
    const maxValue = Math.max(
      ...rows.flatMap((row) => [row.aceptadas.monto, row.enviadas.monto]),
      1
    );
    const totals = rows.reduce(
      (acc, row) => ({
        aceptadasMonto: acc.aceptadasMonto + Number(row.aceptadas.monto || 0),
        aceptadasCount: acc.aceptadasCount + row.aceptadas.count,
        enviadasMonto: acc.enviadasMonto + Number(row.enviadas.monto || 0),
        enviadasCount: acc.enviadasCount + row.enviadas.count,
      }),
      { aceptadasMonto: 0, aceptadasCount: 0, enviadasMonto: 0, enviadasCount: 0 }
    );
    return { max: maxValue, totals };
  }, [rows]);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-slate-400"
            aria-hidden="true"
          >
            <path d="M3 3v18h18M7 16l4-4 4 4 6-6" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Sin datos para el período seleccionado
        </p>
      </div>
    );
  }

  const totalMonto = totals.aceptadasMonto + totals.enviadasMonto;
  const pctAceptadas =
    totalMonto > 0 ? Math.round((totals.aceptadasMonto / totalMonto) * 100) : 0;

  return (
    <div>
      {/* Encabezado con leyenda + resumen */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" aria-hidden="true" />
            Enviadas
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              ({totals.enviadasCount})
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" aria-hidden="true" />
            Aceptadas
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              ({totals.aceptadasCount})
            </span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-baseline gap-1.5">
            <span className="font-medium text-slate-500 dark:text-slate-400">Aceptado:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(toCents(totals.aceptadasMonto))}
            </span>
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
              {pctAceptadas}%
            </span>
          </div>
        </div>
      </div>

      {/* Grid + barras */}
      <div className="relative">
        {/* Líneas guía horizontales */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="border-t border-dashed border-slate-200 dark:border-slate-800"
            />
          ))}
        </div>

        {/* Barras */}
        <div className="relative flex items-end justify-between gap-2 sm:gap-3">
          {rows.map((row, index) => {
            const isHovered = hoveredIndex === index;
            const enviadasHeight =
              row.enviadas.count > 0 && row.enviadas.monto > 0
                ? Math.max((row.enviadas.monto / max) * 100, 4)
                : 0;
            const aceptadasHeight =
              row.aceptadas.count > 0 && row.aceptadas.monto > 0
                ? Math.max((row.aceptadas.monto / max) * 100, 4)
                : 0;
            const isEmpty = enviadasHeight === 0 && aceptadasHeight === 0;

            return (
              <div
                key={row.mes}
                className="group flex min-w-0 flex-1 flex-col items-center gap-2"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Contenedor de barras con altura fija */}
                <div className="relative flex h-40 w-full items-end justify-center gap-1.5">
                  {/* Tooltip flotante */}
                  {isHovered && !isEmpty && (
                    <div className="pointer-events-none absolute -top-2 left-1/2 z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-900">
                      <p className="mb-1.5 font-bold capitalize text-slate-900 dark:text-slate-100">
                        {fullLabelFor(row.mes)}
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            <span className="h-2 w-2 rounded-sm bg-amber-400" />
                            Enviadas
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(toCents(row.enviadas.monto))}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            <span className="h-2 w-2 rounded-sm bg-emerald-500" />
                            Aceptadas
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(toCents(row.aceptadas.monto))}
                          </span>
                        </div>
                      </div>
                      <div className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 border-b border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900" />
                    </div>
                  )}

                  {/* Barra Enviadas */}
                  <div
                    className={`w-4 rounded-t-md bg-amber-400 transition-all duration-300 dark:bg-amber-500 ${
                      isHovered ? "ring-2 ring-amber-400/40 ring-offset-1 dark:ring-offset-slate-900" : ""
                    }`}
                    style={{ height: `${enviadasHeight}%` }}
                    role="img"
                    aria-label={`Enviadas ${fullLabelFor(row.mes)}: ${formatCurrency(toCents(row.enviadas.monto))}, ${row.enviadas.count} proformas`}
                  />

                  {/* Barra Aceptadas */}
                  <div
                    className={`w-4 rounded-t-md bg-emerald-500 transition-all duration-300 ${
                      isHovered
                        ? "ring-2 ring-emerald-500/40 ring-offset-1 dark:ring-offset-slate-900"
                        : ""
                    }`}
                    style={{ height: `${aceptadasHeight}%` }}
                    role="img"
                    aria-label={`Aceptadas ${fullLabelFor(row.mes)}: ${formatCurrency(toCents(row.aceptadas.monto))}, ${row.aceptadas.count} proformas`}
                  />

                  {/* Indicador de mes vacío */}
                  {isEmpty && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] text-slate-300 dark:text-slate-600">
                      —
                    </div>
                  )}
                </div>

                {/* Etiqueta del mes */}
                <span
                  className={`text-[11px] font-medium capitalize transition-colors ${
                    isHovered
                      ? "text-slate-900 dark:text-slate-100"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {labelFor(row.mes)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leyenda inferior con valores máximos */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-400 dark:border-slate-800">
        <span>Máximo: {formatCurrency(toCents(max))}</span>
        <span>Total: {formatCurrency(toCents(totalMonto))}</span>
      </div>
    </div>
  );
}