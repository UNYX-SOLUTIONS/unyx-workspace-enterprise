import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../src/config/env.js", () => ({
  env: { JWT_SECRET: "test-secret-very-long-enough-123" },
}));

vi.mock("../src/config/prisma.js", () => {
  const prisma = { user: { findUnique: vi.fn() } };
  return { prisma };
});

import jwt from "jsonwebtoken";
import { requireAuth, requireRole, signToken } from "../src/middleware/auth.js";
import { prisma } from "../src/config/prisma.js";

function mockRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rechaza peticiones sin token", async () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = vi.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rechaza tokens inválidos", async () => {
    const req = { headers: { authorization: "Bearer token-falso" } };
    const res = mockRes();
    const next = vi.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rechaza tokens válidos de usuarios inexistentes", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const token = signToken({ id: "user-1", email: "a@b.c", role: "ADMIN" });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = vi.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("adjunta el usuario sin exponer el hash de contraseña", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "admin@unyxsolutions.com",
      name: "Admin",
      role: "ADMIN",
      passwordHash: "hash-secreto",
    });
    const token = signToken({ id: "user-1", email: "admin@unyxsolutions.com", role: "ADMIN" });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = vi.fn();

    await requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({
      id: "user-1",
      email: "admin@unyxsolutions.com",
      name: "Admin",
      role: "ADMIN",
    });
    expect(req.user.passwordHash).toBeUndefined();
  });
});

describe("requireRole", () => {
  it("permite el acceso con el rol requerido", () => {
    const middleware = requireRole("ADMIN");
    const req = { user: { role: "ADMIN" } };
    const res = mockRes();
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("deniega el acceso con un rol distinto", () => {
    const middleware = requireRole("ADMIN");
    const req = { user: { role: "COMERCIAL" } };
    const res = mockRes();
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
