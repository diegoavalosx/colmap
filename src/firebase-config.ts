import { initializeApp } from "firebase/app";
import {
  type Auth,
  browserSessionPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";

// Function to fetch configuration from the backend
async function fetchFirebaseConfig() {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/app/api/firebase-config`
    ); // Replace with your deployed backend URL
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

// Create and export a promise that resolves with `auth` after initialization
const authPromise: Promise<Auth> = fetchFirebaseConfig().then(
  (configResponse) => {
    const firebaseConfig = {
      apiKey: configResponse.apiKey,
      authDomain: "colmap-9f519.firebaseapp.com",
      projectId: "colmap-9f519",
      storageBucket: "colmap-9f519.firebasestorage.app",
      messagingSenderId: "303034418721",
      appId: configResponse.appId, // Replace with your actual app ID
      measurementId: "G-EHDRJ4J6TT", // Replace as needed
    };

    const app = initializeApp(firebaseConfig);

    const auth = getAuth(app);

    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        console.log("Persistence set");
      })
      .catch((error) => {
        console.error("Error setting persistence:", error);
      });

    return auth;
  }
);

export default authPromise;