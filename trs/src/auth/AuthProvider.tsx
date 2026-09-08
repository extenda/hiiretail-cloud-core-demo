import { useCallback, useMemo, useState, type ReactNode } from "react";
import { AuthContext, type AuthContextValue } from "./AuthContext";
import {
  clearAnonymousChoice,
  clearSlots,
  loadAnonymousChoice,
  loadSlots,
  saveAnonymousChoice,
  saveSlots,
  type SlotId,
  type TokenSlots,
} from "./storage";
import { inspectToken, normalizeToken, type TokenInfo } from "./token-info";

function infosOf(slots: TokenSlots): Partial<Record<SlotId, TokenInfo>> {
  const entries = Object.entries(slots).flatMap(([slot, token]) => {
    const inspection = inspectToken(token);

    return inspection.ok ? [[slot, inspection.info] as const] : [];
  });

  return Object.fromEntries(entries);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [slots, setSlots] = useState<TokenSlots>(loadSlots);
  const [ready, setReady] = useState(
    () => loadAnonymousChoice() || Object.keys(loadSlots()).length > 0,
  );

  // Deliberately does not flip `ready` — the login screen shows both slots at once so a PM
  // and a tenant admin can each paste their token before continuing; committing the first one
  // must not yank the form away before the second is in.
  const setToken = useCallback((slot: SlotId, raw: string): string | null => {
    const token = normalizeToken(raw);
    const inspection = inspectToken(token);
    if (!inspection.ok) {
      return inspection.reason;
    }

    setSlots((current) => {
      const next = { ...current, [slot]: token };
      saveSlots(next);

      return next;
    });

    return null;
  }, []);

  const clearToken = useCallback((slot: SlotId) => {
    setSlots((current) => {
      const next = { ...current };
      delete next[slot];
      saveSlots(next);

      return next;
    });
  }, []);

  const continueAnonymously = useCallback(() => {
    saveAnonymousChoice();
    setReady(true);
  }, []);

  const enter = useCallback(() => {
    setReady(true);
  }, []);

  const reset = useCallback(() => {
    clearSlots();
    clearAnonymousChoice();
    setSlots({});
    setReady(false);
  }, []);

  const value: AuthContextValue = useMemo(
    () => ({
      ready,
      slots,
      infos: infosOf(slots),
      setToken,
      clearToken,
      continueAnonymously,
      enter,
      reset,
    }),
    [ready, slots, setToken, clearToken, continueAnonymously, enter, reset],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
