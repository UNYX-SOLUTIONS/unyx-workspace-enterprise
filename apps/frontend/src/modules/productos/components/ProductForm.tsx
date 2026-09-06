import { useState, type ChangeEvent, type FormEvent } from "react";
import { InputField, LoadingSpinner } from "@/components/common";

export interface ProductFormValues {
  ref: string;
  name: string;
  price: string;
}

export interface ProductFormProps {
  initialData?: Record<string, unknown> | null;
  onSubmit: (formData: ProductFormValues) => Promise<void> | void;
  isLoading?: boolean;
}

const EMPTY: ProductFormValues = {
  ref: "",
  name: "",
  price: "",
};

export function ProductForm({ initialData = null, onSubmit, isLoading = false }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormValues>(() => ({
    ...EMPTY,
    ...(initialData
      ? {
          ref: String(initialData.ref ?? ""),
          name: String(initialData.name ?? ""),
          price: initialData.price !== undefined ? String(initialData.price) : "",
        }
      : {}),
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? parseFloat(value) || "" : value,
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

    if (!formData.ref.trim()) newErrors.ref = "Referencia requerida";
    if (!formData.name.trim()) newErrors.name = "Nombre requerido";
    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = "Precio debe ser mayor a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      setFormData({ ...EMPTY });
    } catch (error) {
      console.error("Error en el formulario:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="Referencia"
        name="ref"
        value={formData.ref}
        onChange={handleChange}
        placeholder="Ej: DS-K1T320EFX"
        error={errors.ref}
        required
      />

      <InputField
        label="Nombre del Producto"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Ej: Control de acceso facial"
        error={errors.name}
        required
      />

      <InputField
        label="Precio"
        name="price"
        type="number"
        step="0.01"
        min="0"
        value={formData.price}
        onChange={handleChange}
        placeholder="0.00"
        error={errors.price}
        required
      />

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
            <>💾 Guardar Producto</>
          )}
        </button>
      </div>
    </form>
  );
}
