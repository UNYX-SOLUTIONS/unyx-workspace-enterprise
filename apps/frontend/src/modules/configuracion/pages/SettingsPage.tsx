import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, LogOut, Palette, ShieldCheck, UserRound } from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import Card from "@/components/common/Card";
import InputField from "@/components/common/InputField";
import ThemeOptions from "@/components/layout/ThemeOptions";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { changePassword } from "@/modules/configuracion/services/profileService";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword.length < 8) {
      showError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("La confirmación no coincide con la nueva contraseña.");
      return;
    }

    try {
      setSaving(true);
      await changePassword({ currentPassword, newPassword });
      showSuccess("Contraseña actualizada correctamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const apiError = (error as { response?: { data?: { error?: string } } })?.response?.data
        ?.error;
      showError(apiError || "No fue posible cambiar la contraseña.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Configuración"
        subtitle="Administra tu perfil, la seguridad de tu cuenta y las preferencias de la aplicación."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card hover={false} className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <UserRound className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
              Configuración del perfil
            </h2>
          </div>

          <div className="space-y-4">
            <InputField label="Nombre" value={user?.name || ""} readOnly />
            <InputField label="Correo" value={user?.email || ""} readOnly />
            <InputField
              label="Rol"
              value={user?.role === "ADMIN" ? "Administrador" : (user?.role || "")}
              readOnly
            />
          </div>
        </Card>

        <Card hover={false} className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              <Palette className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
              Apariencia
            </h2>
          </div>

          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
            Elige cómo quieres ver la aplicación.
          </p>
          <ThemeOptions />
        </Card>

        <Card hover={false} className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
              Seguridad
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Contraseña actual"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
            <InputField
              label="Nueva contraseña"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
            />
            <InputField
              label="Confirmar nueva contraseña"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />

            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
            >
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              {saving ? "Guardando..." : "Cambiar contraseña"}
            </button>
          </form>
        </Card>

        <Card hover={false} className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
              Sesión
            </h2>
          </div>

          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
            Cierra tu sesión en este dispositivo. Deberás iniciar sesión nuevamente.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Cerrar sesión
          </button>
        </Card>
      </div>
    </div>
  );
}
