import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import FloatingMenu from "@/components/common/FloatingMenu";
import ThemeOptions from "@/components/layout/ThemeOptions";
import { useAuth } from "@/hooks/useAuth";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const initials = (user?.name || user?.email || "U")
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <div>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menú de usuario"
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-100 text-xs font-bold text-white dark:text-slate-900">
          {initials}
        </span>
        <span className="hidden text-left leading-tight lg:block">
          <span className="block text-xs font-semibold text-slate-900 dark:text-slate-100">
            {user?.name || "Usuario"}
          </span>
          <span className="block text-[10px] text-slate-500 dark:text-slate-400">
            {user?.role === "ADMIN" ? "Administrador" : (user?.role ?? "")}
          </span>
        </span>
        <ChevronDown
          className={`hidden h-3.5 w-3.5 text-slate-400 transition-transform lg:block ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <FloatingMenu
        open={open}
        anchorRef={triggerRef}
        onClose={() => setOpen(false)}
        align="right"
        width={248}
      >
        <div
          role="menu"
          className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg"
        >
          <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              {user?.name || "Usuario"}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {user?.email || ""}
            </p>
          </div>

          <div className="p-1.5">
            <Link
              to="/configuracion"
              onClick={() => setOpen(false)}
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

            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </FloatingMenu>
    </div>
  );
}
