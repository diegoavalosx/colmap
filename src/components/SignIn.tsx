import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
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
  const [verificationMessage, setVerificationMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    authPromise.then(({ auth }) => {
      createUserWithEmailAndPassword(auth, formData.email, formData.password)
        .then((userCredential) => {
          const user = userCredential.user;
          console.log("User signed in:", user);

          sendEmailVerification(user)
            .then(() => {
              setVerificationMessage(
                "A verification email has been sent. Please check your inbox and verify your email before logging in."
              );
            })
            .catch((error) => {
              console.error("Error sending verification email:", error);
            });
        })
        .catch((error) => {
          console.error("Error signing up:", error);
        });
    });
  };

  return (
    <div>
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
      {verificationMessage && (
        <p className="mb-4 text-green-600">{verificationMessage}</p>
      )}
    </div>
  );
};

export default SignIn;
