import { useState, useEffect, type ReactNode } from "react";
import { AuthContext, type AuthContextType } from "./AuthContext";
import { FirebaseError } from "firebase/app";
import authPromise from "../firebase-config";
import Loader from "../components/Loader";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  type User,
  type Auth,
} from "firebase/auth";
import { doc, getDoc, updateDoc, type Firestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<Auth | null>();
  const [authError, setAuthError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] =
    useState<AuthContextType["authStatus"]>("idle");
  const [dataBase, setDatabase] = useState<Firestore | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [storage, setStorage] = useState<FirebaseStorage | null>();

  useEffect(() => {
    authPromise
      .then(({ auth, db, storage }) => {
        setDatabase(db);
        setAuth(auth);
        setStorage(storage);
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user?.emailVerified) {
            setUser(user);
            const userDoc = await getDoc(doc(db, "users", user.uid));
            setRole(userDoc.data()?.role || "user");
          } else {
            setRole(null);
          }
          setLoading(false);
        });
        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("Error setting persistence or initializing auth:", error);
        setLoading(false);
      });
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<"success" | "emailNotVerified" | "error"> => {
    setAuthStatus("loading");
    setAuthError(null);

    try {
      if (auth) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        setUser(user);
        if (user.emailVerified) {
          setAuthStatus("authenticated");
          if (dataBase) {
            const userRef = doc(dataBase, "users", user.uid);

            await updateDoc(userRef, {
              emailVerified: user.emailVerified,
            });
          }
          return "success";
        }

        await auth.signOut();
        setAuthError("Please verify your email before logging in.");
        setAuthStatus("error");
        return "emailNotVerified";
      }
      setAuthStatus("error");
      setAuthError("Authentication failed.");
      return "error";
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        setAuthError("Login failed");
      } else {
        setAuthError("Unexpected error on login");
      }
      setAuthStatus("error");
      return "error";
    }
  };

  const logout = async () => {
    setAuthStatus("loading");
    try {
      if (auth) {
        await signOut(auth);
        setUser(null);
        setAuthStatus("idle");
      }
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        setAuthError("Logout failed");
      } else {
        setAuthError("Unexpected error on login");
      }
      setAuthStatus("error");
    }
  };

  const resendVerificationEmail = async () => {
    if (auth && user && !user.emailVerified) {
      await sendEmailVerification(user);
      setAuthStatus("verificationEmailSent");
    }
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  if (loading || !storage) {
    return <Loader />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        dataBase,
        role,
        authError,
        authStatus,
        clearAuthError,
        resendVerificationEmail,
        storage,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
