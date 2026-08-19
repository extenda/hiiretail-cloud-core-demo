export type SlotId = "extenda" | "tenant";

export type TokenSlots = Partial<Record<SlotId, string>>;

const TOKENS_KEY = "trs_tokens";
const ANONYMOUS_KEY = "trs_anonymous";

export const SLOT_IDS: readonly SlotId[] = ["extenda", "tenant"];

export function loadSlots(): TokenSlots {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    return Object.fromEntries(
      SLOT_IDS.filter((slot) => typeof parsed[slot] === "string").map((slot) => [
        slot,
        parsed[slot] as string,
      ]),
    );
  } catch {
    return {};
  }
}

export function saveSlots(slots: TokenSlots): void {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(slots));
}

export function clearSlots(): void {
  localStorage.removeItem(TOKENS_KEY);
}

export function loadAnonymousChoice(): boolean {
  return localStorage.getItem(ANONYMOUS_KEY) === "true";
}

export function saveAnonymousChoice(): void {
  localStorage.setItem(ANONYMOUS_KEY, "true");
}

export function clearAnonymousChoice(): void {
  localStorage.removeItem(ANONYMOUS_KEY);
}
