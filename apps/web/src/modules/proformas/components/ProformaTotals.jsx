import { Card } from "../../../components/common";
import { IVA_RATE_PERCENT, formatCurrency } from "../utils/monetary";

export default function ProformaTotals({ totals }) {
  return (
    <Card className="sticky top-6 bg-gradient-to-br from-[#010105] to-[#1a1c24] p-6 text-white">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#3a3d48] pb-3">
          <span className="text-sm font-semibold text-[#b0b2bd]">Subtotal</span>
          <span className="text-lg font-bold">{formatCurrency(totals.subtotalCents)}</span>
        </div>
        <div className="flex items-center justify-between border-b border-[#3a3d48] pb-3">
          <span className="text-sm font-semibold text-[#b0b2bd]">
            IVA ({IVA_RATE_PERCENT}%)
          </span>
          <span className="text-lg font-bold text-[#4ade80]">
            {formatCurrency(totals.ivaCents)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t-2 border-[#2170e4] pt-2">
          <span className="text-lg font-bold">TOTAL</span>
          <span className="text-3xl font-bold text-[#2170e4]">
            {formatCurrency(totals.totalCents)}
          </span>
        </div>
      </div>
    </Card>
  );
}
