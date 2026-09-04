import { describe, expect, it } from "vitest";
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
} from "../src/modules/mantenimientos/mantenimientos.validation.js";

const validPayload = {
  fecha: "2026-09-03",
  estado: "EN_MANTENIMIENTO",
  tecnicoResponsable: "Técnico A",
  cliente: { nombre: "Cliente de prueba", ruc: "0993406012001" },
  equipo: { marca: "HP", modelo: "ProBook", cargadorEntregado: true },
  problemasReportados: ["Lentitud general"],
  diagnosticoInicial: { tiempoEncendido: "90 segundos" },
  diagnosticoFinal: {},
  checklist: [
    {
      id: 1,
      categoria: "Diagnóstico inicial",
      actividad: "Consultar los problemas reportados",
      estado: "Conforme",
      observacion: "",
    },
  ],
  accionesRealizadas: "Limpieza física",
  hallazgos: ["Ventilador con polvo"],
  recomendaciones: ["Cambiar pasta térmica"],
  conclusion: "Equipo operativo",
  observaciones: "",
};

describe("createMaintenanceSchema", () => {
  it("acepta un mantenimiento completo", () => {
    const result = createMaintenanceSchema.parse(validPayload);
    expect(result.estado).toBe("EN_MANTENIMIENTO");
    expect(result.checklist).toHaveLength(1);
  });

  it("aplica valores por defecto de estado y listas", () => {
    const { estado: _estado, problemasReportados: _p, hallazgos: _h, recomendaciones: _r, ...rest } =
      validPayload;
    const result = createMaintenanceSchema.parse(rest);
    expect(result.estado).toBe("EN_REVISION");
    expect(result.problemasReportados).toEqual([]);
    expect(result.hallazgos).toEqual([]);
    expect(result.recomendaciones).toEqual([]);
  });

  it("rechaza estados desconocidos", () => {
    expect(() =>
      createMaintenanceSchema.parse({ ...validPayload, estado: "ANULADO" })
    ).toThrow();
  });

  it("rechaza checklist con ítems inválidos", () => {
    expect(() =>
      createMaintenanceSchema.parse({
        ...validPayload,
        checklist: [{ id: 1, categoria: "x" }],
      })
    ).toThrow();
  });
});

describe("updateMaintenanceSchema", () => {
  it("acepta actualizaciones parciales sin aplicar defaults", () => {
    const result = updateMaintenanceSchema.parse({ estado: "FINALIZADO" });
    expect(result).toEqual({ estado: "FINALIZADO" });
  });

  it("acepta un objeto vacío", () => {
    expect(updateMaintenanceSchema.parse({})).toEqual({});
  });
});
