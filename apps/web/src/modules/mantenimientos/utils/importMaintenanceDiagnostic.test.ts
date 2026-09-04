import { describe, expect, it } from "vitest";
import { parseMaintenanceDiagnostic } from "./importMaintenanceDiagnostic";
import { createMaintenanceChecklist, type ChecklistItem } from "../constants/maintenanceChecklist";

const checklist = createMaintenanceChecklist();

describe("parseMaintenanceDiagnostic (formato analizado)", () => {
  it("importa equipo, diagnóstico inicial y checklist analizado", () => {
    const raw = {
      equipo: { tipo: "Laptop", marca: "HP", modelo: "ProBook 450" },
      diagnosticoInicial: { tiempoEncendido: "90 s", usoCpu: "12 %" },
      checklist: [
        { actividad: "Consultar los problemas reportados por el usuario", estado: "Conforme", observacion: "ok" },
      ],
      accionesRealizadas: "Limpieza general",
      conclusion: "Operativo",
    };

    const result = parseMaintenanceDiagnostic(raw, checklist);

    expect(result.equipo.marca).toBe("HP");
    expect(result.diagnosticoInicial.usoCpu).toBe("12 %");
    expect(result.accionesRealizadas).toBe("Limpieza general");

    const updated = result.checklist.find(
      (item) => item.actividad === "Consultar los problemas reportados por el usuario"
    );
    expect(updated?.estado).toBe("Conforme");
    expect(updated?.observacion).toBe("ok");
  });

  it("mantiene en Pendiente los estados desconocidos del análisis", () => {
    const raw = {
      equipo: { tipo: "Laptop" },
      diagnosticoInicial: {},
      checklist: [
        { actividad: "Consultar los problemas reportados por el usuario", estado: "XYZ", observacion: "" },
      ],
    };

    const result = parseMaintenanceDiagnostic(raw, checklist);
    const updated = result.checklist.find(
      (item) => item.actividad === "Consultar los problemas reportados por el usuario"
    );

    expect(updated?.estado).toBe("Pendiente");
  });
});

describe("parseMaintenanceDiagnostic (formato Sistema)", () => {
  const raw = {
    Sistema: {
      Fabricante: "Dell",
      Modelo: "Latitude 5520",
      NumeroSerie: "SN-123",
      SistemaOperativo: "Windows 11",
      Procesador: "Intel i7",
    },
    Memoria: [
      { Capacidad: "8,00 GB", VelocidadConfigurada: "3200 MHz" },
      { Capacidad: "8,00 GB", VelocidadConfigurada: "3200 MHz" },
    ],
    Discos: [{ Bus: "SATA", Tipo: "HDD", Capacidad: "1 TB", EstadoSalud: "Bueno", Temperatura: "35 C", Desgaste: "5 %" }],
    Unidades: [{ Unidad: "C:", Capacidad: "500 GB", Disponible: "200 GB" }],
    Bateria: { SaludEstimada: "90 %", DesgasteEstimado: "10 %" },
    Rendimiento: {
      CpuPromedioPorcentaje: 15,
      RamUtilizadaGB: 6,
      RamTotalGB: 16,
      RamUsoPorcentaje: 37,
      DiscoPromedioPorcentaje: 4,
    },
    Checklist: [
      {
        Verificacion: "Prueba de errores",
        Observacion: "No detectó errores",
      },
      {
        Verificacion: "Antivirus y protección en tiempo real",
        Observacion: "Activo",
      },
    ],
  };

  it("mapea el sistema al equipo y al diagnóstico inicial", () => {
    const result = parseMaintenanceDiagnostic(raw, checklist);

    expect(result.equipo.marca).toBe("Dell");
    expect(result.equipo.numeroSerie).toBe("SN-123");
    expect(result.equipo.ram).toContain("16 GB");
    expect(result.diagnosticoInicial.usoCpu).toBe("15 %");
    expect(result.diagnosticoInicial.estadoBateria).toContain("90 %");
  });

  it("fusiona el checklist por matchers", () => {
    const result = parseMaintenanceDiagnostic(raw, checklist);

    const ramTest = result.checklist.find(
      (item) => item.actividad === "Ejecutar una prueba de errores de memoria"
    );
    const antivirus = result.checklist.find(
      (item) => item.actividad === "Confirmar que el antivirus y el firewall estén activos"
    );

    expect(ramTest?.estado).toBe("Conforme");
    expect(ramTest?.observacion).toContain("No detectó errores");
    expect(antivirus?.observacion).toContain("Activo");
    expect(antivirus?.estado).toBe("Pendiente");
  });

  it("conserva los ítems sin matcher intactos", () => {
    const result = parseMaintenanceDiagnostic(raw, checklist);
    expect(result.checklist).toHaveLength(checklist.length);
  });

  it("rechaza objetos que no son diagnósticos", () => {
    expect(() => parseMaintenanceDiagnostic({ foo: "bar" }, checklist)).toThrow();
  });
});

describe("parseMaintenanceDiagnostic (reparación de mojibake)", () => {
  it("repara cadenas con mojibake UTF-8", () => {
    const broken = "DetecciÃ³n de fallos";
    const raw = {
      equipo: { tipo: "Laptop", marca: "HP", modelo: broken },
      diagnosticoInicial: {},
      checklist: [],
    };

    const result = parseMaintenanceDiagnostic(raw, checklist);
    expect(result.equipo.modelo).toBe("Detección de fallos");
  });
});
