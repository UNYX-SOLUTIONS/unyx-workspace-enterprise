// WelcomeUser.tsx
import { CalendarDays, ChevronRight } from "lucide-react";

interface WelcomeUserProps {
  userName?: string;
  role?: string;
  greeting?: string;
  subtitle?: string;
}

export default function WelcomeUser({
  userName = "Admin User",
  greeting = "Bienvenido de vuelta",
  subtitle = "Aquí tienes el resumen de tus proformas.",
}: WelcomeUserProps) {
  // Fecha local en formato es-PE corto (ej: "mié, 30 sep")
  const today = new Intl.DateTimeFormat("es-PE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date());

  const firstName = userName.split(" ")[0];

  return (
    <section
      aria-label="Bienvenida al usuario"
      className="hidden min-w-0 flex-col sm:flex gap-0.5"
    >
      <div className="flex items-center gap-2">
        <h2 className="truncate text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {greeting},{" "}
          <span className="text-unyx-blue">{firstName}</span>
        </h2>
      </div>

      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        <CalendarDays className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        <span className="capitalize">{today}</span>
        <ChevronRight className="h-3 w-3 text-slate-300" aria-hidden="true" />
        <span className="truncate">{subtitle}</span>
      </div>
    </section>
  );
}