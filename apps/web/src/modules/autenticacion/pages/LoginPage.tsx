import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../hooks/useToast";

import ActionButton from "../../../components/common/ActionButton";
import InputField from "../../../components/common/InputField";

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { email: "admin@unyxsolutions.com", password: "" },
  });

  const { login, user, loading } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    try {
      const loggedUser = await login(values);
      showSuccess(`Bienvenido, ${loggedUser.name || loggedUser.email}`);
      navigate("/dashboard");
    } catch (error) {
      const apiError = (error as { response?: { data?: { error?: string } } })?.response?.data
        ?.error;
      showError(apiError || "No fue posible iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow"
      >
        <h1 className="text-2xl font-bold">UNYX Workspace</h1>

        <InputField
          label="Correo"
          type="email"
          error={errors.email?.message}
          {...register("email", { required: "El correo es requerido" })}
        />

        <InputField
          label="Contraseña"
          type="password"
          error={errors.password?.message}
          {...register("password", { required: "La contraseña es requerida" })}
        />

        <ActionButton
          label={submitting ? "Ingresando..." : "Ingresar"}
          disabled={submitting}
          className="w-full"
          type="submit"
        />
      </form>
    </main>
  );
}
