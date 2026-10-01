import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({
  icon = <Inbox className="h-10 w-10 text-slate-300" aria-hidden="true" />,
  title,
  description,
  action = null,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-950">
        {icon}
      </div>

      <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>

      {description && <p className="mb-6 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>}

      {action}
    </div>
  );
}
