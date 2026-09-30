import { describe, expect, it } from "vitest";
import {
  PROFORMA_ESTADOS,
  PROFORMA_STATUS_MAP,
  getProformaStatusMeta,
} from "./statusMap";

describe("PROFORMA_ESTADOS", () => {
  it("expone los 5 estados del ciclo, todos reversibles", () => {
    expect(PROFORMA_ESTADOS).toEqual([
      "BORRADOR",
      "ENVIADA",
      "ACEPTADA",
      "CANCELADA",
      "EXPIRADA",
    ]);
  });
});

describe("getProformaStatusMeta", () => {
  it("resuelve los estados con label, dot y badge", () => {
    for (const estado of PROFORMA_ESTADOS) {
      const meta = getProformaStatusMeta(estado);
      expect(meta.label).toBe(estado);
      expect(meta.dot).toBeTruthy();
      expect(meta.badge).toBeTruthy();
    }
  });

  it("marca CANCELADA y EXPIRADA como reversibles", () => {
    expect(getProformaStatusMeta("CANCELADA").reversible).toBe(true);
    expect(getProformaStatusMeta("EXPIRADA").reversible).toBe(true);
    expect(getProformaStatusMeta("ACEPTADA").reversible).toBeUndefined();
  });

  it("devuelve un fallback para estados desconocidos o vacíos", () => {
    expect(getProformaStatusMeta("DESCONOCIDO").label).toBe("DESCONOCIDO");
    expect(getProformaStatusMeta(undefined).label).toBe("DESCONOCIDO");
  });

  it("expone el mapa completo", () => {
    expect(Object.keys(PROFORMA_STATUS_MAP)).toHaveLength(5);
  });
});
