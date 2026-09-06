import { useToast } from "@/hooks/useToast";
import type { ToastType } from "@/contexts/ToastContext";

const typeStyles: Record<ToastType, string> = {
  success: "border-green-300 bg-green-700",
  error: "border-red-300 bg-red-700",
  warning: "border-amber-300 bg-amber-600",
  info: "border-slate-500 bg-slate-800",
};

export default function ToastContainer() {
  const { messages } = useToast();

  if (!messages.length) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
      role="region"
      aria-live="polite"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`rounded-lg border px-4 py-3 text-sm text-white shadow-lg ${
            typeStyles[message.type] || typeStyles.info
          }`}
        >
          {message.text}
        </div>
      ))}
    </div>
  );
}
