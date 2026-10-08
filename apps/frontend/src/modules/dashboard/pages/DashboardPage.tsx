import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Banknote,
  CheckCircle2,
  FileText,
  Package,
  Target,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import SummaryCard from "@/components/common/SummaryCard";
import Card from "@/components/common/Card";
import ProformaStatusBadge from "@/modules/proformas/components/ProformaStatusBadge";
import { useProformaStats } from "@/modules/proformas/hooks/useProformaStats";
import { buildFunnelRows } from "@/modules/dashboard/utils/statsLabels";
import MonthlyProformasChart from "@/modules/dashboard/components/MonthlyProformasChart";
import { formatCurrency } from "@/modules/common/utils/monetary";
import {
  getMonthlyStats,
  listProformas,
  type MonthlyStatsRow,
  type ProformaDto,
} from "@/modules/proformas/services/proformaService";
import { getClients } from "@/modules/clientes/services/clientService";
import { getProducts } from "@/modules/productos/services/productService";
import { getMaintenances } from "@/modules/mantenimientos/services/maintenanceService";

const toCents = (value: unknown) => Math.round(Number(value || 0) * 100);

export default function DashboardPage() {
  const navigate = useNavigate();
  const { stats, loading: statsLoading } = useProformaStats();
  const [proformas, setProformas] = useState<ProformaDto[]>([]);
  const [monthly, setMonthly] = useState<MonthlyStatsRow[]>([]);
  const [counts, setCounts] = useState({ clients: 0, products: 0, maintenances: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [proformasPage, clients, products, maintenances, monthlyStats] =
          await Promise.all([
            listProformas({ pageSize: 5 }),
            getClients({ pageSize: 200 }),
            getProducts({ pageSize: 200 }),
            getMaintenances(),
            getMonthlyStats(6),
          ]);

        if (!active) return;

        setProformas(proformasPage.data);
        setMonthly(monthlyStats);
        setCounts({
          clients: clients.length,
          products: products.length,
          maintenances: maintenances.length,
        });
      } catch {
        if (active) setError("No fue posible cargar el resumen. Intenta nuevamente.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const funnelRows = buildFunnelRows(stats);
  const maxFunnelMonto = Math.max(...funnelRows.map((row) => row.monto), 1);

  if (loading || statsLoading) {
    return (
      <div className="w-full space-y-6">
        <PageHeader title="Dashboard" description="Resumen general de UNYX Workspace" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <PageHeader title="Dashboard" description="Resumen general de UNYX Workspace" />

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Monto aceptado"
          value={formatCurrency(toCents(stats.aceptadas.monto))}
          hint={`${stats.aceptadas.count} proformas aceptadas`}
          icon={<Banknote className="h-4 w-4" aria-hidden="true" />}
          color="green"
        />
        <SummaryCard
          title="Pipeline (enviadas)"
          value={formatCurrency(toCents(stats.enviadas.monto))}
          hint={`${stats.enviadas.count} en espera de decisión`}
          icon={<FileText className="h-4 w-4" aria-hidden="true" />}
          color="orange"
        />
        <SummaryCard
          title="Tasa de aceptación"
          value={`${stats.tasaAceptacion}%`}
          hint={`${stats.aceptadas.count} de ${stats.emitidas} emitidas`}
          icon={<Target className="h-4 w-4" aria-hidden="true" />}
          color="blue"
        />
        <SummaryCard
          title="Ticket promedio"
          value={formatCurrency(toCents(stats.ticketPromedio))}
          hint="calculado sobre aceptadas"
          icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
          color="blue"
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card hover={false} className="p-5">
            <h2 className="mb-1 font-display text-base font-bold text-slate-900 dark:text-slate-100">
              Evolución mensual
            </h2>
            <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
              Montos por mes (últimos 6 meses) — enviadas vs aceptadas
            </p>
            <MonthlyProformasChart rows={monthly} />
          </Card>

          <Card hover={false}>
            <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                Últimas proformas
              </h2>
              <button
                type="button"
                onClick={() => navigate("/proformas")}
                className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400"
              >
                Ver todas
              </button>
            </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {proformas.map((proforma) => (
              <button
                key={proforma.id}
                type="button"
                onClick={() => navigate(`/proformas/${proforma.numero}/editar`)}
                className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    #{proforma.numero}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {proforma.cliente?.nombre || "Sin cliente"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <ProformaStatusBadge status={proforma.estado} showIcon={false} />
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(toCents(proforma.total))}
                  </span>
                </div>
              </button>
            ))}

            {proformas.length === 0 && (
              <p className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Todavía no hay proformas registradas.
              </p>
            )}
          </div>
        </Card>
        </div>

        <div className="space-y-6">
          <Card hover={false} className="p-5">
            <h2 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-slate-900 dark:text-slate-100">
              <TrendingUp className="h-4 w-4 text-blue-500" aria-hidden="true" />
              Embudo de proformas
            </h2>

            <div className="space-y-3">
              {funnelRows.map((row) => (
                <div key={row.estado}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      <span className={`h-1.5 w-1.5 rounded-full ${row.dot}`} aria-hidden="true" />
                      {row.label}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {row.count} · {formatCurrency(toCents(row.monto))}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${row.dot}`}
                      style={{ width: `${Math.max((row.monto / maxFunnelMonto) * 100, row.count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card hover={false} className="p-5">
            <h2 className="mb-4 font-display text-base font-bold text-slate-900 dark:text-slate-100">
              Resumen general
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Users className="h-4 w-4 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                  Clientes
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {counts.clients}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Package className="h-4 w-4 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                  Productos
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {counts.products}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Wrench className="h-4 w-4 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                  Mantenimientos
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {counts.maintenances}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
