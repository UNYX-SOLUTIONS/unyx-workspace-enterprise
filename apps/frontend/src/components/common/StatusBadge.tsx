const styles: Record<string, string> = {
  Activo: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Pendiente: "border-amber-200 bg-amber-50 text-amber-700",
  Inactivo: "border-slate-200 bg-slate-100 text-slate-600",
  Conforme: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Observación: "border-amber-200 bg-amber-50 text-amber-700",
  "No aplica": "border-slate-200 bg-slate-100 text-slate-600",
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
  const style = styles[resolved] || "border-slate-200 bg-slate-100 text-slate-600";
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
