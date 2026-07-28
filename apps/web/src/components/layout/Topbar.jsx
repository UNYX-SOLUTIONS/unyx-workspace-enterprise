import { Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";

export default function Topbar() {
  const { dark, toggleTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-end gap-3 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
      <button onClick={toggleTheme} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <button onClick={logout} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
        <LogOut size={18} />
      </button>
    </header>
  );
}
