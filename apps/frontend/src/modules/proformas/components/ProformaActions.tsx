export interface ProformaActionsProps {
  estado?: string;
  pending: boolean;
  onSaveDraft: () => void;
  onEmit: () => void;
  onDownloadPdf: () => void;
}

export default function ProformaActions({
  estado,
  pending,
  onSaveDraft,
  onEmit,
  onDownloadPdf,
}: ProformaActionsProps) {
  const emitLabel = estado === "BORRADOR" ? "Emitir Proforma" : "Guardar cambios";

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onDownloadPdf}
        disabled={pending}
        className="w-full rounded-lg border border-blue-500 bg-white dark:bg-slate-900 px-6 py-3 font-bold text-blue-600 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Generar PDF
      </button>

      {estado === "BORRADOR" && (
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={pending}
          className="w-full rounded-lg border border-blue-500 bg-white dark:bg-slate-900 px-6 py-3 font-bold text-blue-600 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Procesando..." : "Guardar borrador"}
        </button>
      )}

      <button
        type="button"
        onClick={onEmit}
        disabled={pending}
        className="w-full rounded-lg bg-blue-500 hover:bg-blue-600 px-6 py-3 font-bold text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Procesando..." : emitLabel}
      </button>
    </div>
  );
}
