import { type Request, type Response } from "express";
import { z } from "zod";
import * as authService from "./auth.service.js";

const loginSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(6),
});

export async function login(req: Request, res: Response) {
  const credentials = loginSchema.parse(req.body);
  res.json(await authService.login(credentials));
}

export async function me(req: Request, res: Response) {
  res.json({ user: req.user });
}
