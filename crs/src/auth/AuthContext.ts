import { createContext } from "react";
import type { OcmsCredentials } from "./storage";

export interface AuthContextValue {
  credentials: OcmsCredentials | null;
  ready: boolean;
  error: string | null;
  submitCredentials: (credentials: OcmsCredentials) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
