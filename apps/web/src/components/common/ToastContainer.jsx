import { useToast } from "../../hooks/useToast";

export default function ToastContainer() {
  const { messages } = useToast();
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {messages.map((message) => (
        <div key={message.id} className="rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
          {message.text}
        </div>
      ))}
    </div>
  );
}
