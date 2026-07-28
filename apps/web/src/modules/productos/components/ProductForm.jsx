import { useState } from "react";
import {
  InputField,
  LoadingSpinner,
} from "../../../components/common";

export function ProductForm({ initialData = null, onSubmit, isLoading = false }) {
  const [formData, setFormData] = useState(
    initialData || {
      ref: "",
      name: "",  
      price: "", 
    }
  );

  const [errors, setErrors] = useState({});
 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? parseFloat(value) || "" : value,
    }));
    // Limpiar error del campo cuando se modifica
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ref.trim()) newErrors.ref = "Referencia requerida";
    if (!formData.name.trim()) newErrors.name = "Nombre requerido";  
    if (formData.price <= 0 || !formData.price) newErrors.price = "Precio debe ser mayor a 0"; 

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      setFormData({
        ref: "",
        name: "",  
        price: "", 
      });
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
          className="flex-1 px-4 py-2 bg-gradient-to-r from-[#2170e4] to-[#0058be] text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
