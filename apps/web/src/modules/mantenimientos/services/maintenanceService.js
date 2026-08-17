import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

const COLLECTION_NAME = "mantenimientos";
const COUNTER_REF = doc(db, "counters", "mantenimientos");

const formatNumber = (value) => `MANT-${String(value).padStart(8, "0")}`;

export async function previewNextMaintenanceNumber() {
  const snapshot = await getDoc(COUNTER_REF);
  return formatNumber((snapshot.exists() ? snapshot.data().current : 0) + 1);
}

export async function saveMaintenance(maintenance) {
  if (!maintenance?.numero)
    throw new Error("El mantenimiento no tiene número.");

  await runTransaction(db, async (transaction) => {
    const counterSnapshot = await transaction.get(COUNTER_REF);
    const current = counterSnapshot.exists()
      ? Number(counterSnapshot.data().current || 0)
      : 0;
    const numericNumber = Number(String(maintenance.numero).replace(/\D/g, ""));

    transaction.set(
      doc(db, COLLECTION_NAME, maintenance.numero),
      { ...maintenance, updatedAt: serverTimestamp() },
      { merge: true },
    );

    if (numericNumber > current) {
      transaction.set(COUNTER_REF, { current: numericNumber }, { merge: true });
    }
  });

  return maintenance.numero;
}

export async function getMaintenance(number) {
  const snapshot = await getDoc(doc(db, COLLECTION_NAME, number));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function getMaintenances() {
  const maintenanceQuery = query(
    collection(db, COLLECTION_NAME),
    orderBy("fecha", "desc"),
  );
  const snapshot = await getDocs(maintenanceQuery);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function updateMaintenanceStatus(number, status) {
  await setDoc(
    doc(db, COLLECTION_NAME, number),
    { estado: status, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
