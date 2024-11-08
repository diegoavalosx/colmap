import { useState, useEffect, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import authPromise from "../firebase-config";
import Loader from "../components/Loader";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type Auth,
} from "firebase/auth";
import { doc, getDoc, setDoc, type Firestore } from "firebase/firestore";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<Auth | null>();
  const [dataBase, setDatabase] = useState<Firestore | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    authPromise
      .then(({ auth, db }) => {
        setDatabase(db);
        setAuth(auth);
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user?.emailVerified) {
            setUser(user);
            const userDoc = await getDoc(doc(db, "users", user.uid));
            setRole(userDoc.data()?.role || "user");
          } else {
            setUser(null);
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (auth) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        if (dataBase) {
          const userRef = doc(dataBase, "users", user.uid);
          console.log(userRef);
          const userDoc = await getDoc(userRef);
          console.log(userDoc);

          if (!userDoc.exists()) {
            await setDoc(userRef, {
              email: user.email,
              createdAt: new Date(),
              emailVerified: user.emailVerified,
              role: "user",
            });
          }
        }

        if (user.emailVerified) {
          setUser(user);
          return true;
        }

        await auth.signOut();
        console.warn("Please verify your email before logging in.");
        return false;
      }

      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      if (auth) {
        await signOut(auth);
        setUser(null);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, dataBase, role }}>
      {children}
    </AuthContext.Provider>
  );
};
