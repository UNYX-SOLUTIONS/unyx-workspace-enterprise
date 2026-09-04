import { describe, expect, it, vi } from "vitest";

vi.mock("../src/config/env.js", () => ({
  env: { NODE_ENV: "production", LOG_LEVEL: "info" },
}));

import { type NextFunction, type Request, type Response } from "express";
import { ZodError, z } from "zod";
import { AppError, errorHandler } from "../src/middleware/errorHandler.js";

function mockResponse() {
  const res = {} as Response;
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

const req = {} as Request;
const next = vi.fn() as NextFunction;

describe("errorHandler", () => {
  it("devuelve el mensaje de AppError con su código", () => {
    const res = mockResponse();
    const error = new AppError(404, "PROFORMA_NOT_FOUND", "La proforma no existe");

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "La proforma no existe",
      code: "PROFORMA_NOT_FOUND",
    });
  });

  it("convierte ZodError en 400 con detalle de issues", () => {
    const res = mockResponse();
    const error = new ZodError([{ code: "invalid_type", expected: "string", received: "number", path: ["fecha"], message: "Inválido" }]);

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: "VALIDATION_ERROR", details: expect.any(Array) })
    );
  });

  it("convierte errores P2002 (duplicado) en 409", () => {
    const res = mockResponse();
    const error = Object.assign(new Error("Unique constraint"), { code: "P2002" });

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "Registro duplicado", code: "CONFLICT" });
  });

  it("convierte errores P2025 (no encontrado) en 404", () => {
    const res = mockResponse();
    const error = Object.assign(new Error("Not found"), { code: "P2025" });

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("en producción no expone el mensaje ni el stack", () => {
    const res = mockResponse();
    const error = new Error("Secreto interno: cadena de conexión");

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Error interno del servidor",
      code: "INTERNAL_ERROR",
    });
    const jsonArg = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<string, unknown>;
    expect(jsonArg.stack).toBeUndefined();
    expect(JSON.stringify(jsonArg)).not.toContain("Secreto interno");
  });
});
