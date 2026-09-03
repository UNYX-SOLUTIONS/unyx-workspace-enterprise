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

export interface MaintenanceRecord {
  id?: string;
  numero: string;
  [key: string]: unknown;
}

const COLLECTION_NAME = "mantenimientos";
const COUNTER_REF = doc(db, "counters", "mantenimientos");

const formatNumber = (value: number) => `MANT-${String(value).padStart(8, "0")}`;

export async function previewNextMaintenanceNumber(): Promise<string> {
  const snapshot = await getDoc(COUNTER_REF);
  const current = snapshot.exists() ? Number(snapshot.data().current || 0) : 0;
  return formatNumber(current + 1);
}

export async function saveMaintenance(maintenance: MaintenanceRecord): Promise<string> {
  if (!maintenance?.numero) throw new Error("El mantenimiento no tiene número.");

  await runTransaction(db, async (transaction) => {
    const counterSnapshot = await transaction.get(COUNTER_REF);
    const current = counterSnapshot.exists()
      ? Number(counterSnapshot.data().current || 0)
      : 0;
    const numericNumber = Number(String(maintenance.numero).replace(/\D/g, ""));

    transaction.set(
      doc(db, COLLECTION_NAME, maintenance.numero),
      { ...maintenance, updatedAt: serverTimestamp() },
      { merge: true }
    );

    if (numericNumber > current) {
      transaction.set(COUNTER_REF, { current: numericNumber }, { merge: true });
    }
  });

  return maintenance.numero;
}

export async function getMaintenance(number: string): Promise<MaintenanceRecord | null> {
  const snapshot = await getDoc(doc(db, COLLECTION_NAME, number));
  return snapshot.exists()
    ? ({ id: snapshot.id, ...snapshot.data() } as MaintenanceRecord)
    : null;
}

export async function getMaintenances(): Promise<MaintenanceRecord[]> {
  const maintenanceQuery = query(
    collection(db, COLLECTION_NAME),
    orderBy("fecha", "desc")
  );
  const snapshot = await getDocs(maintenanceQuery);
  return snapshot.docs.map(
    (item) => ({ id: item.id, ...item.data() }) as MaintenanceRecord
  );
}

export async function updateMaintenanceStatus(number: string, status: string): Promise<void> {
  await setDoc(
    doc(db, COLLECTION_NAME, number),
    { estado: status, updatedAt: serverTimestamp() },
    { merge: true }
  );
}
