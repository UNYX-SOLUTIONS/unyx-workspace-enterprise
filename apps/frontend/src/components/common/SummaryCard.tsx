import type { ReactNode } from "react";

const colorClasses: Record<string, { icon: string; trendUp: string; trendDown: string }> = {
  blue: { icon: "bg-blue-50 text-blue-600", trendUp: "text-emerald-600", trendDown: "text-rose-600" },
  green: { icon: "bg-emerald-50 text-emerald-600", trendUp: "text-emerald-600", trendDown: "text-rose-600" },
  orange: { icon: "bg-amber-50 text-amber-600", trendUp: "text-emerald-600", trendDown: "text-rose-600" },
  red: { icon: "bg-rose-50 text-rose-600", trendUp: "text-emerald-600", trendDown: "text-rose-600" },
};

export interface SummaryCardProps {
  title?: ReactNode;
  value?: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  trend?: number;
  color?: keyof typeof colorClasses;
  className?: string;
}

export default function SummaryCard({
  title,
  value,
  hint,
  icon,
  trend,
  color = "blue",
  className = "",
}: SummaryCardProps) {
  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-shadow hover:shadow-sm ${className}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </p>

        {icon && (
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${selectedColor.icon}`}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-baseline gap-2">
        <p className="wrap-break-word text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          {value}
        </p>

        {typeof trend === "number" && (
          <span
            className={`text-xs font-semibold ${
              trend >= 0 ? selectedColor.trendUp : selectedColor.trendDown
            }`}
          >
            {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>

      {hint && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
    </div>
  );
}
