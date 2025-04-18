import { initializeApp } from "firebase/app";
import {
  type Auth,
  browserSessionPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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
  fetchFirebaseConfig().then((configResponse) => {
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

    const db = getFirestore(app);

    const storage = getStorage(app);

    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        console.log("Persistence set");
      })
      .catch((error) => {
        console.error("Error setting persistence:", error);
      });

    return { auth, db, storage };
  });

export default firebaseInstancesPromise;
