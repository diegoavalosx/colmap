import type { User } from "firebase/auth";
import { createContext } from "react";

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<string>;
  logout: () => void;
  authError: string | null;
  authStatus: 'idle' | 'loading' | 'authenticated' | 'error';
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
