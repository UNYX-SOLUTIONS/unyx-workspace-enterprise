import { createContext, useCallback, useMemo, useState } from "react";
import ToastContainer from "../components/common/ToastContainer";

export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [messages, setMessages] = useState([]);

  const showToast = useCallback((text) => {
    const id = crypto.randomUUID();
    setMessages((current) => [...current, { id, text }]);
    setTimeout(() => setMessages((current) => current.filter((item) => item.id !== id)), 3000);
  }, []);

  const value = useMemo(() => ({ messages, showToast }), [messages, showToast]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}
