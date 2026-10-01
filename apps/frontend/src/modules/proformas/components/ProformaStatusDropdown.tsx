import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import FloatingMenu from "@/components/common/FloatingMenu";
import {
  PROFORMA_ESTADOS,
  getProformaStatusMeta,
} from "@/modules/common/utils/statusMap";
import type { ProformaEstado } from "@unyx/shared-schemas";

export interface ProformaStatusDropdownProps {
  status: string;
  disabled?: boolean;
  onSelect: (status: ProformaEstado) => void;
}

// FIX bug-2: los 5 estados están SIEMPRE disponibles, sin flujo secuencial.
// FIX bug-1: CANCELADA no bloquea el cambio de estado (es reversible).
// FIX dropdown: menú en portal con posición fija (no lo recorta la tabla).
export default function ProformaStatusDropdown({
  status,
  disabled = false,
  onSelect,
}: ProformaStatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const meta = getProformaStatusMeta(status);

  return (
    <div className="inline-block">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Cambiar estado de la proforma (actual: ${meta.label})`}
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide outline-none transition-all hover:shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${meta.badge}`}
      >
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`} aria-hidden="true" />
        {meta.label}
        <ChevronDown
          className={`h-3 w-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <FloatingMenu open={open} anchorRef={triggerRef} onClose={() => setOpen(false)} width={176}>
        <ul
          role="listbox"
          aria-label="Estados disponibles"
          className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1 shadow-lg"
        >
          {PROFORMA_ESTADOS.map((option) => {
            const optionMeta = getProformaStatusMeta(option);
            const isCurrent = option === status;

            return (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isCurrent}
                  onClick={() => {
                    setOpen(false);
                    if (!isCurrent) onSelect(option);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                    isCurrent ? "text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${optionMeta.dot}`}
                    aria-hidden="true"
                  />
                  {optionMeta.label}
                  {isCurrent && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-auto h-3.5 w-3.5 text-blue-600"
                      aria-hidden="true"
                    >
                      <path d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </FloatingMenu>
    </div>
  );
}
