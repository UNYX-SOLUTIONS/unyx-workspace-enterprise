import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import logo from "../../../assets/logos/logo.png";

const COMPANY = {
  nombre: "UNYX SOLUTIONS S.A.S.",
  ruc: "0993406012001",
  direccion: "Guayaquil, Ecuador",
  telefono: "+593 98 336 1386",
  email: "jbenjume@unyxsolutions.com",
};

function resolveDate(value) {
  if (!value) return null;

  if (typeof value?.toDate === "function") {
    return value.toDate();
  }

  if (value?.seconds) {
    return new Date(value.seconds * 1000);
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = resolveDate(value);

  if (!date) return "";

  return date.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getExpirationDate(value, days = 30) {
  const date = resolveDate(value) || new Date();
  date.setDate(date.getDate() + Number(days || 30));

  return formatDate(date);
}

function formatAmount(value) {
  return Number(value || 0).toFixed(2);
}

function getBase64Image(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("No se pudo crear el contexto de la imagen."));
          return;
        }

        context.drawImage(image, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = () => {
      reject(new Error("No se pudo cargar el logotipo de la empresa."));
    };

    image.src = url;
  });
}

function validateProforma(proforma) {
  if (!proforma || typeof proforma !== "object") {
    throw new Error("La proforma no contiene datos válidos.");
  }

  if (!proforma.numero) {
    throw new Error("La proforma no tiene número.");
  }

  if (!proforma.cliente?.nombre) {
    throw new Error("La proforma no tiene un cliente.");
  }

  if (!Array.isArray(proforma.items)) {
    throw new Error("La proforma no contiene un listado de ítems válido.");
  }
}

export async function generatePdf(proforma) {
  validateProforma(proforma);

  const document = new jsPDF("p", "mm", "a4");
  const pageWidth = document.internal.pageSize.getWidth();
  const pageHeight = document.internal.pageSize.getHeight();
  const validityDays = Number(proforma.validezDias || 30);

  try {
    const logoBase64 = await getBase64Image(logo);
    document.addImage(logoBase64, "PNG", 14, 14, 20, 20);
  } catch (error) {
    console.warn("No se pudo agregar el logotipo al PDF:", error);
  }

  document.setFont("helvetica", "bold");
  document.setFontSize(14);
  document.text(COMPANY.nombre, pageWidth / 2, 18, { align: "center" });

  document.setFont("helvetica", "normal");
  document.setFontSize(8);
  document.text(`RUC: ${COMPANY.ruc}`, pageWidth / 2, 24, {
    align: "center",
  });
  document.text(`Dirección: ${COMPANY.direccion}`, pageWidth / 2, 29, {
    align: "center",
  });
  document.text(
    `Teléfono: ${COMPANY.telefono}    Email: ${COMPANY.email}`,
    pageWidth / 2,
    34,
    { align: "center" }
  );

  document.text(`Fecha: ${formatDate(proforma.fecha)}`, 165, 20);
  document.text(`Proforma: ${proforma.numero}`, 165, 25);
  document.line(14, 40, 196, 40);

  document.setFontSize(10);
  document.text("Estimado Sr(es).", 14, 50);
  document.text(
    "A continuación ponemos a su consideración la factura proforma que nos permitimos detallar:",
    14,
    56
  );

  document.setFont("helvetica", "bold");
  document.text(`PROFORMA: ${proforma.numero}`, pageWidth / 2, 66, {
    align: "center",
  });

  document.setFontSize(9);
  document.text("Cliente:", 14, 78);
  document.setFont("helvetica", "normal");
  document.text(String(proforma.cliente.nombre || ""), 32, 78);

  document.setFont("helvetica", "bold");
  document.text("Fecha:", 130, 78);
  document.setFont("helvetica", "normal");
  document.text(formatDate(proforma.fecha), 145, 78);

  document.setFont("helvetica", "bold");
  document.text("RUC/ID:", 14, 84);
  document.setFont("helvetica", "normal");
  document.text(String(proforma.cliente.ruc || ""), 32, 84);

  document.setFont("helvetica", "bold");
  document.text("Ciudad:", 130, 84);
  document.setFont("helvetica", "normal");
  document.text(String(proforma.cliente.ciudad || ""), 145, 84);

  document.setFont("helvetica", "bold");
  document.text("Dirección:", 14, 90);
  document.setFont("helvetica", "normal");
  document.text(String(proforma.cliente.direccion || ""), 32, 90);

  autoTable(document, {
    startY: 105,
    head: [
      ["ITEM", "DESCRIPCIÓN ITEM", "MARCA", "CANT.", "PRECIO", "SUBTOTAL"],
    ],
    body: proforma.items.map((item) => [
      String(item?.codigo || ""),
      String(item?.descripcion || ""),
      String(item?.marca || ""),
      formatAmount(item?.cantidad),
      formatAmount(item?.precio),
      formatAmount(Number(item?.cantidad || 0) * Number(item?.precio || 0)),
    ]),
    theme: "plain",
    styles: {
      fontSize: 8,
      cellPadding: 1.5,
    },
    headStyles: {
      fontStyle: "bold",
      textColor: [0, 0, 0],
      lineWidth: 0.2,
      lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 75 },
      2: { cellWidth: 25 },
      3: { cellWidth: 18, halign: "right" },
      4: { cellWidth: 22, halign: "right" },
      5: { cellWidth: 25, halign: "right" },
    },
    didDrawCell: (data) => {
      if (data.section === "body") {
        document.setDrawColor(180);
        document.line(
          data.cell.x,
          data.cell.y + data.cell.height,
          data.cell.x + data.cell.width,
          data.cell.y + data.cell.height
        );
      }
    },
  });

  let finalY = document.lastAutoTable.finalY + 12;

  document.setFontSize(9);
  document.setFont("helvetica", "bold");
  document.text("SubTotal:", 150, finalY, { align: "right" });
  document.text(formatAmount(proforma.subtotal), 190, finalY, {
    align: "right",
  });

  finalY += 6;
  document.text("IVA:", 150, finalY, { align: "right" });
  document.text(formatAmount(proforma.iva), 190, finalY, {
    align: "right",
  });

  finalY += 6;
  document.text("Total:", 150, finalY, { align: "right" });
  document.text(formatAmount(proforma.total), 190, finalY, {
    align: "right",
  });

  finalY += 12;
  document.text("Fecha de Validez:", 150, finalY, { align: "right" });
  document.setFont("helvetica", "normal");
  document.text(
    getExpirationDate(proforma.fecha, validityDays),
    190,
    finalY,
    { align: "right" }
  );

  if (String(proforma.notas || "").trim()) {
    finalY += 12;

    document.setFont("helvetica", "bold");
    document.setFontSize(9);
    document.text("Notas:", 14, finalY);

    document.setFont("helvetica", "normal");
    document.setFontSize(8);

    const noteLines = document.splitTextToSize(
      String(proforma.notas).trim(),
      120
    );

    document.text(noteLines, 14, finalY + 5);
    finalY += noteLines.length * 4 + 8;
  }

  if (finalY > pageHeight - 55) {
    document.addPage();
    finalY = 30;
  }

  finalY += 20;
  document.setFontSize(10);
  document.text("En espera de sus gratas órdenes,", 14, finalY);
  document.text("Atentamente,", 14, finalY + 6);

  document.line(14, finalY + 28, 55, finalY + 28);
  document.text("Firma Autorizada", 14, finalY + 34);

  const totalPages = document.getNumberOfPages();

  for (let page = 1; page <= totalPages; page += 1) {
    document.setPage(page);
    document.setFont("helvetica", "normal");
    document.setFontSize(8);
    document.text(
      `Página: ${page} de ${totalPages}`,
      pageWidth - 14,
      pageHeight - 12,
      { align: "right" }
    );
  }

  document.setPage(totalPages);
  document.setFont("helvetica", "bold");
  document.setFontSize(10);
  document.text(
    `***PROFORMA VÁLIDA POR ${validityDays} DÍAS***`,
    pageWidth / 2,
    pageHeight - 6,
    { align: "center" }
  );

  document.save(`PROFORMA_${proforma.numero}.pdf`);
}
