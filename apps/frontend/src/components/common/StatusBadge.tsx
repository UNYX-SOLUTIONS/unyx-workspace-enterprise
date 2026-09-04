const styles: Record<string, string> = {
  Emitida: "border-amber-300 bg-amber-100 text-amber-700",
  Borrador: "border-gray-300 bg-gray-100 text-gray-700",
  Aceptada: "border-green-300 bg-green-100 text-green-700",
  Expirada: "border-red-300 bg-red-50 text-red-700",
  Activo: "border-green-300 bg-green-100 text-green-700",
  Pendiente: "border-amber-300 bg-amber-100 text-amber-700",
  Inactivo: "border-gray-300 bg-gray-100 text-gray-700",
  Conforme: "border-green-300 bg-green-100 text-green-700",
  Observación: "border-amber-300 bg-amber-100 text-amber-700",
  "No aplica": "border-gray-300 bg-gray-100 text-gray-700",
};

export interface StatusBadgeProps {
  status?: string | null;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const resolved = status ?? "";
  return (
    <span
      className={`
        inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase
        ${styles[resolved] || "border-gray-300 bg-gray-100 text-gray-700"}
        ${className}
      `}
    >
      {resolved || "Sin estado"}
    </span>
  );
}
