import type { ReactNode } from "react";
import { useAuth } from "./useAuth";
import { CredentialsForm } from "./CredentialsForm";

export function AuthGate({ children }: { children: ReactNode }) {
  const { ready } = useAuth();

  if (!ready) {
    return <CredentialsForm />;
  }

  return <>{children}</>;
}
