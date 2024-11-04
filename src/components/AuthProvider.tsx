import { useState, useEffect, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import authPromise from "../firebase-config";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
  type User,
  type Auth,
} from "firebase/auth";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Adjust the useState to correctly type the initial state and updater function
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<Auth | null>();

  useEffect(() => {
    authPromise
      .then((auth: Auth) => {
        return setPersistence(auth, browserSessionPersistence).then(() => {
          setAuth(auth);
          // Subscribe to auth state changes only after setting persistence
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
              setUser(user);
            } else {
              setUser(null);
            }
            setLoading(false);
          });

          // Cleanup subscription on unmount
          return () => unsubscribe();
        });
      })
      .catch((error) => {
        console.error("Error setting persistence or initializing auth:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or any other loading indicator
  }

  const login = async (email: string, password: string) => {
    try {
      if (auth) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        setUser(userCredential.user);
      }
    } catch (error) {
      console.error("Login failed:", error);
      // Handle errors here, such as displaying a notification
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

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
