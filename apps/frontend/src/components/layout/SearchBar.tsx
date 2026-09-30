import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <label className="hidden w-full max-w-md sm:block">
      <span className="sr-only">Buscar</span>
      <span className="relative block">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Buscar..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
        />
      </span>
    </label>
  );
}
