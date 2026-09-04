import { useCallback, useState } from "react";
import { todayIso } from "@/modules/common/utils/dateHelpers";
import type { ProformaDto } from "@/modules/proformas/services/proformaService";

export interface ClienteFormState {
  nombre: string;
  ruc: string;
  direccion: string;
  telefono: string;
  ciudad: string;
}

export interface ClienteSelector {
  id?: string | null;
  nombre?: string | null;
  ruc?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  ciudad?: string | null;
}

const EMPTY_CLIENT: ClienteFormState = {
  nombre: "",
  ruc: "",
  direccion: "",
  telefono: "",
  ciudad: "Guayaquil",
};

export type ProformaFormField = "fecha" | "validezDias" | "notas";

export function useProformaForm() {
  const [numero, setNumero] = useState("");
  const [fecha, setFecha] = useState(todayIso());
  const [validezDias, setValidezDias] = useState(30);
  const [notas, setNotas] = useState("");
  const [estado, setEstado] = useState("BORRADOR");
  const [cliente, setCliente] = useState<ClienteFormState>({ ...EMPTY_CLIENT });
  const [clienteId, setClienteId] = useState<string | null>(null);

  const setField = useCallback((field: ProformaFormField, value: string | number) => {
    const setters: Record<ProformaFormField, (next: string | number) => void> = {
      fecha: (next) => setFecha(String(next)),
      validezDias: (next) => setValidezDias(Number(next) || 0),
      notas: (next) => setNotas(String(next)),
    };
    setters[field](value);
  }, []);

  const selectCliente = useCallback((client: ClienteSelector) => {
    setCliente({
      nombre: client.nombre || "",
      ruc: client.ruc || "",
      direccion: client.direccion || "",
      telefono: client.telefono || "",
      ciudad: client.ciudad || "Guayaquil",
    });
    setClienteId(client.id || null);
  }, []);

  const updateCliente = useCallback((field: keyof ClienteFormState, value: string) => {
    setCliente((current) => ({ ...current, [field]: value }));
    setClienteId(null);
  }, []);

  const loadProforma = useCallback((data: Pick<ProformaDto, "numero" | "fecha" | "validezDias" | "notas" | "estado" | "cliente">) => {
    setNumero(data.numero || "");
    setFecha(data.fecha ? String(data.fecha).slice(0, 10) : todayIso());
    setValidezDias(Number(data.validezDias || 30));
    setNotas(data.notas || "");
    setEstado(data.estado || "BORRADOR");
    setCliente({
      nombre: data.cliente?.nombre || "",
      ruc: data.cliente?.ruc || "",
      direccion: data.cliente?.direccion || "",
      telefono: data.cliente?.telefono || "",
      ciudad: data.cliente?.ciudad || "Guayaquil",
    });
    setClienteId(data.cliente?.id || null);
  }, []);

  const reset = useCallback((nextNumero: string) => {
    setNumero(nextNumero || "");
    setFecha(todayIso());
    setValidezDias(30);
    setNotas("");
    setEstado("BORRADOR");
    setCliente({ ...EMPTY_CLIENT });
    setClienteId(null);
  }, []);

  return {
    numero,
    setNumero,
    fecha,
    validezDias,
    notas,
    estado,
    setEstado,
    cliente,
    clienteId,
    setField,
    selectCliente,
    updateCliente,
    loadProforma,
    reset,
  };
}

export type UseProformaForm = ReturnType<typeof useProformaForm>;
