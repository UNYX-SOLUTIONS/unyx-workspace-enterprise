const variants = {
  primary: "bg-slate-900 text-white hover:bg-slate-700",
  secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export default function ActionButton({
  label,
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      className={`rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children ?? label}
    </button>
  );
}
