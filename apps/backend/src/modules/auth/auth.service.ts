import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import { signToken } from "../../middleware/auth.js";
import { AppError } from "../../middleware/errorHandler.js";

export interface LoginCredentials {
  email: string;
  password: string;
}

export async function login(credentials: LoginCredentials) {
  const user = await prisma.user.findUnique({ where: { email: credentials.email } });
  const passwordOk = user ? await bcrypt.compare(credentials.password, user.passwordHash) : false;

  if (!user || !passwordOk) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Credenciales inválidas");
  }

  const token = signToken(user);

  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token,
  };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "Usuario no encontrado");
  }

  const passwordOk = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!passwordOk) {
    throw new AppError(400, "INVALID_PASSWORD", "La contraseña actual no es correcta");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  return { ok: true };
}
