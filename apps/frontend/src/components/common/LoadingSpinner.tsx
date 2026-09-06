const sizes: Record<string, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-4",
  lg: "h-12 w-12 border-4",
};

export interface LoadingSpinnerProps {
  size?: keyof typeof sizes;
  fullScreen?: boolean;
  label?: string;
}

export default function LoadingSpinner({
  size = "md",
  fullScreen = false,
  label = "Cargando...",
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      role="status"
      aria-label={label}
      className={`
        animate-spin rounded-full border-[#e5eeff] border-t-[#2170e4]
        ${sizes[size] || sizes.md}
      `}
    />
  );

  if (fullScreen) {
    return <div className="grid min-h-screen place-items-center">{spinner}</div>;
  }

  return spinner;
}
