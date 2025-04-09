import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
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

export async function fetchHomepageImageUrl(): Promise<string | null> {
  try {
    const db = await getPublicFirestore();
    const settingsDocRef = doc(db, "settings", "siteSettings");
    const settingsDoc = await getDoc(settingsDocRef);

    if (settingsDoc.exists() && settingsDoc.data().homepageImageUrl) {
      return settingsDoc.data().homepageImageUrl;
    }

    return null;
  } catch (error) {
    console.error("Error fetching homepage image URL:", error);
    return null;
  }
}

export async function fetchSiteSettings() {
  try {
    const db = await getPublicFirestore();
    const settingsDocRef = doc(db, "settings", "siteSettings");
    const settingsDoc = await getDoc(settingsDocRef);

    if (settingsDoc.exists()) {
      return settingsDoc.data();
    }

    return null;
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return null;
  }
}

export { getPublicFirestore };
