import { describe, expect, it } from "vitest";
import { getProformaStatusMeta, PROFORMA_STATUS_MAP } from "@/modules/common/utils/statusMap";

describe("getProformaStatusMeta", () => {
  it("resuelve los estados del enum", () => {
    expect(getProformaStatusMeta("EMITIDA").label).toBe("Emitida");
    expect(getProformaStatusMeta("ACEPTADA").label).toBe("Aceptada");
    expect(getProformaStatusMeta("CERRADA").label).toBe("Cerrada");
    expect(getProformaStatusMeta("BORRADOR").label).toBe("Borrador");
  });

  it("devuelve un fallback para estados desconocidos o vacíos", () => {
    expect(getProformaStatusMeta("DESCONOCIDO").label).toBe("DESCONOCIDO");
    expect(getProformaStatusMeta(undefined).label).toBe("Desconocido");
    expect(getProformaStatusMeta(null).label).toBe("Desconocido");
  });

  it("expone el mapa completo", () => {
    expect(Object.keys(PROFORMA_STATUS_MAP)).toHaveLength(4);
  });
});
