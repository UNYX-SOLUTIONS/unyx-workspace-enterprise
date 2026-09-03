import { useCallback, useState } from "react";

const TODAY = () => new Date().toISOString().split("T")[0];

const EMPTY_CLIENT = {
  nombre: "",
  ruc: "",
  direccion: "",
  telefono: "",
  ciudad: "Guayaquil",
};

export function useProformaForm() {
  const [numero, setNumero] = useState("");
  const [fecha, setFecha] = useState(TODAY());
  const [validezDias, setValidezDias] = useState(30);
  const [notas, setNotas] = useState("");
  const [estado, setEstado] = useState("BORRADOR");
  const [cliente, setCliente] = useState({ ...EMPTY_CLIENT });
  const [clienteId, setClienteId] = useState(null);

  const setField = useCallback((field, value) => {
    const setters = {
      fecha: setFecha,
      validezDias: setValidezDias,
      notas: setNotas,
    };
    if (setters[field]) setters[field](value);
  }, []);

  const selectCliente = useCallback((client) => {
    setCliente({
      nombre: client.nombre || "",
      ruc: client.ruc || "",
      direccion: client.direccion || "",
      telefono: client.telefono || "",
      ciudad: client.ciudad || "Guayaquil",
    });
    setClienteId(client.id || null);
  }, []);

  const updateCliente = useCallback((field, value) => {
    setCliente((current) => ({ ...current, [field]: value }));
    setClienteId(null);
  }, []);

  const loadProforma = useCallback((data) => {
    setNumero(data.numero || "");
    setFecha(data.fecha ? String(data.fecha).slice(0, 10) : TODAY());
    setValidezDias(Number(data.validezDias || 30));
    setNotas(data.notas || "");
    setEstado(data.estado || "BORRADOR");
    setCliente({ ...EMPTY_CLIENT, ...(data.cliente || {}) });
    setClienteId(data.cliente?.id || null);
  }, []);

  const reset = useCallback((nextNumero) => {
    setNumero(nextNumero || "");
    setFecha(TODAY());
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
