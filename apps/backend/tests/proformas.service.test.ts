import { describe, expect, it, vi, beforeEach } from "vitest";

const prismaMock = vi.hoisted(() => {
  const mock = {
    proforma: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      groupBy: vi.fn(),
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
  getMonthlyStats,
  getProformaStats,
  previewNextProformaNumber,
  updateProforma,
} from "../src/modules/proformas/proformas.service.js";

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

  it("permite cualquier transición de estado, sin flujo secuencial", async () => {
    prismaMock.proforma.update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: "p1",
      numero: "00000001",
      estado: data.estado,
      items: [],
    }));

    const cases: Array<[string, string]> = [
      ["BORRADOR", "ACEPTADA"],
      ["ENVIADA", "BORRADOR"],
      ["ACEPTADA", "EXPIRADA"],
      ["CANCELADA", "ACEPTADA"],
      ["EXPIRADA", "ENVIADA"],
    ];

    for (const [from, to] of cases) {
      prismaMock.proforma.findFirst.mockResolvedValue({
        id: "p1",
        numero: "00000001",
        estado: from,
        cliente: { id: "client-1" },
        items: [],
      });

      await expect(updateProforma("00000001", { estado: to as never })).resolves.toMatchObject({
        estado: to,
      });
    }
  });

  it("una proforma CANCELADA sigue siendo editable (notas y estado)", async () => {
    prismaMock.proforma.findFirst.mockResolvedValue({
      id: "p1",
      numero: "00000001",
      estado: "CANCELADA",
      cliente: { id: "client-1" },
      items: [],
    });
    prismaMock.proforma.update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: "p1",
      numero: "00000001",
      estado: data.estado ?? "CANCELADA",
      notas: data.notas,
      items: [],
    }));

    await expect(
      updateProforma("00000001", { notas: "Reactivada por el cliente", estado: "ACEPTADA" })
    ).resolves.toMatchObject({ estado: "ACEPTADA" });
  });

  it("lanza 404 cuando la proforma no existe", async () => {
    prismaMock.proforma.findFirst.mockResolvedValue(null);

    await expect(updateProforma("99999999", { notas: "x" })).rejects.toMatchObject({
      status: 404,
      code: "PROFORMA_NOT_FOUND",
    });
  });
});

describe("getProformaStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("agrega por estado y calcula tasa de aceptación y ticket promedio", async () => {
    prismaMock.proforma.groupBy.mockResolvedValue([
      { estado: "BORRADOR", _count: { _all: 2 }, _sum: { total: 100 } },
      { estado: "ENVIADA", _count: { _all: 3 }, _sum: { total: 300 } },
      { estado: "ACEPTADA", _count: { _all: 2 }, _sum: { total: 400 } },
      { estado: "CANCELADA", _count: { _all: 1 }, _sum: { total: 50 } },
    ]);

    const stats = await getProformaStats();

    expect(stats.totalProformas).toBe(8);
    expect(stats.aceptadas).toEqual({ count: 2, monto: 400 });
    expect(stats.expiradas).toEqual({ count: 0, monto: 0 });
    expect(stats.emitidas).toBe(6);
    expect(stats.tasaAceptacion).toBe(33.3);
    expect(stats.ticketPromedio).toBe(200);
  });

  it("devuelve ceros sin proformas y no divide por cero", async () => {
    prismaMock.proforma.groupBy.mockResolvedValue([]);

    const stats = await getProformaStats();

    expect(stats.totalProformas).toBe(0);
    expect(stats.tasaAceptacion).toBe(0);
    expect(stats.ticketPromedio).toBe(0);
  });

  it("soporta montos Decimal (objetos con toString) del sum de Prisma", async () => {
    prismaMock.proforma.groupBy.mockResolvedValue([
      { estado: "ACEPTADA", _count: { _all: 2 }, _sum: { total: { toString: () => "250.75" } } },
    ]);

    const stats = await getProformaStats();

    expect(stats.aceptadas.monto).toBe(250.75);
    expect(stats.ticketPromedio).toBe(125.38);
  });
});

describe("getMonthlyStats", () => {
  it("rellena con ceros los meses sin datos y ubica los montos por estado", async () => {
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    prismaMock.$queryRaw.mockResolvedValue([
      { mes: currentKey, estado: "ACEPTADA", count: 2, monto: 300 },
      { mes: currentKey, estado: "ENVIADA", count: 1, monto: 120.5 },
    ]);

    const rows = await getMonthlyStats(3);

    expect(rows).toHaveLength(3);
    const last = rows[rows.length - 1];
    expect(last.mes).toBe(currentKey);
    expect(last.aceptadas).toEqual({ count: 2, monto: 300 });
    expect(last.enviadas).toEqual({ count: 1, monto: 120.5 });
    expect(last.canceladas).toEqual({ count: 0, monto: 0 });
    expect(rows[0].aceptadas).toEqual({ count: 0, monto: 0 });
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
