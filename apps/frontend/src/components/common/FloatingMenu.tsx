import { useEffect, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

export interface FloatingMenuProps {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  align?: "left" | "right";
  width?: number;
  children: ReactNode;
}

// Menú flotante en portal con posición fija: evita que las tablas con
// overflow recorten el dropdown (bug del dropdown bajo la fila).
export default function FloatingMenu({
  open,
  anchorRef,
  onClose,
  align = "left",
  width = 176,
  children,
}: FloatingMenuProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open) {
      setPosition(null);
      return undefined;
    }

    function updatePosition() {
      const anchor = anchorRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const maxLeft = window.innerWidth - width - 8;
      const left = align === "right" ? rect.right - width : rect.left;

      setPosition({
        top: rect.bottom + 4,
        left: Math.min(Math.max(8, left), Math.max(8, maxLeft)),
      });
    }

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, anchorRef, align, width]);

  useEffect(() => {
    if (!open) return undefined;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !position) return null;

  return createPortal(
    <div
      style={{ position: "fixed", top: position.top, left: position.left, width }}
      className="z-[70]"
    >
      {children}
    </div>,
    document.body
  );
}
