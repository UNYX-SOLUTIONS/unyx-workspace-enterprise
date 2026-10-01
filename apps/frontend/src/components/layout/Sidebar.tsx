import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
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

export default function Sidebar({
  open = true,
  onClose = () => {},
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem(COLLAPSE_KEY) === "1",
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
          collapsed ? "md:w-19" : "md:w-64"
        } ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div
          className={`flex h-16 w-full items-center border-b border-white/10 ${
            collapsed ? "md:justify-center md:px-0" : "gap-2.5 px-4"
          }`}
        >
          {/* ===== ZONA IZQUIERDA: Logo / Logo-mini / Botón colapsar (swap) ===== */}
          {collapsed ? (
            // COLAPSADO: muestra logo-mini, y en hover se convierte en botón expandir
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Expandir menú"
              title="Expandir menú"
              className="group relative hidden h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-white/5 md:flex"
            >
              {/* Logo mini (visible por defecto) */}
              <img
                src="/apple-touch-icon.png" /* 👈 pon aquí tu ruta al logo cuadrado/mini */
                alt="Unyx Solutions"
                className="h-9.5 w-9.5 object-contain transition-opacity duration-150 group-hover:opacity-0"
              />
              {/* Chevron (visible solo en hover, encima del logo) */}
              <ChevronRight
                className="absolute h-5 w-5 text-slate-300 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                aria-hidden="true"
              />
            </button>
          ) : (
            // EXPANDIDO: logo completo + botón colapsar a la derecha
            <>
              <Link
                to="/"
                className="flex items-center gap-2 leading-tight"
                aria-label="Ir al inicio"
              >
                <img
                  src="/logo.png"
                  alt="Unyx Solutions"
                  className="ml-1 mt-1 h-6 w-auto object-contain p-0.5"
                />
              </Link>

              <button
                type="button"
                onClick={() => setCollapsed(true)}
                aria-label="Colapsar menú"
                title="Colapsar menú"
                className="ml-auto hidden rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/5 hover:text-white md:flex"
              >
                <ChevronLeft className="h-6 w-6 shrink-0" aria-hidden="true" />
              </button>
            </>
          )}
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
        <div
          className="fixed inset-0 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}
