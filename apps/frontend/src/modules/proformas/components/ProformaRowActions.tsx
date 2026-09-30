import { useRef, useState } from "react";
import {
  Check,
  ChevronRight,
  Copy,
  Eye,
  FileDown,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import FloatingMenu from "@/components/common/FloatingMenu";
import { useClickOutside } from "@/hooks/useClickOutside";
import {
  PROFORMA_ESTADOS,
  getProformaStatusMeta,
} from "@/modules/common/utils/statusMap";
import type { ProformaEstado } from "@unyx/shared-schemas";

export interface ProformaRowActionsProps {
  numero: string;
  status: string;
  pendingPdf?: boolean;
  deleting?: boolean;
  duplicating?: boolean;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDownloadPdf: () => void;
  onDelete: () => void;
  onChangeStatus: (status: ProformaEstado) => void;
}

// FIX bug-1/bug-2: todas las acciones están SIEMPRE habilitadas,
// sin importar el estado de la proforma (CANCELADA/EXPIRADA incluidas).
// FIX dropdown: menú en portal con posición fija (no lo recorta la tabla).
export default function ProformaRowActions({
  numero,
  status,
  pendingPdf = false,
  deleting = false,
  duplicating = false,
  onView,
  onEdit,
  onDuplicate,
  onDownloadPdf,
  onDelete,
  onChangeStatus,
}: ProformaRowActionsProps) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useClickOutside(
    containerRef,
    () => {
      setOpen(false);
      setConfirmDelete(false);
    },
    open
  );

  const itemClass =
    "flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none";

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={onDownloadPdf}
        disabled={pendingPdf}
        aria-label={`Descargar PDF de la proforma ${numero}`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
        {pendingPdf ? "Generando..." : "PDF"}
      </button>

      <div ref={containerRef}>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`Más acciones para la proforma ${numero}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <MoreVertical className="h-4 w-4" aria-hidden="true" />
        </button>

        <FloatingMenu
          open={open}
          anchorRef={triggerRef}
          onClose={() => {
            setOpen(false);
            setConfirmDelete(false);
          }}
          align="right"
          width={208}
        >
          <div
            role="menu"
            className="overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          >
            <button type="button" role="menuitem" className={itemClass} onClick={onView}>
              <Eye className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              Ver detalle
            </button>
            <button type="button" role="menuitem" className={itemClass} onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              Editar
            </button>

            <div className="group/status relative">
              <button type="button" role="menuitem" className={`${itemClass} justify-between`}>
                <span className="flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${getProformaStatusMeta(status).dot}`}
                    aria-hidden="true"
                  />
                  Cambiar estado
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              </button>

              <div className="pointer-events-none invisible absolute right-full top-0 mr-1 w-44 rounded-lg border border-slate-200 bg-white py-1 opacity-0 shadow-lg transition-opacity group-hover/status:visible group-hover/status:pointer-events-auto group-hover/status:opacity-100 group-focus-within/status:visible group-focus-within/status:pointer-events-auto group-focus-within/status:opacity-100">
                {PROFORMA_ESTADOS.map((option) => {
                  const optionMeta = getProformaStatusMeta(option);
                  const isCurrent = option === status;

                  return (
                    <button
                      key={option}
                      type="button"
                      role="menuitemradio"
                      aria-checked={isCurrent}
                      onClick={() => {
                        setOpen(false);
                        if (!isCurrent) onChangeStatus(option);
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide transition-colors hover:bg-slate-50 ${
                        isCurrent ? "text-slate-900" : "text-slate-600"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${optionMeta.dot}`}
                        aria-hidden="true"
                      />
                      {optionMeta.label}
                      {isCurrent && (
                        <Check className="ml-auto h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="button" role="menuitem" className={itemClass} onClick={onDuplicate}>
              <Copy className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              {duplicating ? "Duplicando..." : "Duplicar"}
            </button>
            <button type="button" role="menuitem" className={itemClass} onClick={onDownloadPdf}>
              <FileDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              Descargar PDF
            </button>

            <button
              type="button"
              role="menuitem"
              disabled={deleting}
              onClick={() => {
                if (!confirmDelete) {
                  setConfirmDelete(true);
                  return;
                }
                setConfirmDelete(false);
                setOpen(false);
                onDelete();
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold transition-colors focus-visible:outline-none disabled:cursor-wait disabled:opacity-60 ${
                confirmDelete
                  ? "bg-rose-600 text-white hover:bg-rose-700"
                  : "text-rose-600 hover:bg-rose-50"
              }`}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              {deleting
                ? "Eliminando..."
                : confirmDelete
                  ? "¿Confirmar eliminación?"
                  : "Eliminar"}
            </button>
          </div>
        </FloatingMenu>
      </div>
    </div>
  );
}
