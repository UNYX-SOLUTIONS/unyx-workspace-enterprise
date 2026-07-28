import { Router } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Correo requerido" });
  const user = { id: "demo", email, role: "ADMIN" };
  const token = jwt.sign(user, env.JWT_SECRET, { expiresIn: "8h" });
  res.json({ user, token });
});
