import { createContext } from "react";
import type { SlotId, TokenSlots } from "./storage";
import type { TokenInfo } from "./token-info";

export interface AuthContextValue {
  ready: boolean;
  slots: TokenSlots;
  infos: Partial<Record<SlotId, TokenInfo>>;
  setToken: (slot: SlotId, raw: string) => string | null;
  clearToken: (slot: SlotId) => void;
  continueAnonymously: () => void;
  reset: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
