import { Link, NavLink } from "react-router-dom";
import { Boxes, HelpCircle, Settings, UserRound } from "lucide-react";
import { navigation } from "@/app/navigation";
import ThemeOptions from "@/components/layout/ThemeOptions";

export interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = true, onClose = () => {} }: SidebarProps) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-transform md:static md:h-full md:shrink-0 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 px-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900">
            <Boxes className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
              UNYX Solutions
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
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
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                }`
              }
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1 border-t border-slate-200 dark:border-slate-800 px-3 py-4">
          {/* Configuración: al pasar el mouse se abre el panel (estilo Kommo) */}
          <div className="group/config relative">
            <NavLink
              to="/configuracion"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                }`
              }
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              Configuración
            </NavLink>

            <div
              className="
                pointer-events-none invisible absolute bottom-0 left-full z-50 ml-2 w-56
                translate-x-1 rounded-xl border border-slate-200 dark:border-slate-700
                bg-white dark:bg-slate-900 p-1.5 opacity-0 shadow-lg
                transition-all duration-150
                group-hover/config:visible group-hover/config:pointer-events-auto
                group-hover/config:translate-x-0 group-hover/config:opacity-100
                group-focus-within/config:visible group-focus-within/config:pointer-events-auto
                group-focus-within/config:translate-x-0 group-focus-within/config:opacity-100
              "
            >
              <Link
                to="/configuracion"
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
              >
                <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                Configuración del perfil
              </Link>

              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

              <p className="px-3 pb-0.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Tema
              </p>
              <ThemeOptions />
            </div>
          </div>

          <a
            href="mailto:soporte@unyxsolutions.com"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
            Soporte
          </a>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 bg-black/30 md:hidden" onClick={onClose} />
      )}
    </>
  );
}
