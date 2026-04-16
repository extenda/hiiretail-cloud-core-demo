import { useCallback, useMemo, useState, type ReactNode } from "react";
import { AuthContext, type AuthContextValue } from "./AuthContext";
import {
  loadCredentials,
  saveCredentials,
  clearCredentials,
  clearStoredToken,
  type OcmsCredentials,
} from "./storage";
import { getValidAccessToken } from "./token";

interface AuthState {
  credentials: OcmsCredentials | null;
  ready: boolean;
  error: string | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const creds = loadCredentials();
    return { credentials: creds, ready: creds !== null, error: null };
  });

  const submitCredentials = useCallback(async (creds: OcmsCredentials) => {
    saveCredentials(creds);
    setState({ credentials: creds, ready: false, error: null });
    try {
      await getValidAccessToken();
      setState({ credentials: creds, ready: true, error: null });
    } catch (err) {
      clearStoredToken();
      setState({
        credentials: creds,
        ready: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, []);

  const logout = useCallback(() => {
    clearCredentials();
    setState({ credentials: null, ready: false, error: null });
  }, []);

  const value: AuthContextValue = useMemo(
    () => ({ ...state, submitCredentials, logout }),
    [state, submitCredentials, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
