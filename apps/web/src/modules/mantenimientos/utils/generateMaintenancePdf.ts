import jsPDF from "jspdf";
import autoTable, { type UserOptions } from "jspdf-autotable";

import logo from "../../../assets/logos/logo.png";

const COMPANY = {
  name: "UNYX SOLUTIONS S.A.S.",
  ruc: "0993406012001",
  address: "Guayaquil, Ecuador",
  phone: "+593 98 336 1386",
  email: "jbenjume@unyxsolutions.com",
};

export interface MaintenancePdfEquipo {
  tipo?: unknown;
  marca?: unknown;
  modelo?: unknown;
  numeroSerie?: unknown;
  sistemaOperativo?: unknown;
  procesador?: unknown;
  ram?: unknown;
  almacenamiento?: unknown;
  cargadorEntregado?: unknown;
  accesorios?: unknown;
}

export interface MaintenancePdfData {
  numero?: unknown;
  fecha?: unknown;
  estado?: unknown;
  tecnicoResponsable?: unknown;
  cliente?: {
    nombre?: unknown;
    ruc?: unknown;
    telefono?: unknown;
    ciudad?: unknown;
    direccion?: unknown;
  };
  equipo?: MaintenancePdfEquipo;
  problemasReportados?: unknown;
  diagnosticoInicial?: Record<string, unknown>;
  diagnosticoFinal?: Record<string, unknown>;
  checklist?: Array<Record<string, unknown>>;
  accionesRealizadas?: unknown;
  hallazgos?: unknown;
  recomendaciones?: unknown;
  conclusion?: unknown;
  observaciones?: unknown;
}

const getBase64Image = (url: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("No se pudo crear el contexto de la imagen."));
        return;
      }
      context.drawImage(image, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => reject(new Error("No se pudo cargar el logotipo."));
    image.src = url;
  });

const formatDate = (date: unknown): string => {
  if (!date) return "";
  const parsed = new Date(`${String(date).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const safe = (value: unknown): string => String(value ?? "");

function getLastY(doc: jsPDF): number {
  return (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY ?? 0;
}

function setLastY(doc: jsPDF, y: number): void {
  (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable = {
    finalY: y,
  };
}

function addHeader(doc: jsPDF, maintenance: MaintenancePdfData, logoBase64: string) {
  const width = doc.internal.pageSize.getWidth();
  doc.addImage(logoBase64, "PNG", 14, 12, 20, 20);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(COMPANY.name, width / 2, 17, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`RUC: ${COMPANY.ruc}`, width / 2, 22, { align: "center" });
  doc.text(`Dirección: ${COMPANY.address}`, width / 2, 27, { align: "center" });
  doc.text(
    `Teléfono: ${COMPANY.phone}    Email: ${COMPANY.email}`,
    width / 2,
    32,
    { align: "center" }
  );
  doc.text(`Fecha: ${formatDate(maintenance.fecha)}`, 160, 18);
  doc.text(`Informe: ${safe(maintenance.numero)}`, 160, 23);
  doc.line(14, 38, 196, 38);
}

function addFooter(doc: jsPDF, page: number, total: number) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(90);
  doc.text(
    `UNYX Solutions S.A.S. | Informe técnico | Página ${page} de ${total}`,
    105,
    289,
    { align: "center" }
  );
}

const sectionTitle = (doc: jsPDF, title: string, y: number): number => {
  doc.setFillColor(239, 244, 255);
  doc.rect(14, y, 182, 7, "F");
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(title, 17, y + 4.8);
  return y + 10;
};

const tableOptions: UserOptions = {
  theme: "plain",
  styles: {
    fontSize: 7.5,
    cellPadding: 1.7,
    valign: "top",
    lineColor: [205, 205, 205],
    lineWidth: { bottom: 0.1 },
  },
  headStyles: {
    fontStyle: "bold",
    textColor: [0, 0, 0],
    fillColor: [255, 255, 255],
    lineColor: [0, 0, 0],
    lineWidth: 0.15,
  },
  margin: { left: 14, right: 14, top: 43, bottom: 13 },
};

export async function generateMaintenancePdf(maintenance: MaintenancePdfData): Promise<void> {
  const doc = new jsPDF("p", "mm", "a4");
  const logoBase64 = await getBase64Image(logo);
  addHeader(doc, maintenance, logoBase64);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("INFORME TÉCNICO DE MANTENIMIENTO PREVENTIVO", 105, 48, {
    align: "center",
  });

  autoTable(doc, {
    ...tableOptions,
    startY: 55,
    body: [
      ["Cliente", safe(maintenance.cliente?.nombre), "RUC/ID", safe(maintenance.cliente?.ruc)],
      ["Teléfono", safe(maintenance.cliente?.telefono), "Ciudad", safe(maintenance.cliente?.ciudad)],
      ["Dirección", safe(maintenance.cliente?.direccion), "Técnico", safe(maintenance.tecnicoResponsable)],
      ["Estado", safe(maintenance.estado), "Fecha", formatDate(maintenance.fecha)],
    ],
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 25 },
      1: { cellWidth: 66 },
      2: { fontStyle: "bold", cellWidth: 23 },
      3: { cellWidth: 68 },
    },
  });

  let y = sectionTitle(doc, "1. IDENTIFICACIÓN DEL EQUIPO", getLastY(doc) + 5);
  const equipment = maintenance.equipo || {};
  autoTable(doc, {
    ...tableOptions,
    startY: y,
    body: [
      ["Equipo", safe(equipment.tipo), "Marca", safe(equipment.marca)],
      ["Modelo", safe(equipment.modelo), "Número de serie", safe(equipment.numeroSerie)],
      ["Sistema operativo", safe(equipment.sistemaOperativo), "Procesador", safe(equipment.procesador)],
      ["Memoria RAM", safe(equipment.ram), "Almacenamiento", safe(equipment.almacenamiento)],
      ["Cargador", equipment.cargadorEntregado ? "Entregado" : "No entregado", "Accesorios", safe(equipment.accesorios)],
    ],
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 30 },
      1: { cellWidth: 61 },
      2: { fontStyle: "bold", cellWidth: 30 },
      3: { cellWidth: 61 },
    },
  });

  y = sectionTitle(doc, "2. PROBLEMAS REPORTADOS", getLastY(doc) + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const problems = Array.isArray(maintenance.problemasReportados)
    ? maintenance.problemasReportados.filter(Boolean).join(", ")
    : String(maintenance.problemasReportados || "");
  const problemLines = doc.splitTextToSize(
    problems || "No se registraron problemas específicos.",
    176
  );
  doc.text(problemLines, 17, y + 1);
  y += problemLines.length * 4 + 4;

  y = sectionTitle(doc, "3. COMPARACIÓN DEL RENDIMIENTO", y);
  const initial = maintenance.diagnosticoInicial || {};
  const final = maintenance.diagnosticoFinal || {};
  autoTable(doc, {
    ...tableOptions,
    startY: y,
    head: [["Indicador", "Antes", "Después"]],
    body: [
      ["Tiempo de encendido", safe(initial.tiempoEncendido), safe(final.tiempoEncendido)],
      ["Uso de CPU en reposo", safe(initial.usoCpu), safe(final.usoCpu)],
      ["Uso de RAM en reposo", safe(initial.usoRam), safe(final.usoRam)],
      ["Uso de disco en reposo", safe(initial.usoDisco), safe(final.usoDisco)],
      ["Espacio disponible", safe(initial.espacioDisponible), safe(final.espacioDisponible)],
      ["Temperatura en reposo", safe(initial.temperaturaReposo), safe(final.temperaturaReposo)],
      ["Temperatura máxima", safe(initial.temperaturaMaxima), safe(final.temperaturaMaxima)],
    ],
    columnStyles: {
      0: { cellWidth: 76 },
      1: { cellWidth: 53 },
      2: { cellWidth: 53 },
    },
  });

  doc.addPage();
  addHeader(doc, maintenance, logoBase64);
  y = sectionTitle(doc, "4. CHECKLIST TÉCNICO", 44);
  autoTable(doc, {
    ...tableOptions,
    startY: y,
    head: [["Categoría", "Verificación", "Estado", "Observaciones"]],
    body: (maintenance.checklist || []).map((item) => [
      safe(item.categoria),
      safe(item.actividad),
      safe(item.estado),
      safe(item.observacion),
    ]),
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 77 },
      2: { cellWidth: 25 },
      3: { cellWidth: 48 },
    },
  });

  const addTextSection = (title: string, text: unknown) => {
    let currentY = getLastY(doc) ? getLastY(doc) + 6 : 45;
    const lines = doc.splitTextToSize(
      text ? String(text) : "Sin información registrada.",
      176
    );
    if (currentY + 12 + lines.length * 4 > 280) {
      doc.addPage();
      addHeader(doc, maintenance, logoBase64);
      currentY = 44;
    }
    const textY = sectionTitle(doc, title, currentY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(lines, 17, textY + 1);
    setLastY(doc, textY + lines.length * 4 + 2);
  };

  addTextSection("5. ACCIONES REALIZADAS", maintenance.accionesRealizadas);
  addTextSection(
    "6. HALLAZGOS",
    Array.isArray(maintenance.hallazgos)
      ? maintenance.hallazgos.filter(Boolean).join("\n")
      : maintenance.hallazgos
  );
  addTextSection(
    "7. RECOMENDACIONES",
    Array.isArray(maintenance.recomendaciones)
      ? maintenance.recomendaciones.filter(Boolean).join("\n")
      : maintenance.recomendaciones
  );
  addTextSection("8. CONCLUSIÓN TÉCNICA", maintenance.conclusion);
  addTextSection("9. OBSERVACIONES", maintenance.observaciones);

  let signatureY = getLastY(doc) + 20;
  if (signatureY > 265) {
    doc.addPage();
    addHeader(doc, maintenance, logoBase64);
    signatureY = 65;
  }
  doc.setDrawColor(0);
  doc.line(25, signatureY, 80, signatureY);
  doc.line(130, signatureY, 185, signatureY);
  doc.setFontSize(8);
  doc.text("Técnico responsable", 52.5, signatureY + 5, { align: "center" });
  doc.text("Cliente / usuario", 157.5, signatureY + 5, { align: "center" });

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    addFooter(doc, page, totalPages);
  }

  doc.save(`INFORME_${safe(maintenance.numero)}.pdf`);
}
