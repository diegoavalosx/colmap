import type { User } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import { createContext } from "react";

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<string>;
  logout: () => void;
  resendVerificationEmail: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
  authStatus: 'idle' | 'loading' | 'authenticated' | 'error' | 'verificationEmailSent';
  dataBase: Firestore | null;
  role: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
