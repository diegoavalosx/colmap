import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import type { Firestore } from "firebase/firestore/lite";

let firestore: Firestore | null = null;

async function getPublicFirestore() {
  if (firestore) {
    return firestore;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/app/api/firebase-config`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Firebase config");
    }

    const configResponse = await response.json();

    const firebaseConfig = {
      apiKey: configResponse.apiKey,
      authDomain: "colmap-9f519.firebaseapp.com",
      projectId: "colmap-9f519",
      storageBucket: "colmap-9f519.firebasestorage.app",
      messagingSenderId: "303034418721",
      appId: configResponse.appId,
      measurementId: "G-EHDRJ4J6TT",
    };

    const app = initializeApp(firebaseConfig, "publicAccess");
    firestore = getFirestore(app);

    return firestore;
  } catch (error) {
    console.error("Error initializing public Firestore:", error);
    throw error;
  }
}

export { getPublicFirestore };
