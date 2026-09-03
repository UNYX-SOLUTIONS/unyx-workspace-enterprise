import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";
import ToastContainer from "../components/common/ToastContainer";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  text: string;
  type: ToastType;
}

export interface ToastContextValue {
  messages: ToastMessage[];
  showToast: (text: string, type?: ToastType, duration?: number) => void;
  showSuccess: (text: string) => void;
  showError: (text: string) => void;
  showWarning: (text: string) => void;
  showInfo: (text: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 4000;
const ERROR_DURATION = 6000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setMessages((current) => current.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (text: string, type: ToastType = "info", duration = DEFAULT_DURATION) => {
      const id = crypto.randomUUID();
      setMessages((current) => [...current, { id, text, type }]);
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const showSuccess = useCallback((text: string) => showToast(text, "success"), [showToast]);
  const showError = useCallback(
    (text: string) => showToast(text, "error", ERROR_DURATION),
    [showToast]
  );
  const showWarning = useCallback((text: string) => showToast(text, "warning"), [showToast]);
  const showInfo = useCallback((text: string) => showToast(text, "info"), [showToast]);

  const value = useMemo(
    () => ({ messages, showToast, showSuccess, showError, showWarning, showInfo }),
    [messages, showToast, showSuccess, showError, showWarning, showInfo]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}
