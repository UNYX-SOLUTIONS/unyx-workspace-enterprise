import { useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import FloatingMenu from "@/components/common/FloatingMenu";
import { useClickOutside } from "@/hooks/useClickOutside";
import {
  PROFORMA_ESTADOS,
  getProformaStatusMeta,
} from "@/modules/common/utils/statusMap";

export type ProformaStatusFilterValue = "TODOS" | (typeof PROFORMA_ESTADOS)[number];

export interface ProformaStatusFilterProps {
  value: ProformaStatusFilterValue;
  onChange: (value: ProformaStatusFilterValue) => void;
}

export default function ProformaStatusFilter({ value, onChange }: ProformaStatusFilterProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useClickOutside(containerRef, () => setOpen(false), open);

  const options: ProformaStatusFilterValue[] = ["TODOS", ...PROFORMA_ESTADOS];
  const currentMeta = value === "TODOS" ? null : getProformaStatusMeta(value);

  return (
    <div ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Filtrar por estado"
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 lg:min-w-42"
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${currentMeta?.dot ?? "bg-slate-300"}`}
          aria-hidden="true"
        />
        {currentMeta ? currentMeta.label : "Todos los estados"}
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <FloatingMenu
        open={open}
        anchorRef={triggerRef}
        onClose={() => setOpen(false)}
        align="right"
        width={176}
      >
        <ul
          role="listbox"
          aria-label="Estados"
          className="overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {options.map((option) => {
            const meta = option === "TODOS" ? null : getProformaStatusMeta(option);
            const isCurrent = option === value;

            return (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isCurrent}
                  onClick={() => {
                    setOpen(false);
                    onChange(option);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide transition-colors hover:bg-slate-50 ${
                    isCurrent ? "text-slate-900" : "text-slate-600"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${meta?.dot ?? "bg-slate-300"}`}
                    aria-hidden="true"
                  />
                  {meta ? meta.label : "TODOS"}
                  {isCurrent && (
                    <Check className="ml-auto h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
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
