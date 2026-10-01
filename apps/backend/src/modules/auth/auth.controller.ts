import { type Request, type Response } from "express";
import { z } from "zod";
import * as authService from "./auth.service.js";

const loginSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(6),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8),
});

export async function login(req: Request, res: Response) {
  const credentials = loginSchema.parse(req.body);
  res.json(await authService.login(credentials));
}

export async function me(req: Request, res: Response) {
  res.json({ user: req.user });
}

export async function changePassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
  res.json(await authService.changePassword(req.user!.id, currentPassword, newPassword));
}
