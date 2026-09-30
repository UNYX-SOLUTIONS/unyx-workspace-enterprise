import { describe, expect, it } from "vitest";
import {
  PROFORMA_STATUS_MAP,
  getProformaStatusMeta,
  getProformaTransitions,
} from "./statusMap";

describe("getProformaStatusMeta", () => {
  it("resuelve los estados del flujo", () => {
    expect(getProformaStatusMeta("BORRADOR").label).toBe("Borrador");
    expect(getProformaStatusMeta("EMITIDA").label).toBe("Emitida");
    expect(getProformaStatusMeta("ENVIADA").label).toBe("Enviada");
    expect(getProformaStatusMeta("APROBADA").label).toBe("Aprobada");
    expect(getProformaStatusMeta("CANCELADA").label).toBe("Cancelada");
  });

  it("devuelve un fallback para estados desconocidos o vacíos", () => {
    expect(getProformaStatusMeta("DESCONOCIDO").label).toBe("DESCONOCIDO");
    expect(getProformaStatusMeta(undefined).label).toBe("Desconocido");
    expect(getProformaStatusMeta(null).label).toBe("Desconocido");
  });

  it("expone el mapa completo", () => {
    expect(Object.keys(PROFORMA_STATUS_MAP)).toHaveLength(5);
  });
});

describe("getProformaTransitions", () => {
  it("permite avanzar en el flujo y cancelar", () => {
    expect(getProformaTransitions("BORRADOR")).toEqual(["BORRADOR", "EMITIDA", "CANCELADA"]);
    expect(getProformaTransitions("EMITIDA")).toEqual(["EMITIDA", "ENVIADA", "CANCELADA"]);
    expect(getProformaTransitions("ENVIADA")).toEqual(["ENVIADA", "APROBADA", "CANCELADA"]);
    expect(getProformaTransitions("APROBADA")).toEqual(["APROBADA", "CANCELADA"]);
  });

  it("no permite salir de CANCELADA", () => {
    expect(getProformaTransitions("CANCELADA")).toEqual(["CANCELADA"]);
  });

  it("devuelve el estado actual si es desconocido", () => {
    expect(getProformaTransitions("RARO")).toEqual(["RARO"]);
  });
});
