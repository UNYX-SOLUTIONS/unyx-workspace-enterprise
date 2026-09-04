import { useCallback, useRef, useState } from "react";
import { useToast } from "../../../hooks/useToast";
import {
  createMaintenance,
  updateMaintenance,
  previewNextMaintenanceNumber,
  type MaintenanceDto,
} from "../services/maintenanceService";
import { generateMaintenancePdf } from "../utils/generateMaintenancePdf";
import type { UseMaintenanceForm } from "./useMaintenanceForm";

export interface UseMaintenanceSaveParams {
  form: UseMaintenanceForm;
}

function getErrorMessage(error: unknown, fallback: string): string {
  const apiError = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
  if (apiError) return apiError;
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useMaintenanceSave({ form }: UseMaintenanceSaveParams) {
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(false);
  const savedIdRef = useRef<string | null>(null);

  const load = useCallback(
    async (number: string): Promise<boolean> => {
      const data = await form.loadMaintenance(number);
      if (!data) {
        showError("No se encontró el mantenimiento indicado.");
        return false;
      }
      savedIdRef.current = typeof data.id === "string" ? data.id : number;
      return true;
    },
    [form, showError]
  );

  const initialize = useCallback(async (): Promise<void> => {
    await form.loadClients();

    savedIdRef.current = null;
    const nextNumber = await previewNextMaintenanceNumber();
    form.reset();
    form.setNumero(nextNumber);
  }, [form]);

  const save = useCallback(
    async (downloadPdf = false): Promise<MaintenanceDto | null> => {
      if (!form.validate()) {
        showError("Complete los campos obligatorios: cliente, marca y modelo del equipo.");
        return null;
      }

      setLoading(true);
      try {
        const data = form.buildData();

        const saved = savedIdRef.current
          ? await updateMaintenance(savedIdRef.current, data)
          : await createMaintenance(data);

        savedIdRef.current = saved.id;
        form.setNumero(saved.numero);
        form.setIsEditing(true);

        if (downloadPdf) {
          await generateMaintenancePdf({ ...data, numero: saved.numero });
        }

        showSuccess(
          downloadPdf
            ? `Mantenimiento ${saved.numero} guardado e informe generado.`
            : `Mantenimiento ${saved.numero} guardado correctamente.`
        );
        return saved;
      } catch (error) {
        showError(getErrorMessage(error, "No fue posible guardar el mantenimiento."));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [form, showError, showSuccess]
  );

  const searchMaintenance = useCallback(async () => {
    if (!form.numero.trim()) {
      showError("Ingrese el número del mantenimiento.");
      return;
    }

    setLoading(true);
    try {
      const data = await form.loadMaintenance(form.numero.trim());
      if (!data) {
        showError("No se encontró el mantenimiento indicado.");
      } else {
        savedIdRef.current = typeof data.id === "string" ? data.id : form.numero.trim();
      }
    } catch (error) {
      showError(getErrorMessage(error, "Ocurrió un error al buscar el mantenimiento."));
    } finally {
      setLoading(false);
    }
  }, [form, showError]);

  return { loading, setLoading, load, initialize, save, searchMaintenance };
}

export type UseMaintenanceSave = ReturnType<typeof useMaintenanceSave>;
