import { useState } from "react";
import { type Auth, createUserWithEmailAndPassword } from "firebase/auth";
import authPromise from "../firebase-config";

interface SignUpFormData {
  email: string;
  password: string;
}

const SignIn = () => {
  const [formData, setFormData] = useState<SignUpFormData>({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    authPromise.then((auth: Auth) => {
      createUserWithEmailAndPassword(auth, formData.email, formData.password)
        .then((userCredential) => {
          const user = userCredential.user;
          console.log("User signed in:", user);
        })
        .catch((error) => {
          console.error("Error signing up:", error);
        });
    });
  };

  return (
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
  );
};

export default SignIn;
