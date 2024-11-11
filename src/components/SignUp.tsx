import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  type User,
} from "firebase/auth";
import authPromise from "../firebase-config";
import { doc, type Firestore, setDoc } from "firebase/firestore";
import {useNavigate} from 'react-router-dom'

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
}

const SignUp = () => {
  const [formData, setFormData] = useState<SignUpFormData>({
    name: "",
    email: "",
    password: "",
  });
  const [verificationMessage, setVerificationMessage] = useState("");
  const navigate = useNavigate();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { auth, db } = await authPromise;
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      await addUserToFirestore(user, db, formData.name);

      await signOut(auth);

      await sendEmailVerification(user);
      setVerificationMessage(
        "A verification email has been sent. Please check your inbox and verify your email before logging in."
      );
      setTimeout(() => {
        navigate('/login')
      }, 5000);

    } catch (error) {
      console.error("Error during sign up:", error);
      setVerificationMessage("Error, sign up failed")
    }
  };

  const addUserToFirestore = async (
    user: User,
    db: Firestore,
    name: string
  ) => {
    try {
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name,
        emailVerified: user.emailVerified,
        createdAt: new Date(),
        role: "user",
      });
      console.log("User data successfully written to Firestore.");
    } catch (error) {
      console.error("Error adding user to Firestore:", error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-center text-black">
          Sign Up
        </h2>
        <form onSubmit={handleSubmit} className="text-left">
          <label
            htmlFor="name"
            className="block text-sm mb-2 font-bold text-gray-700"
          >
            Name:
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 mb-4 text-black placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent"
            placeholder="Jane Doe"
            required
          />

          <label
            htmlFor="email"
            className="block text-sm mb-2 font-bold text-gray-700"
          >
            Email:
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 mb-4 text-black placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent"
            placeholder="you@example.com"
            required
          />

          <label
            htmlFor="password"
            className="block text-sm mb-2 font-bold text-gray-700"
          >
            Password:
          </label>
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 mb-4 text-black placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent"
            placeholder="••••••••"
            required
          />

          <button
            type="submit"
            className="w-full py-2 mt-4 font-semibold text-white bg-ooh-yeah-pink rounded-lg hover:bg-pink-600 transition-colors"
          >
            Sign Up
          </button>
        </form>
        {verificationMessage && (
          <p className={`mb-4 ${verificationMessage.includes("Error") ? "text-red-600" : "text-green-600"}`}> {verificationMessage}</p>
        )}
      </div>
    </div>
  );
};

export default SignUp;
