import { describe, expect, it } from "vitest";
import { createProformaSchema, updateProformaSchema } from "../src/modules/proformas/proformas.validation.js";

const validPayload = {
  cliente: { nombre: "Cliente de prueba", ruc: "0993406012001" },
  fecha: "2026-09-03",
  validezDias: 30,
  notas: "",
  estado: "EMITIDA",
  items: [{ codigo: "P-01", descripcion: "Producto A", cantidad: 2, precio: 15.5 }],
};

describe("createProformaSchema", () => {
  it("acepta un payload válido con cliente en línea", () => {
    const result = createProformaSchema.parse(validPayload);
    expect(result.estado).toBe("EMITIDA");
    expect(result.items).toHaveLength(1);
  });

  it("acepta un payload con clienteId en lugar de datos del cliente", () => {
    const { cliente, ...rest } = validPayload;
    void cliente;
    const result = createProformaSchema.parse({ ...rest, clienteId: "cliente-123" });
    expect(result.clienteId).toBe("cliente-123");
  });

  it("rechaza un payload sin cliente ni clienteId", () => {
    const { cliente, ...rest } = validPayload;
    void cliente;
    expect(() => createProformaSchema.parse(rest)).toThrow();
  });

  it("rechaza un payload sin ítems", () => {
    expect(() => createProformaSchema.parse({ ...validPayload, items: [] })).toThrow();
  });

  it("rechaza estados desconocidos", () => {
    expect(() => createProformaSchema.parse({ ...validPayload, estado: "ANULADA" })).toThrow();
  });

  it("rechaza cantidades negativas", () => {
    const items = [{ codigo: "P-01", descripcion: "Producto A", cantidad: -1, precio: 15.5 }];
    expect(() => createProformaSchema.parse({ ...validPayload, items })).toThrow();
  });
});

describe("updateProformaSchema", () => {
  it("acepta actualizaciones parciales", () => {
    const result = updateProformaSchema.parse({ estado: "ACEPTADA" });
    expect(result.estado).toBe("ACEPTADA");
  });

  it("acepta un objeto vacío (sin cambios)", () => {
    expect(updateProformaSchema.parse({})).toEqual({});
  });
});
