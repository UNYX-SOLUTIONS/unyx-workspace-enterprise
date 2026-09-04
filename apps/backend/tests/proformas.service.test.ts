import { describe, expect, it, vi, beforeEach } from "vitest";

const prismaMock = vi.hoisted(() => {
  const mock = {
    proforma: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    client: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    proformaItem: {
      deleteMany: vi.fn(),
    },
    sequence: {
      findUnique: vi.fn(),
    },
    $queryRaw: vi.fn(),
    $transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => callback(mock)),
  };
  return mock;
});

vi.mock("../src/config/prisma.js", () => ({
  prisma: prismaMock,
}));

import {
  createProforma,
  deleteProforma,
  formatProformaNumber,
  previewNextProformaNumber,
  updateProforma,
} from "../src/modules/proformas/proformas.service.js";
import { AppError } from "../src/middleware/errorHandler.js";

const baseInput = {
  cliente: { nombre: "Cliente de prueba", ruc: "0993406012001" },
  fecha: "2026-09-03",
  validezDias: 30,
  notas: "",
  estado: "EMITIDA" as const,
  items: [
    { codigo: "P-01", descripcion: "Producto A", cantidad: 2, precio: 10 },
    { codigo: "P-02", descripcion: "Producto B", cantidad: 1, precio: 3 },
  ],
};

describe("formatProformaNumber", () => {
  it("rellena con ceros hasta 8 dígitos", () => {
    expect(formatProformaNumber(1)).toBe("00000001");
    expect(formatProformaNumber(123)).toBe("00000123");
  });
});

describe("previewNextProformaNumber", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve el siguiente número sin consumir la secuencia", async () => {
    prismaMock.sequence.findUnique.mockResolvedValue({ key: "proforma", value: 5 });

    await expect(previewNextProformaNumber()).resolves.toBe("00000006");
  });

  it("devuelve 1 cuando la secuencia no existe", async () => {
    prismaMock.sequence.findUnique.mockResolvedValue(null);

    await expect(previewNextProformaNumber()).resolves.toBe("00000001");
  });
});

describe("createProforma", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("genera el número, resuelve el cliente y recalcula totales en servidor", async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ value: 7 }]);
    prismaMock.client.findUnique.mockResolvedValue(null);
    prismaMock.client.create.mockResolvedValue({ id: "client-1", nombre: "Cliente de prueba" });
    prismaMock.proforma.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: "proforma-1",
      numero: data.numero,
      cliente: { id: "client-1" },
      items: [],
    }));

    const result = await createProforma(baseInput, "user-1");

    const createArgs = prismaMock.proforma.create.mock.calls[0][0] as {
      data: Record<string, unknown>;
    };

    expect(createArgs.data.numero).toBe("00000007");
    expect(createArgs.data.sequenceNumber).toBe(7);
    expect(createArgs.data.estado).toBe("EMITIDA");
    expect(createArgs.data.createdById).toBe("user-1");
    expect(createArgs.data.clientId).toBe("client-1");

    const subtotal = String(createArgs.data.subtotal);
    const iva = String(createArgs.data.iva);
    const total = String(createArgs.data.total);
    expect(subtotal).toBe("23");
    expect(iva).toBe("3.45");
    expect(total).toBe("26.45");

    expect(result.numero).toBe("00000007");
  });

  it("usa el cliente existente por RUC sin duplicarlo", async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ value: 1 }]);
    prismaMock.client.findUnique.mockResolvedValue({ id: "client-existente" });
    prismaMock.proforma.create.mockResolvedValue({ id: "p", numero: "00000001" });

    await createProforma(baseInput, "user-1");

    expect(prismaMock.client.create).not.toHaveBeenCalled();
    const createArgs = prismaMock.proforma.create.mock.calls[0][0] as {
      data: Record<string, unknown>;
    };
    expect(createArgs.data.clientId).toBe("client-existente");
  });
});

describe("updateProforma", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("recalcula totales y reemplaza ítems al actualizar", async () => {
    prismaMock.proforma.findFirst.mockResolvedValue({
      id: "p1",
      numero: "00000001",
      estado: "EMITIDA",
      cliente: { id: "client-1" },
      items: [],
    });
    prismaMock.proformaItem.deleteMany.mockResolvedValue({ count: 2 });
    prismaMock.proforma.update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: "p1",
      numero: "00000001",
      estado: data.estado,
      items: [],
    }));

    await updateProforma("00000001", {
      items: [{ descripcion: "Producto C", cantidad: 3, precio: 10 }],
      estado: "EMITIDA",
    });

    const updateArgs = prismaMock.proforma.update.mock.calls[0][0] as {
      data: Record<string, unknown>;
    };
    expect(String(updateArgs.data.subtotal)).toBe("30");
    expect(String(updateArgs.data.iva)).toBe("4.5");
    expect(String(updateArgs.data.total)).toBe("34.5");
    expect(prismaMock.proformaItem.deleteMany).toHaveBeenCalledWith({
      where: { proformaId: "p1" },
    });
  });

  it("rechaza transiciones de estado inválidas", async () => {
    prismaMock.proforma.findFirst.mockResolvedValue({
      id: "p1",
      numero: "00000001",
      estado: "EMITIDA",
      cliente: { id: "client-1" },
      items: [],
    });

    await expect(
      updateProforma("00000001", { estado: "BORRADOR" })
    ).rejects.toThrow(AppError);

    await expect(
      updateProforma("00000001", { estado: "BORRADOR" })
    ).rejects.toMatchObject({ code: "INVALID_STATUS_TRANSITION" });
  });

  it("lanza 404 cuando la proforma no existe", async () => {
    prismaMock.proforma.findFirst.mockResolvedValue(null);

    await expect(updateProforma("99999999", { notas: "x" })).rejects.toMatchObject({
      status: 404,
      code: "PROFORMA_NOT_FOUND",
    });
  });
});

describe("deleteProforma", () => {
  it("aplica borrado lógico con deletedAt", async () => {
    prismaMock.proforma.findFirst.mockResolvedValue({
      id: "p1",
      numero: "00000001",
      estado: "BORRADOR",
    });
    prismaMock.proforma.update.mockResolvedValue({ id: "p1" });

    const result = await deleteProforma("00000001");

    expect(prismaMock.proforma.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "p1" },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      })
    );
    expect(result).toEqual({ id: "p1", numero: "00000001" });
  });
});
