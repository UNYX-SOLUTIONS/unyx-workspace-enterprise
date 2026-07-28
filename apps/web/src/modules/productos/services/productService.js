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

const COLLECTION_NAME = "products";

function normalizeProduct(product = {}) {
  const ref = String(product.ref || "").trim();
  const name = String(product.name || "").trim();
  const brand = String(product.brand || "").trim();
  const category = String(product.category || "").trim();
  const price = Number(product.price || 0);

  if (!ref) {
    throw new Error("La referencia del producto es obligatoria.");
  }

  if (!name) {
    throw new Error("El nombre del producto es obligatorio.");
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("El precio del producto no es válido.");
  }

  return {
    ref,
    name,
    brand,
    category,
    price,
  };
}

export async function getProducts() {
  const productsQuery = query(
    collection(db, COLLECTION_NAME),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(productsQuery);

  return snapshot.docs.map((documentSnapshot) => ({
    id: documentSnapshot.id,
    ...documentSnapshot.data(),
  }));
}

export async function addProduct(product) {
  const normalizedProduct = normalizeProduct(product);

  const documentReference = await addDoc(
    collection(db, COLLECTION_NAME),
    {
      ...normalizedProduct,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  return {
    id: documentReference.id,
    ...normalizedProduct,
  };
}

export async function updateProduct(id, product) {
  if (!id) {
    throw new Error("El identificador del producto es obligatorio.");
  }

  const normalizedProduct = normalizeProduct(product);
  const productReference = doc(db, COLLECTION_NAME, id);

  await updateDoc(productReference, {
    ...normalizedProduct,
    updatedAt: serverTimestamp(),
  });

  return {
    id,
    ...normalizedProduct,
  };
}

export async function deleteProduct(id) {
  if (!id) {
    throw new Error("El identificador del producto es obligatorio.");
  }

  await deleteDoc(doc(db, COLLECTION_NAME, id));

  return id;
}
