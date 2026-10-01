import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Settings,
  UserRound,
} from "lucide-react";
import { navigation } from "@/app/navigation";
import ThemeOptions from "@/components/layout/ThemeOptions";

const COLLAPSE_KEY = "unyx_sidebar_collapsed";

export interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = true, onClose = () => {} }: SidebarProps) {
  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem(COLLAPSE_KEY) === "1"
  );

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  const itemClass =
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors";
  const labelClass = collapsed ? "md:hidden" : "";

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-slate-800 bg-slate-900 transition-all duration-200 dark:border-slate-700 dark:bg-slate-800 md:static md:h-full md:shrink-0 md:translate-x-0 ${
          collapsed ? "md:w-[76px]" : "md:w-64"
        } ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div
          className={`flex h-16 items-center gap-2.5 border-b border-white/10 px-4 ${
            collapsed ? "md:justify-center md:px-0" : ""
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
            <Boxes className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className={`leading-tight ${collapsed ? "md:hidden" : ""}`}>
            <p className="text-sm font-bold tracking-tight text-white">UNYX Solutions</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
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
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `${itemClass} ${collapsed ? "md:justify-center" : ""} ${
                  isActive
                    ? "bg-blue-500/15 text-blue-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className={labelClass}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1 border-t border-white/10 px-3 py-4">
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            title={collapsed ? "Expandir menú" : "Colapsar menú"}
            className={`${itemClass} hidden w-full text-slate-400 hover:bg-white/5 hover:text-white md:flex ${
              collapsed ? "md:justify-center" : ""
            }`}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <span className={labelClass}>Colapsar</span>
          </button>

          {/* Configuración: al pasar el mouse se abre el panel (estilo Kommo) */}
          <div className="group/config relative">
            <NavLink
              to="/configuracion"
              onClick={onClose}
              title={collapsed ? "Configuración" : undefined}
              className={({ isActive }) =>
                `${itemClass} ${collapsed ? "md:justify-center" : ""} ${
                  isActive
                    ? "bg-blue-500/15 text-blue-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Settings className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className={labelClass}>Configuración</span>
            </NavLink>

            <div
              className="
                pointer-events-none invisible absolute bottom-0 left-full z-50 ml-2 w-56
                translate-x-1 rounded-xl border border-slate-200 dark:border-slate-700
                bg-white dark:bg-slate-900 p-1.5 opacity-0 shadow-xl
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
            title={collapsed ? "Soporte" : undefined}
            className={`${itemClass} ${collapsed ? "md:justify-center" : ""} text-slate-400 hover:bg-white/5 hover:text-white`}
          >
            <HelpCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className={labelClass}>Soporte</span>
          </a>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 bg-black/30 md:hidden" onClick={onClose} />
      )}
    </>
  );
}
