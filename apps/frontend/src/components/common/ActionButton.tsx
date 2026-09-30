import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants: Record<string, string> = {
  primary:
    "bg-blue-500 text-white hover:bg-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
  danger:
    "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2",
  success:
    "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
};

const sizes: Record<string, string> = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

export interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
  label?: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}

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
}: ActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-semibold
        transition-colors focus-visible:outline-none
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
