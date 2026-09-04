import InputField from "../../../components/common/InputField";
import type { DiagnosticState } from "../hooks/useMaintenanceForm";

export interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export const TextArea = ({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 4,
}: TextAreaProps) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold !text-[#111827]">{label}</span>

    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="
        w-full resize-y rounded-lg
        border border-[#c7c6cb] bg-white
        p-3 !text-[#111827]
        placeholder:!text-[#6b7280]
        outline-none transition-all
        focus:border-[#2170e4]
        focus:ring-2 focus:ring-[#2170e4]
      "
    />
  </label>
);

export interface DiagnosticFieldsProps {
  value: DiagnosticState;
  onChange: (value: DiagnosticState) => void;
  includeCondition?: boolean;
}

export function DiagnosticFields({
  value,
  onChange,
  includeCondition = false,
}: DiagnosticFieldsProps) {
  const update = (field: keyof DiagnosticState, nextValue: string) => {
    onChange({
      ...value,
      [field]: nextValue,
    });
  };

  const fields: Array<[keyof DiagnosticState, string, string]> = [
    ["tiempoEncendido", "Tiempo de encendido", "Ej: 45 segundos"],
    ["usoCpu", "CPU en reposo", "Ej: 8 %"],
    ["usoRam", "RAM en reposo", "Ej: 4.2 GB / 8 GB"],
    ["usoDisco", "Disco en reposo", "Ej: 3 %"],
    ["espacioDisponible", "Espacio disponible", "Ej: 120 GB"],
    ["temperaturaReposo", "Temperatura en reposo", "Ej: 48 °C"],
    ["temperaturaMaxima", "Temperatura máxima", "Ej: 82 °C"],
  ];

  if (includeCondition) {
    fields.push(
      ["estadoDisco", "Estado del disco", "Ej: Bueno, 92 % de vida"],
      ["estadoBateria", "Estado de la batería", "Ej: 18 % de desgaste"],
      ["condicionFisica", "Condición física", "Ej: Operativa con desgaste"]
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {fields.map(([field, label, placeholder]) => (
        <InputField
          key={field}
          label={label}
          value={value[field] || ""}
          placeholder={placeholder}
          onChange={(event) => update(field, event.target.value)}
        />
      ))}
    </div>
  );
}
