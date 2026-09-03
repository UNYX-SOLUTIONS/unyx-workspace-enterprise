import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Card, InputField, PageHeader } from "../../../components/common";
import { useToast } from "../../../hooks/useToast";

import ProformaActions from "../components/ProformaActions";
import ProformaForm from "../components/ProformaForm";
import ProformaItemsTable from "../components/ProformaItemsTable";
import ProformaTotals from "../components/ProformaTotals";

import { useProformaForm } from "../hooks/useProformaForm";
import { useProformaItems } from "../hooks/useProformaItems";
import { useProformaSave } from "../hooks/useProformaSave";

import { previewNextProformaNumber } from "../services/proformaService";

export default function ProformaPage() {
  const { numero: routeNumero } = useParams();
  const navigate = useNavigate();
  const { showError } = useToast();

  const [loading, setLoading] = useState(Boolean(routeNumero));

  const form = useProformaForm();
  const items = useProformaItems();
  const { pending, saveDraft, emit, downloadPdf, load } = useProformaSave({ form, items });

  useEffect(() => {
    let active = true;

    async function initialize() {
      if (routeNumero) {
        const loaded = await load(routeNumero);
        if (!loaded && active) navigate("/proformas", { replace: true });
        if (active) setLoading(false);
        return;
      }

      try {
        const next = await previewNextProformaNumber();
        if (active) form.setNumero(next);
      } catch {
        showError("No fue posible obtener el siguiente número de proforma.");
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();
    return () => {
      active = false;
    };
  }, [routeNumero]);

  if (loading) {
    return <div className="py-12 text-center font-medium text-[#46464b]">Cargando proforma...</div>;
  }

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title={routeNumero ? `Editar Proforma ${form.numero}` : "Crear Nueva Proforma"}
        subtitle="Complete los campos para generar la proforma oficial."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h3 className="mb-6 text-xl font-bold text-[#010105]">Datos del Emisor</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField label="Razón Social" value="UNYX SOLUTIONS S.A.S." readOnly />
              <InputField label="RUC" value="0993406012001" readOnly />
              <InputField label="Teléfono" value="+593 98 336 1386" readOnly />
              <InputField
                label="Dirección"
                value="Guayaquil, Ecuador"
                readOnly
                className="sm:col-span-2"
              />
            </div>
          </Card>

          <ProformaForm form={form} />
          <ProformaItemsTable items={items} />
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            <ProformaTotals totals={items.totals} />
            <ProformaActions
              estado={form.estado}
              pending={pending}
              onSaveDraft={saveDraft}
              onEmit={emit}
              onDownloadPdf={downloadPdf}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
