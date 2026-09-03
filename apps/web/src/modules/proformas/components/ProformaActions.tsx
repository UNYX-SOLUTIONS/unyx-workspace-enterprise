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
  const emitLabel =
    estado === "EMITIDA" || estado === "ACEPTADA" ? "Guardar cambios" : "Emitir Proforma";

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onDownloadPdf}
        disabled={pending}
        className="w-full rounded-lg border-2 border-[#2170e4] bg-white px-6 py-3 font-bold text-[#2170e4] transition-all hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Generar PDF
      </button>

      {estado === "BORRADOR" && (
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={pending}
          className="w-full rounded-lg border-2 border-[#2170e4] bg-white px-6 py-3 font-bold text-[#2170e4] transition-all hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Procesando..." : "Guardar borrador"}
        </button>
      )}

      <button
        type="button"
        onClick={onEmit}
        disabled={pending}
        className="w-full rounded-lg bg-gradient-to-r from-[#2170e4] to-[#0058be] px-6 py-3 font-bold text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Procesando..." : emitLabel}
      </button>
    </div>
  );
}
