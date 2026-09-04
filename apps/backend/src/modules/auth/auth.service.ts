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
