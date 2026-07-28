const variants = {
  info: "border-blue-200 bg-blue-50 text-blue-800",
  success: "border-green-200 bg-green-50 text-green-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-red-200 bg-red-50 text-red-800",
};

export default function InfoBadge({
  children,
  variant = "info",
  className = "",
}) {
  return (
    <div
      className={`
        rounded-lg border p-4 text-sm
        ${variants[variant] || variants.info}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
