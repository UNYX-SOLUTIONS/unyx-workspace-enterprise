import { Bell, Menu } from "lucide-react";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";

export interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Abrir menú"
        className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 md:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <SearchBar />

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
        </button>
        <UserMenu />
      </div>
    </header>
  );
}
