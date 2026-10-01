import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

const sizes: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
};

export interface ModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  title?: ReactNode;
  children: ReactNode;
  size?: keyof typeof sizes;
}

export default function Modal({
  isOpen,
  open,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  const visible = typeof open === "boolean" ? open : Boolean(isOpen);

  useEffect(() => {
    if (!visible) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-label="Cerrar modal"
      />

      <div
        className={`
          relative z-10 max-h-[90vh] w-full overflow-y-auto
          rounded-xl border border-slate-200 dark:border-slate-800
          bg-white dark:bg-slate-900 shadow-lg
          ${sizes[size] || sizes.md}
        `}
      >
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
          <p id="modal-title" className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
            {title}
          </p>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6">{children}</div>
      </div>
    </div>
  );
}
