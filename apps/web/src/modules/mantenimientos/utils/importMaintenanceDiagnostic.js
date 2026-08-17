const hasMojibake = (value) => /Ã|Â/.test(value);

const repairString = (value) => {
  if (typeof value !== "string" || !hasMojibake(value)) return value;

  try {
    const bytes = Uint8Array.from(value, (character) =>
      character.charCodeAt(0),
    );
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return value;
  }
};

const repairJsonStrings = (value) => {
  if (typeof value === "string") return repairString(value);
  if (Array.isArray(value)) return value.map(repairJsonStrings);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        repairJsonStrings(item),
      ]),
    );
  }
  return value;
};

const text = (value, fallback = "") => {
  if (value === null || value === undefined || value === "No disponible")
    return fallback;
  return String(value);
};

const internalDisk = (disks = []) =>
  disks.find((disk) => !/USB/i.test(text(disk.Bus))) || disks[0] || {};

const systemDrive = (drives = []) =>
  drives.find((drive) => drive.Unidad === "C:") || drives[0] || {};

const getInstalledRam = (memory = []) => {
  const total = memory.reduce((sum, module) => {
    const amount = Number.parseFloat(text(module.Capacidad).replace(",", "."));
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);
  return total ? `${total} GB` : "";
};

const getRamDescription = (memory = []) => {
  const installed = getInstalledRam(memory);
  if (!memory.length) return installed;

  const modules = memory
    .map((module) => text(module.Capacidad).replace(",00", ""))
    .filter(Boolean)
    .join(" + ");
  const speed = text(
    memory[0]?.VelocidadConfigurada || memory[0]?.VelocidadNominal,
  );

  return [installed, modules && `(${modules})`, speed]
    .filter(Boolean)
    .join(" ");
};

const formatDiskStatus = (disk) => {
  if (!disk || !Object.keys(disk).length) return "";
  return [
    text(disk.Nombre),
    text(disk.EstadoSalud),
    text(disk.Temperatura),
    text(disk.Desgaste),
  ]
    .filter(Boolean)
    .join(", ");
};

const formatBattery = (battery = {}) => {
  const health = text(battery.SaludEstimada);
  const wear = text(battery.DesgasteEstimado);
  if (health || wear) {
    return [health && `${health} de salud`, wear && `${wear} de desgaste`]
      .filter(Boolean)
      .join(", ");
  }
  return text(battery.Estado);
};

const normalizeStatus = (status) => {
  const normalized = text(status).toLowerCase();
  if (normalized.includes("conforme")) return "Conforme";
  if (normalized.includes("observ")) return "Observación";
  if (normalized.includes("crítico") || normalized.includes("critico"))
    return "Observación";
  return "Pendiente";
};

const getImportedStatus = (item) => {
  const verification = text(item.Verificacion).toLowerCase();
  const observation = text(item.Observacion).toLowerCase();

  if (
    verification === "prueba de errores" &&
    /no detectó errores|no detecto errores|no errors/.test(observation)
  ) {
    return "Conforme";
  }

  return normalizeStatus(item.Estado);
};

const checklistMatchers = [
  {
    imported: "Uso de CPU en reposo",
    target: "Revisar el uso de CPU, memoria RAM y disco en reposo",
  },
  {
    imported: "Capacidad y reconocimiento",
    target: "Verificar capacidad, velocidad y reconocimiento total",
  },
  {
    imported: "Consumo en reposo",
    target: "Revisar el consumo de memoria en reposo",
  },
  {
    imported: "Prueba de errores",
    target: "Ejecutar una prueba de errores de memoria",
  },
  {
    imported: "Configuración de canales",
    target: "Verificar configuración Single Channel o Dual Channel",
  },
  {
    imported: "Estado de las unidades",
    target: "Revisar el estado SMART y la vida útil estimada",
  },
  {
    imported: "Actividad en reposo",
    target: "Verificar temperatura y espacio disponible",
  },
  {
    imported: "TRIM",
    target: "Comprobar que TRIM esté activo en unidades SSD",
  },
  {
    imported: "Espacio disponible",
    target: "Verificar temperatura y espacio disponible",
  },
  {
    imported: "Salud estimada",
    target: "Comparar capacidad actual y capacidad de diseño",
  },
  {
    imported: "Antivirus y protección en tiempo real",
    target: "Confirmar que el antivirus y el firewall estén activos",
  },
  {
    imported: "Actualizaciones pendientes",
    target: "Instalar actualizaciones pendientes del sistema operativo",
  },
  {
    imported: "Programas de inicio",
    target: "Desactivar aplicaciones innecesarias del inicio",
  },
  {
    imported: "Eventos críticos o errores recientes",
    target: "Comprobar y reparar archivos del sistema",
  },
];

const mergeChecklist = (currentChecklist, importedChecklist = []) => {
  const updates = new Map();

  for (const matcher of checklistMatchers) {
    const importedItems = importedChecklist.filter(
      (item) =>
        text(item.Verificacion).toLowerCase() ===
        matcher.imported.toLowerCase(),
    );
    if (!importedItems.length) continue;

    const previous = updates.get(matcher.target);
    const observations = [
      previous?.observacion,
      ...importedItems.map((item) => text(item.Observacion)),
    ].filter(Boolean);

    const statuses = [
      previous?.estado,
      ...importedItems.map(getImportedStatus),
    ].filter(Boolean);
    const status = statuses.includes("Observación")
      ? "Observación"
      : statuses.includes("Pendiente")
        ? "Pendiente"
        : "Conforme";

    updates.set(matcher.target, {
      estado: status,
      observacion: [...new Set(observations)].join(" "),
    });
  }

  return currentChecklist.map((item) => {
    const update = updates.get(item.actividad);
    return update ? { ...item, ...update } : item;
  });
};

const mergeAnalyzedChecklist = (currentChecklist, analyzedChecklist = []) => {
  const analyzedByActivity = new Map(
    analyzedChecklist.map((item) => [text(item.actividad).trim(), item]),
  );

  return currentChecklist.map((currentItem) => {
    const analyzed = analyzedByActivity.get(currentItem.actividad);
    if (!analyzed) return currentItem;

    const allowedStatuses = [
      "Pendiente",
      "Conforme",
      "Observación",
      "No aplica",
    ];
    const importedStatus = repairString(text(analyzed.estado));

    return {
      ...currentItem,
      estado: allowedStatuses.includes(importedStatus)
        ? importedStatus
        : "Pendiente",
      observacion: text(analyzed.observacion),
    };
  });
};

export function parseMaintenanceDiagnostic(rawDiagnostic, currentChecklist) {
  const diagnostic = repairJsonStrings(rawDiagnostic);

  if (
    diagnostic?.equipo &&
    diagnostic?.diagnosticoInicial &&
    Array.isArray(diagnostic?.checklist)
  ) {
    return {
      diagnostic,

      equipo: diagnostic.equipo,

      diagnosticoInicial: diagnostic.diagnosticoInicial,

      checklist: mergeAnalyzedChecklist(currentChecklist, diagnostic.checklist),

      accionesRealizadas: diagnostic.accionesRealizadas || "",

      hallazgos: diagnostic.hallazgos || [],

      recomendaciones: diagnostic.recomendaciones || [],

      conclusion: diagnostic.conclusion || diagnostic.conclusionTecnica || "",

      observaciones:
        diagnostic.observaciones || diagnostic.observacionesAdicionales || "",
    };
  }

  if (!diagnostic || typeof diagnostic !== "object" || !diagnostic.Sistema) {
    throw new Error(
      "El archivo no contiene un diagnóstico de mantenimiento válido.",
    );
  }

  const system = diagnostic.Sistema || {};
  const performance = diagnostic.Rendimiento || {};
  const disk = internalDisk(diagnostic.Discos);
  const driveC = systemDrive(diagnostic.Unidades);
  const battery = diagnostic.Bateria || {};

  return {
    diagnostic,
    equipo: {
      tipo: "Laptop",
      marca: text(system.Fabricante),
      modelo: text(system.Modelo),
      numeroSerie: text(system.NumeroSerie),
      sistemaOperativo: [text(system.SistemaOperativo), text(system.Version)]
        .filter(Boolean)
        .join(" · "),
      procesador: text(system.Procesador),
      ram: getRamDescription(diagnostic.Memoria),
      almacenamiento: [text(disk.Tipo), text(disk.Bus), text(disk.Capacidad)]
        .filter(Boolean)
        .join(" · "),
    },
    diagnosticoInicial: {
      tiempoEncendido: "",
      usoCpu:
        performance.CpuPromedioPorcentaje !== undefined
          ? `${performance.CpuPromedioPorcentaje} %`
          : "",
      usoRam:
        performance.RamUtilizadaGB !== undefined
          ? `${performance.RamUtilizadaGB} GB de ${performance.RamTotalGB} GB (${performance.RamUsoPorcentaje} %)`
          : "",
      usoDisco:
        performance.DiscoPromedioPorcentaje !== undefined
          ? `${performance.DiscoPromedioPorcentaje} %`
          : "",
      espacioDisponible: [
        text(driveC.Disponible),
        text(driveC.Capacidad) && `de ${driveC.Capacidad}`,
      ]
        .filter(Boolean)
        .join(" "),
      temperaturaReposo: "",
      temperaturaMaxima: "",
      estadoDisco: formatDiskStatus(disk),
      estadoBateria: formatBattery(battery),
      condicionFisica: "",
    },
    checklist: mergeChecklist(currentChecklist, diagnostic.Checklist),
  };
}
