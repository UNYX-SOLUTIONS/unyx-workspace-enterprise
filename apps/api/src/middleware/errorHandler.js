import { env } from "../config/env.js";

export class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function notFound(req, res) {
  res.status(404).json({
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    code: "NOT_FOUND",
  });
}

export function errorHandler(error, _req, res, _next) {
  console.error("[error]", error);

  if (error?.name === "ZodError") {
    return res.status(400).json({
      error: "Datos inválidos",
      code: "VALIDATION_ERROR",
      details: error.issues,
    });
  }

  if (error?.code === "P2002") {
    return res.status(409).json({ error: "Registro duplicado", code: "CONFLICT" });
  }

  if (error?.code === "P2025") {
    return res.status(404).json({ error: "Registro no encontrado", code: "NOT_FOUND" });
  }

  if (error instanceof AppError) {
    return res.status(error.status).json({ error: error.message, code: error.code });
  }

  const status = error.status || 500;
  if (env.NODE_ENV === "production") {
    return res.status(status).json({
      error: "Error interno del servidor",
      code: "INTERNAL_ERROR",
    });
  }

  res.status(status).json({
    error: error.message || "Error interno del servidor",
    code: "INTERNAL_ERROR",
    stack: error.stack,
  });
}
