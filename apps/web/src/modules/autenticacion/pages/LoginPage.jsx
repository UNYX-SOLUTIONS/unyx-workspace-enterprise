import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import ActionButton from "../../../components/common/ActionButton";

export default function LoginPage() {
  const { register, handleSubmit } = useForm({ defaultValues: { email: "admin@unyxsolutions.com" } });
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    await login(values);
    navigate("/dashboard");
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm rounded-xl bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold">UNYX Workspace</h1>
        <label className="mb-2 block text-sm font-medium">Correo</label>
        <input {...register("email")} className="mb-4 w-full rounded-lg border px-3 py-2" />
        <ActionButton label="Ingresar" className="w-full" />
      </form>
    </main>
  );
}
