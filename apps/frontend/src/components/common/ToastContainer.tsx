import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import type { ToastType } from "@/contexts/ToastContext";

const typeStyles: Record<ToastType, string> = {
  success: "border-emerald-200 bg-white text-slate-800",
  error: "border-rose-200 bg-white text-slate-800",
  warning: "border-amber-200 bg-white text-slate-800",
  info: "border-slate-200 bg-white text-slate-800",
};

const typeIcons: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const iconStyles: Record<ToastType, string> = {
  success: "text-emerald-500",
  error: "text-rose-500",
  warning: "text-amber-500",
  info: "text-blue-500",
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
      {messages.map((message) => {
        const Icon = typeIcons[message.type] || Info;

        return (
          <div
            key={message.id}
            className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm shadow-sm ${
              typeStyles[message.type] || typeStyles.info
            }`}
          >
            <Icon
              className={`mt-0.5 h-4 w-4 shrink-0 ${iconStyles[message.type] || iconStyles.info}`}
              aria-hidden="true"
            />
            <span>{message.text}</span>
          </div>
        );
      })}
    </div>
  );
}
