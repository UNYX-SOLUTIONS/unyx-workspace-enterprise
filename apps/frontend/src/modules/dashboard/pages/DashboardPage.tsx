import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Banknote, CheckCircle2, FileText, Package, Target, Users, Wrench } from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import SummaryCard from "@/components/common/SummaryCard";
import Card from "@/components/common/Card";
import ProformaStatusBadge from "@/modules/proformas/components/ProformaStatusBadge";
import { formatCurrency } from "@/modules/common/utils/monetary";
import { listProformas, type ProformaDto } from "@/modules/proformas/services/proformaService";
import { getClients } from "@/modules/clientes/services/clientService";
import { getProducts } from "@/modules/productos/services/productService";
import { getMaintenances } from "@/modules/mantenimientos/services/maintenanceService";

const toCents = (value: unknown) => Math.round(Number(value || 0) * 100);

export default function DashboardPage() {
  const navigate = useNavigate();
  const [proformas, setProformas] = useState<ProformaDto[]>([]);
  const [counts, setCounts] = useState({ clients: 0, products: 0, maintenances: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [proformasPage, clients, products, maintenances] = await Promise.all([
          listProformas({ pageSize: 200 }),
          getClients({ pageSize: 200 }),
          getProducts({ pageSize: 200 }),
          getMaintenances(),
        ]);

        if (!active) return;

        setProformas(proformasPage.data);
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

  const accepted = proformas.filter((proforma) => proforma.estado === "ACEPTADA").length;
  const totalAmount = proformas.reduce((sum, proforma) => sum + toCents(proforma.total), 0);
  const average = proformas.length > 0 ? Math.round(totalAmount / proformas.length) : 0;
  const recent = [...proformas].slice(0, 5);

  if (loading) {
    return (
      <div className="wrapper">
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
          title="Total facturado"
          value={formatCurrency(totalAmount)}
          icon={<Banknote className="h-4 w-4" aria-hidden="true" />}
          color="blue"
        />
        <SummaryCard
          title="Proformas"
          value={proformas.length}
          icon={<FileText className="h-4 w-4" aria-hidden="true" />}
          color="orange"
        />
        <SummaryCard
          title="Aceptadas"
          value={accepted}
          icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
          color="green"
        />
        <SummaryCard
          title="Ticket promedio"
          value={formatCurrency(average)}
          icon={<Target className="h-4 w-4" aria-hidden="true" />}
          color="red"
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card hover={false} className="lg:col-span-2">
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
            {recent.map((proforma) => (
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

            {recent.length === 0 && (
              <p className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Todavía no hay proformas registradas.
              </p>
            )}
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
  );
}
