import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../../../lib/firebase";

const COLLECTION_NAME = "clients";

function normalizeClient(client = {}) {
  const nombre = String(client.nombre || "").trim();
  const ruc = String(client.ruc || "").trim();

  if (!nombre) {
    throw new Error("El nombre o razón social es obligatorio.");
  }

  if (!ruc) {
    throw new Error("La identificación o RUC es obligatoria.");
  }

  return {
    nombre,
    ruc,
    email: String(client.email || "").trim(),
    telefono: String(client.telefono || "").trim(),
    direccion: String(client.direccion || "").trim(),
    ciudad: String(client.ciudad || "").trim() || "Guayaquil",
    estado: String(client.estado || "").trim() || "Activo",
  };
}

export async function getClients() {
  const clientsQuery = query(
    collection(db, COLLECTION_NAME),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(clientsQuery);

  return snapshot.docs.map((documentSnapshot) => ({
    id: documentSnapshot.id,
    ...documentSnapshot.data(),
  }));
}

export async function addClient(client) {
  const normalizedClient = normalizeClient(client);

  const documentReference = await addDoc(
    collection(db, COLLECTION_NAME),
    {
      ...normalizedClient,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  return {
    id: documentReference.id,
    ...normalizedClient,
  };
}

export async function updateClient(id, client) {
  if (!id) {
    throw new Error("El identificador del cliente es obligatorio.");
  }

  const normalizedClient = normalizeClient(client);
  const clientReference = doc(db, COLLECTION_NAME, id);

  await updateDoc(clientReference, {
    ...normalizedClient,
    updatedAt: serverTimestamp(),
  });

  return {
    id,
    ...normalizedClient,
  };
}

export async function deleteClient(id) {
  if (!id) {
    throw new Error("El identificador del cliente es obligatorio.");
  }

  await deleteDoc(doc(db, COLLECTION_NAME, id));

  return id;
}
