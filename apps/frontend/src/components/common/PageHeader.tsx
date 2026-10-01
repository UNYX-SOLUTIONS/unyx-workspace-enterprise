import type { ReactNode } from "react";

export interface PageHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  actions?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  description,
  action = null,
  actions = null,
}: PageHeaderProps) {
  const secondaryText = subtitle || description;
  const actionContent = action || actions;

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          {title}
        </h1>

        {secondaryText && <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{secondaryText}</p>}
      </div>

      {actionContent && <div className="flex-shrink-0">{actionContent}</div>}
    </div>
  );
}
