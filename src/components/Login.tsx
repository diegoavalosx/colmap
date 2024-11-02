import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "colmap-9f519.firebaseapp.com",
  projectId: "colmap-9f519",
  storageBucket: "colmap-9f519.firebasestorage.app",
  messagingSenderId: "303034418721",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: "G-EHDRJ4J6TT",
};

interface SignUpFormData {
  email: string;
  password: string;
}

const Login = () => {
  const [signedUp, setSignedUp] = useState(false);
  const [formData, setFormData] = useState<SignUpFormData>({
    email: "",
    password: "",
  });

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, formData.email, formData.password)
      .then((userCredential) => {
        setSignedUp(true);
        const user = userCredential.user;
        console.log("User created:", user);
      })
      .catch((error) => {
        console.error("Error signing up:", error);
      });
  };

  return (
    <>
      {signedUp ? (
        <h1>Success!</h1>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col p-4 max-w-sm mx-auto"
        >
          <label htmlFor="email" className="mb-2 font-semibold">
            Email:
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange}
            className="mb-4 p-2 border border-gray-300 rounded"
            required
          />

          <label htmlFor="password" className="mb-2 font-semibold">
            Password:
          </label>
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleInputChange}
            className="mb-4 p-2 border border-gray-300 rounded"
            required
          />

          <button
            type="submit"
            className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Sign Up
          </button>
        </form>
      )}
    </>
  );
};

export default Login;
