import { api } from "@/config/api";

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export async function changePassword(input: ChangePasswordInput): Promise<{ ok: boolean }> {
  const { data } = await api.post<{ ok: boolean }>("/auth/change-password", input);
  return data;
}
