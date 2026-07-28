import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../../lib/firebase";

const COLLECTION_NAME = "proformas";
const COUNTER_REFERENCE = doc(db, "counters", "proformas");

function formatNumber(value) {
  return String(value).padStart(8, "0");
}

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    codigo: String(item?.codigo || "").trim(),
    descripcion: String(item?.descripcion || "").trim(),
    marca: String(item?.marca || "").trim(),
    cantidad: Number(item?.cantidad || 0),
    precio: Number(item?.precio || 0),
  }));
}

function normalizeProforma(data = {}) {
  const numero = String(data.numero || "").trim();
  const numeroInt = Number(numero);

  if (!numero || !Number.isInteger(numeroInt) || numeroInt <= 0) {
    throw new Error("El número de proforma no es válido.");
  }

  if (!data.cliente?.nombre || !data.cliente?.ruc) {
    throw new Error("La proforma debe incluir el cliente y su identificación.");
  }

  const items = normalizeItems(data.items);

  if (items.length === 0) {
    throw new Error("La proforma debe incluir al menos un ítem.");
  }

  return {
    ...data,
    numero,
    cliente: {
      nombre: String(data.cliente.nombre || "").trim(),
      ruc: String(data.cliente.ruc || "").trim(),
      direccion: String(data.cliente.direccion || "").trim(),
      telefono: String(data.cliente.telefono || "").trim(),
      ciudad: String(data.cliente.ciudad || "").trim() || "Guayaquil",
    },
    items,
    subtotal: Number(data.subtotal || 0),
    iva: Number(data.iva || 0),
    total: Number(data.total || 0),
    validezDias: Number(data.validezDias || 30),
    notas: String(data.notas || "").trim(),
    estado: String(data.estado || "").trim() || "emitida",
  };
}

export async function previewNextProformaNumber() {
  const counterSnapshot = await getDoc(COUNTER_REFERENCE);

  const lastNumber = counterSnapshot.exists()
    ? Number(counterSnapshot.data().lastNumber || 0)
    : 0;

  return formatNumber(lastNumber + 1);
}

export async function saveProforma(data) {
  const normalizedProforma = normalizeProforma(data);
  const numeroInt = Number(normalizedProforma.numero);

  await runTransaction(db, async (transaction) => {
    const counterSnapshot = await transaction.get(COUNTER_REFERENCE);

    const lastNumber = counterSnapshot.exists()
      ? Number(counterSnapshot.data().lastNumber || 0)
      : 0;

    const proformaReference = doc(
      db,
      COLLECTION_NAME,
      normalizedProforma.numero
    );

    const existingSnapshot = await transaction.get(proformaReference);
    const createdAt = existingSnapshot.exists()
      ? existingSnapshot.data().createdAt
      : serverTimestamp();

    transaction.set(
      proformaReference,
      {
        ...normalizedProforma,
        createdAt,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    if (numeroInt > lastNumber) {
      transaction.set(
        COUNTER_REFERENCE,
        {
          lastNumber: numeroInt,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  });

  return normalizedProforma;
}

export async function getProforma(numero) {
  const normalizedNumber = String(numero || "").trim();

  if (!normalizedNumber) {
    throw new Error("Debes indicar el número de proforma.");
  }

  const documentReference = doc(
    db,
    COLLECTION_NAME,
    normalizedNumber
  );

  const snapshot = await getDoc(documentReference);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    numero: snapshot.data().numero || snapshot.id,
    ...snapshot.data(),
  };
}

export async function getProformas() {
  const proformasQuery = query(
    collection(db, COLLECTION_NAME),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(proformasQuery);

  return snapshot.docs.map((documentSnapshot) => ({
    id: documentSnapshot.id,
    numero:
      documentSnapshot.data().numero || documentSnapshot.id,
    ...documentSnapshot.data(),
  }));
}
