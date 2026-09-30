import { Modal } from "@/components/common";
import ProformaStatusBadge from "@/modules/proformas/components/ProformaStatusBadge";
import { formatDate } from "@/modules/common/utils/dateHelpers";
import { formatCurrency, lineTotalCents } from "@/modules/common/utils/monetary";
import type { ProformaDto } from "@/modules/proformas/services/proformaService";

export interface ProformaDetailModalProps {
  isOpen: boolean;
  proforma: ProformaDto | null;
  onClose: () => void;
}

export default function ProformaDetailModal({
  isOpen,
  proforma,
  onClose,
}: ProformaDetailModalProps) {
  if (!proforma) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Proforma ${proforma.numero}`} size="3xl">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ProformaStatusBadge status={proforma.estado} />
          <p className="text-sm text-slate-500">
            Fecha: <span className="font-semibold text-slate-700">{formatDate(proforma.fecha, "—")}</span>
            <span className="mx-2 text-slate-300">|</span>
            Validez: <span className="font-semibold text-slate-700">{proforma.validezDias} días</span>
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cliente</p>
          <p className="mt-1 font-bold text-slate-900">{proforma.cliente?.nombre || "Sin cliente"}</p>
          <p className="text-sm text-slate-600">
            {proforma.cliente?.ruc || "Sin RUC"}
            {proforma.cliente?.ciudad ? ` · ${proforma.cliente.ciudad}` : ""}
          </p>
          {proforma.cliente?.direccion && (
            <p className="text-sm text-slate-500">{proforma.cliente.direccion}</p>
          )}
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Código</th>
                <th className="px-3 py-2">Descripción</th>
                <th className="px-3 py-2">Marca</th>
                <th className="px-3 py-2 text-right">Cant.</th>
                <th className="px-3 py-2 text-right">Precio</th>
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {proforma.items.map((item) => (
                <tr key={item.id} className="text-slate-700">
                  <td className="px-3 py-2 font-mono text-xs">{item.codigo || "—"}</td>
                  <td className="px-3 py-2">{item.descripcion}</td>
                  <td className="px-3 py-2">{item.marca || "—"}</td>
                  <td className="px-3 py-2 text-right">{Number(item.cantidad)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(Math.round(Number(item.precio) * 100))}</td>
                  <td className="px-3 py-2 text-right font-semibold text-slate-900">
                    {formatCurrency(lineTotalCents(item.cantidad, item.precio))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-800">
              {formatCurrency(Math.round(Number(proforma.subtotal || 0) * 100))}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>IVA (15%)</span>
            <span className="font-semibold text-slate-800">
              {formatCurrency(Math.round(Number(proforma.iva || 0) * 100))}
            </span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-1 text-base font-bold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(Math.round(Number(proforma.total || 0) * 100))}</span>
          </div>
        </div>

        {proforma.notas && (
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notas</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{proforma.notas}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
