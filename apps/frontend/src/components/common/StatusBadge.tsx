const styles: Record<string, string> = {
  Activo: "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Pendiente: "border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Inactivo: "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  Conforme: "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Observación: "border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "No aplica": "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
};

const dots: Record<string, string> = {
  Activo: "bg-emerald-500",
  Pendiente: "bg-amber-500",
  Inactivo: "bg-slate-400",
  Conforme: "bg-emerald-500",
  Observación: "bg-amber-500",
  "No aplica": "bg-slate-400",
};

export interface StatusBadgeProps {
  status?: string | null;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const resolved = status ?? "";
  const style = styles[resolved] || "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
  const dot = dots[resolved] || "bg-slate-400";

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${style} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {resolved || "Sin estado"}
    </span>
  );
}
