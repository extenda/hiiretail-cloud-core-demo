import type { ReactNode } from "react";
import { useAuth } from "./useAuth";
import { TokenForm } from "./TokenForm";

export function AuthGate({ children }: { children: ReactNode }) {
  const { ready } = useAuth();

  if (!ready) {
    return <TokenForm />;
  }

  return <>{children}</>;
}
