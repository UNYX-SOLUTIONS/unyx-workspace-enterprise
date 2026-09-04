import jwt, { type JwtPayload } from "jsonwebtoken";
import { type NextFunction, type Request, type RequestHandler, type Response } from "express";
import type { User, UserRole } from "@prisma/client";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";

export function signToken(user: Pick<User, "id" | "email" | "role">): string {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: "8h" }
  );
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No autorizado" });

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }

  if (typeof payload.sub !== "string") {
    return res.status(401).json({ message: "Token inválido" });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) return res.status(401).json({ message: "Usuario no encontrado" });

  req.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  next();
}

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "No tienes permisos para esta acción" });
    }
    next();
  };
}
