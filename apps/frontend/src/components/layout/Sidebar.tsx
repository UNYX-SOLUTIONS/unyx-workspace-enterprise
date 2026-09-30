import { NavLink } from "react-router-dom";
import { Boxes, HelpCircle, Settings } from "lucide-react";
import { navigation } from "@/app/navigation";

export interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = true, onClose = () => {} }: SidebarProps) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-slate-200 bg-white transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Boxes className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight text-slate-900">UNYX Solutions</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Admin Workspace
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1 border-t border-slate-200 px-3 py-4">
          <NavLink
            to="/configuracion"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
            Configuración
          </NavLink>
          <span className="flex cursor-default items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400">
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
            Soporte
          </span>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/30 md:hidden" onClick={onClose} />}
    </>
  );
}
