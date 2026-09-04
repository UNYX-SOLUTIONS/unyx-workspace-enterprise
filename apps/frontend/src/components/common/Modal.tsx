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
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar modal"
      />

      <div
        className={`
          relative z-10 max-h-[90vh] w-full overflow-y-auto
          rounded-2xl border border-[#d1d5db]
          bg-white shadow-2xl
          ${sizes[size] || sizes.md}
        `}
      >
        <div
          className="
            sticky top-0 z-20 flex items-center justify-between
            rounded-t-2xl border-b border-[#d1d5db]
            bg-white px-6 py-5
          "
        >
          <p id="modal-title" className="text-xl font-extrabold !text-[#111827]">
            {title}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="
              flex h-9 w-9 items-center justify-center
              rounded-lg text-lg font-bold !text-[#4b5563]
              transition-colors hover:bg-[#eff4ff]
              hover:!text-[#111827]
            "
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="bg-white p-6 !text-[#111827]">{children}</div>
      </div>
    </div>
  );
}
