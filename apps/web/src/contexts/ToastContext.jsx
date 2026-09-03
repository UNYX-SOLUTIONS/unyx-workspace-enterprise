import { createContext, useCallback, useMemo, useState } from "react";
import ToastContainer from "../components/common/ToastContainer";

export const ToastContext = createContext(null);

const DEFAULT_DURATION = 4000;
const ERROR_DURATION = 6000;

export function ToastProvider({ children }) {
  const [messages, setMessages] = useState([]);

  const dismiss = useCallback((id) => {
    setMessages((current) => current.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (text, type = "info", duration = DEFAULT_DURATION) => {
      const id = crypto.randomUUID();
      setMessages((current) => [...current, { id, text, type }]);
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const showSuccess = useCallback((text) => showToast(text, "success"), [showToast]);
  const showError = useCallback((text) => showToast(text, "error", ERROR_DURATION), [showToast]);
  const showWarning = useCallback((text) => showToast(text, "warning"), [showToast]);
  const showInfo = useCallback((text) => showToast(text, "info"), [showToast]);

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
