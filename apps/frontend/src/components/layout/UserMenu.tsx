import { ChevronDown } from "lucide-react";

export default function UserMenu() {
  return (
    <button
      type="button"
      aria-label="Menú de usuario"
      className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
        AU
      </span>
      <span className="hidden text-left leading-tight lg:block">
        <span className="block text-sm font-semibold text-slate-900">Admin User</span>
        <span className="block text-[11px] text-slate-500">Finanzas &amp; Facturación</span>
      </span>
      <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 lg:block" aria-hidden="true" />
    </button>
  );
}
