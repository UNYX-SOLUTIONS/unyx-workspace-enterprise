import { Check, Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import type { ThemeMode } from "@/contexts/ThemeContext";

const THEME_OPTIONS: Array<{ value: ThemeMode; label: string; icon: LucideIcon }> = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

export default function ThemeOptions() {
  const { mode, setMode } = useTheme();

  return (
    <div className="space-y-0.5">
      {THEME_OPTIONS.map((option) => {
        const isCurrent = mode === option.value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setMode(option.value)}
            aria-pressed={isCurrent}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
              isCurrent
                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {option.label}
            {isCurrent && <Check className="ml-auto h-3.5 w-3.5" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}
