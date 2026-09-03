import PageHeader from "../../../components/common/PageHeader";

const metrics = [
  ["Proformas", "0"],
  ["Mantenimientos", "0"],
  ["Clientes", "0"],
  ["Productos", "0"],
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Resumen general de UNYX Workspace" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value]) => (
          <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
          </article>
        ))}
      </div>
    </>
  );
}
