import { initializeApp } from "firebase/app";
import {
  type Auth,
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import type { Firestore } from "firebase/firestore/lite";
import { type FirebaseStorage, getStorage } from "firebase/storage";

async function fetchFirebaseConfig() {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/app/api/firebase-config`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch Firebase config");
    }
    const config = await response.json();
    return config;
  } catch (error) {
    console.error("Error fetching Firebase config:", error);
    throw error;
  }
}

interface FirebaseInstances {
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
}

const firebaseInstancesPromise: Promise<FirebaseInstances> =
  fetchFirebaseConfig().then(async (configResponse) => {
    const firebaseConfig = {
      apiKey: configResponse.apiKey,
      authDomain: "colmap-9f519.firebaseapp.com",
      projectId: "colmap-9f519",
      storageBucket: "colmap-9f519.firebasestorage.app",
      messagingSenderId: "303034418721",
      appId: configResponse.appId,
      measurementId: "G-EHDRJ4J6TT",
    };

    const app = initializeApp(firebaseConfig);

    const auth = getAuth(app);

    const usesSafariWebKit =
      /AppleWebKit/i.test(navigator.userAgent) &&
      !/(Chrome|Chromium|Edg|OPR|Android)/i.test(navigator.userAgent);
    const db = initializeFirestore(app, {
      experimentalForceLongPolling: usesSafariWebKit,
    });

    const storage = getStorage(app);

    await setPersistence(auth, browserLocalPersistence);

    return { auth, db, storage };
  });

export default firebaseInstancesPromise;
