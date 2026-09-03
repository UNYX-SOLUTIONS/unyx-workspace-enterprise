import { useCallback, useRef, useState } from "react";
import type { ProformaEstado } from "@unyx/shared-schemas";
import { useToast } from "../../../hooks/useToast";
import { getProforma, createProforma, updateProforma } from "../services/proformaService";
import { generatePdf } from "../utils/generatePdf";
import { fromCents, validateMonetary } from "../utils/monetary";
import type { UseProformaForm } from "./useProformaForm";
import type { UseProformaItems } from "./useProformaItems";

export interface UseProformaSaveParams {
  form: UseProformaForm;
  items: UseProformaItems;
}

function getErrorMessage(error: unknown, fallback: string): string {
  const apiError = (error as { response?: { data?: { error?: string } } })?.response?.data
    ?.error;
  if (apiError) return apiError;
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useProformaSave({ form, items }: UseProformaSaveParams) {
  const { showError, showSuccess } = useToast();
  const [pending, setPending] = useState(false);
  const savedIdRef = useRef<string | null>(null);

  const validate = useCallback(() => {
    if (!form.cliente.nombre.trim()) {
      showError("Seleccione o ingrese el cliente.");
      return false;
    }
    if (!form.cliente.ruc.trim()) {
      showError("La identificación (RUC) del cliente es obligatoria.");
      return false;
    }
    if (items.items.length === 0) {
      showError("Agregue al menos un ítem a la proforma.");
      return false;
    }
    for (const item of items.items) {
      if (!String(item.descripcion || "").trim()) {
        showError("Todos los ítems deben tener descripción.");
        return false;
      }
      if (!validateMonetary(item.cantidad) || Number(item.cantidad) <= 0) {
        showError(`Cantidad inválida en el ítem "${item.descripcion}".`);
        return false;
      }
      if (!validateMonetary(item.precio)) {
        showError(`Precio inválido en el ítem "${item.descripcion}".`);
        return false;
      }
    }
    return true;
  }, [form.cliente, items.items, showError]);

  const buildPayload = useCallback(
    (estado: ProformaEstado) => ({
      clienteId: form.clienteId || undefined,
      cliente: form.cliente,
      fecha: form.fecha,
      validezDias: form.validezDias,
      notas: form.notas,
      items: items.items.map(({ id: _id, ...item }) => item),
      estado,
    }),
    [form.cliente, form.clienteId, form.fecha, form.validezDias, form.notas, items.items]
  );

  const buildPdfData = useCallback(
    () => ({
      numero: form.numero,
      fecha: form.fecha,
      validezDias: form.validezDias,
      notas: form.notas,
      cliente: form.cliente,
      items: items.items,
      subtotal: fromCents(items.totals.subtotalCents),
      iva: fromCents(items.totals.ivaCents),
      total: fromCents(items.totals.totalCents),
    }),
    [form, items.items, items.totals]
  );

  const save = useCallback(
    async (estado: ProformaEstado, { downloadPdf = false }: { downloadPdf?: boolean } = {}) => {
      if (!validate()) return null;

      setPending(true);
      try {
        const payload = buildPayload(estado);
        const saved = savedIdRef.current
          ? await updateProforma(savedIdRef.current, payload)
          : await createProforma(payload);

        savedIdRef.current = saved.id;
        form.setNumero(saved.numero);

        if (downloadPdf) {
          await generatePdf(buildPdfData());
        }

        showSuccess(
          estado === "EMITIDA"
            ? `Proforma ${saved.numero} emitida correctamente.`
            : `Borrador ${saved.numero} guardado correctamente.`
        );
        return saved;
      } catch (error) {
        showError(getErrorMessage(error, "No fue posible guardar la proforma."));
        return null;
      } finally {
        setPending(false);
      }
    },
    [validate, buildPayload, buildPdfData, form, showError, showSuccess]
  );

  const saveDraft = useCallback(() => save("BORRADOR"), [save]);
  const emit = useCallback(() => save("EMITIDA"), [save]);

  const downloadPdf = useCallback(async () => {
    if (!validate()) return;
    try {
      await generatePdf(buildPdfData());
    } catch (error) {
      showError(getErrorMessage(error, "No fue posible generar el PDF."));
    }
  }, [validate, buildPdfData, showError]);

  const load = useCallback(
    async (numeroOrId: string) => {
      try {
        const data = await getProforma(numeroOrId);
        savedIdRef.current = data.id;
        form.loadProforma(data);
        items.loadItems(data.items);
        return true;
      } catch (error) {
        showError(getErrorMessage(error, "No se encontró la proforma solicitada."));
        return false;
      }
    },
    [form, items, showError]
  );

  return { pending, save, saveDraft, emit, downloadPdf, load };
}
