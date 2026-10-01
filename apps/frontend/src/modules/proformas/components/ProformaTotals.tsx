import { Card } from "@/components/common";
import { IVA_RATE_PERCENT, formatCurrency, type Totals } from "@/modules/common/utils/monetary";

export interface ProformaTotalsProps {
  totals: Totals;
}

export default function ProformaTotals({ totals }: ProformaTotalsProps) {
  return (
    <Card hover={false} className="sticky top-6 p-6">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Resumen
      </p>

      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">Subtotal</span>
          <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {formatCurrency(totals.subtotalCents)}
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">IVA ({IVA_RATE_PERCENT}%)</span>
          <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {formatCurrency(totals.ivaCents)}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">
            Total
          </span>
          <span className="text-2xl font-bold tracking-tight text-blue-600">
            {formatCurrency(totals.totalCents)}
          </span>
        </div>
      </div>
    </Card>
  );
}
