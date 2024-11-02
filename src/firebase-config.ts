import { initializeApp } from "firebase/app";
import {
  browserSessionPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "colmap-9f519.firebaseapp.com",
  projectId: "colmap-9f519",
  storageBucket: "colmap-9f519.firebasestorage.app",
  messagingSenderId: "303034418721",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: "G-EHDRJ4J6TT",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

setPersistence(auth, browserSessionPersistence) // Set persistence type as needed
  .then(() => {
    console.log("Persistence set");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

export { auth };
