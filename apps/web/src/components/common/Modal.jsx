import { useEffect } from "react";

const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
};

export default function Modal({
  isOpen,
  open,
  onClose,
  title,
  children,
  size = "md",
}) {
  const visible = typeof open === "boolean" ? open : isOpen;

  useEffect(() => {
    if (!visible) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
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
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar modal"
      />

      <div
        className={`
          relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-2xl
          border border-white/30 bg-white/95 shadow-2xl backdrop-blur-xl
          ${sizes[size] || sizes.md}
        `}
      >
        <div className="sticky top-0 flex items-center justify-between rounded-t-2xl border-b border-[#c7c6cb] bg-white/90 p-6 backdrop-blur-md">
          <h2 id="modal-title" className="text-xl font-bold text-[#010105]">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#46464b] transition-colors hover:bg-[#eff4ff] hover:text-[#010105]"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
