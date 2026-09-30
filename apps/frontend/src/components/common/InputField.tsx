import { useId, type InputHTMLAttributes } from "react";

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  inputClassName?: string;
  className?: string;
}

export default function InputField({
  label,
  error,
  required = false,
  readOnly = false,
  className = "",
  inputClassName = "",
  id,
  name,
  ...props
}: InputFieldProps) {
  const generatedId = useId();
  const inputId = id || name || `input-${generatedId}`;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-slate-900"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <input
        id={inputId}
        name={name}
        readOnly={readOnly}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`
          w-full rounded-lg border px-4 py-2 outline-none transition-all
          ${
            readOnly
              ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-600"
              : error
                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                : "border-slate-200 focus:ring-2 focus:ring-blue-500"
          }
          ${inputClassName}
        `}
        {...props}
      />

      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
