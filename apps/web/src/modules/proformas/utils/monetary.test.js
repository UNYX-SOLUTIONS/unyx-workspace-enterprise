import { describe, expect, it } from "vitest";
import {
  calculateTotals,
  formatCurrency,
  lineTotalCents,
  toCents,
  validateMonetary,
} from "./monetary";

describe("toCents", () => {
  it("convierte strings con dos decimales", () => {
    expect(toCents("12.34")).toBe(1234);
  });

  it("convierte números", () => {
    expect(toCents(0.5)).toBe(50);
  });

  it("devuelve 0 para valores vacíos", () => {
    expect(toCents("")).toBe(0);
    expect(toCents(null)).toBe(0);
    expect(toCents(undefined)).toBe(0);
  });
});

describe("lineTotalCents", () => {
  it("calcula el total de línea en centavos", () => {
    expect(lineTotalCents("2.5", "12.34")).toBe(3085);
  });
});

describe("calculateTotals", () => {
  it("calcula subtotal, IVA 15% y total en centavos", () => {
    const totals = calculateTotals([
      { cantidad: 2, precio: 10 },
      { cantidad: 1, precio: 5.5 },
    ]);
    expect(totals.subtotalCents).toBe(2550);
    expect(totals.ivaCents).toBe(383);
    expect(totals.totalCents).toBe(2933);
  });

  it("redondea el total de línea a centavos", () => {
    const totals = calculateTotals([{ cantidad: 2, precio: 0.105 }]);
    expect(totals.subtotalCents).toBe(22);
  });

  it("devuelve cero con lista vacía", () => {
    const totals = calculateTotals([]);
    expect(totals.totalCents).toBe(0);
  });
});

describe("formatCurrency", () => {
  it("formatea centavos como moneda USD", () => {
    expect(formatCurrency(2933)).toContain("29,33");
  });
});

describe("validateMonetary", () => {
  it("acepta valores válidos", () => {
    expect(validateMonetary("10.99")).toBe(true);
    expect(validateMonetary(0)).toBe(true);
  });

  it("rechaza valores inválidos", () => {
    expect(validateMonetary("abc")).toBe(false);
    expect(validateMonetary(-1)).toBe(false);
    expect(validateMonetary("10.999")).toBe(false);
    expect(validateMonetary("")).toBe(false);
  });
});
