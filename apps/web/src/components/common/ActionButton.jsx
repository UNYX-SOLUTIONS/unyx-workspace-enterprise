const variants = {
  primary: "bg-[#2170e4] text-white hover:bg-[#0058be]",
  secondary:
    "bg-white border border-[#c7c6cb] text-[#010105] hover:bg-[#eff4ff]",
  danger: "bg-red-100 text-red-700 hover:bg-red-200",
  success: "bg-green-100 text-green-700 hover:bg-green-200",
};

const sizes = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

export default function ActionButton({
  onClick,
  label,
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-semibold
        transition-colors
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${disabled ? "cursor-not-allowed opacity-50" : ""}
        ${className}
      `}
      {...props}
    >
      {children ?? label}
    </button>
  );
}
