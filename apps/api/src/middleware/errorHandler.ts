import { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export class AppError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function isPrismaError(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === code
  );
}

function getErrorStatus(error: unknown): number {
  if (error instanceof AppError) return error.status;
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === "number") return status;
  }
  return 500;
}

export function notFound(req: Request, res: Response) {
  res.status(404).json({
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    code: "NOT_FOUND",
  });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error({ err: error }, "error no controlado");

  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "Datos inválidos",
      code: "VALIDATION_ERROR",
      details: error.issues,
    });
  }

  if (isPrismaError(error, "P2002")) {
    return res.status(409).json({ error: "Registro duplicado", code: "CONFLICT" });
  }

  if (isPrismaError(error, "P2025")) {
    return res.status(404).json({ error: "Registro no encontrado", code: "NOT_FOUND" });
  }

  if (error instanceof AppError) {
    return res.status(error.status).json({ error: error.message, code: error.code });
  }

  const status = getErrorStatus(error);
  if (env.NODE_ENV === "production") {
    return res.status(status).json({
      error: "Error interno del servidor",
      code: "INTERNAL_ERROR",
    });
  }

  const message = error instanceof Error ? error.message : "Error interno del servidor";
  const stack = error instanceof Error ? error.stack : undefined;

  res.status(status).json({ error: message, code: "INTERNAL_ERROR", stack });
}
