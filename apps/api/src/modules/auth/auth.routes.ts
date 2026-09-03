import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { requireAuth, signToken } from "../../middleware/auth.js";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(6),
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  const passwordOk = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !passwordOk) {
    return res.status(401).json({ error: "Credenciales inválidas", code: "INVALID_CREDENTIALS" });
  }

  const token = signToken(user);
  res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token,
  });
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});
