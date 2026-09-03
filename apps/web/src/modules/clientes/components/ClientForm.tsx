import { useState, type ChangeEvent, type FormEvent } from "react";

import { InputField, LoadingSpinner } from "../../../components/common";

export interface ClientFormValues {
  nombre: string;
  ruc: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  estado: string;
}

export interface ClientFormProps {
  initialData?: Record<string, unknown> | null;
  onSubmit: (formData: ClientFormValues) => Promise<void> | void;
  isLoading?: boolean;
}

const EMPTY: ClientFormValues = {
  nombre: "",
  ruc: "",
  email: "",
  telefono: "",
  direccion: "",
  ciudad: "Guayaquil",
  estado: "Activo",
};

export function ClientForm({ initialData = null, onSubmit, isLoading = false }: ClientFormProps) {
  const [formData, setFormData] = useState<ClientFormValues>(() => ({
    ...EMPTY,
    ...(initialData
      ? {
          nombre: String(initialData.nombre ?? ""),
          ruc: String(initialData.ruc ?? ""),
          email: String(initialData.email ?? ""),
          telefono: String(initialData.telefono ?? ""),
          direccion: String(initialData.direccion ?? ""),
          ciudad: String(initialData.ciudad ?? "Guayaquil"),
          estado: String(initialData.estado ?? "Activo"),
        }
      : {}),
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) newErrors.nombre = "Nombre requerido";
    if (!formData.ruc.trim()) newErrors.ruc = "RUC / identificación requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit(formData);

      setFormData({ ...EMPTY });
    } catch (error) {
      console.error("Error en formulario de cliente:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="Nombre / Razón Social"
        name="nombre"
        value={formData.nombre}
        onChange={handleChange}
        placeholder="Ej: UNYX SOLUTIONS S.A.S."
        error={errors.nombre}
        required
      />

      <InputField
        label="RUC / Identificación"
        name="ruc"
        value={formData.ruc}
        onChange={handleChange}
        placeholder="Ej: 0993406012001"
        error={errors.ruc}
        required
      />

      <InputField
        label="Correo"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="cliente@empresa.com"
      />

      <InputField
        label="Teléfono"
        name="telefono"
        value={formData.telefono}
        onChange={handleChange}
        placeholder="+593 99 999 9999"
      />

      <InputField
        label="Ciudad"
        name="ciudad"
        value={formData.ciudad}
        onChange={handleChange}
        placeholder="Guayaquil"
      />

      <InputField
        label="Dirección"
        name="direccion"
        value={formData.direccion}
        onChange={handleChange}
        placeholder="Dirección del cliente"
      />

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[#010105]">Estado</label>
        <select
          name="estado"
          value={formData.estado}
          onChange={handleChange}
          className="w-full rounded-lg border border-[#c7c6cb] px-4 py-2 outline-none focus:ring-2 focus:ring-[#2170e4]"
        >
          <option value="Activo">Activo</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>

      <div className="flex gap-3 pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#2170e4] to-[#0058be] px-4 py-2 font-bold text-white transition-all hover:shadow-lg disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              Guardando...
            </>
          ) : (
            <>💾 Guardar Cliente</>
          )}
        </button>
      </div>
    </form>
  );
}
