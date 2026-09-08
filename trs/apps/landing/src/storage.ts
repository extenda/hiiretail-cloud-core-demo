const PREFIX = "trs_demo-landing";

interface CachedLanguage {
  entries: Record<string, string>;
  fetchedAt: number;
}

// Storing every downloaded language on startup — not just the active one — is the point of
// this cache: it is what lets the dropdown switch languages instantly with no network wait,
// and what a language falls back to if a later startup's fetch fails.
export function saveCachedLanguage(langTag: string, entries: Record<string, string>): void {
  try {
    const value: CachedLanguage = { entries, fetchedAt: Date.now() };
    localStorage.setItem(`${PREFIX}_lang_${langTag}`, JSON.stringify(value));
  } catch {
    /* storage unavailable — the app still works, just without an offline fallback */
  }
}

export function loadCachedLanguage(langTag: string): Record<string, string> | undefined {
  try {
    const raw = localStorage.getItem(`${PREFIX}_lang_${langTag}`);

    return raw ? (JSON.parse(raw) as CachedLanguage).entries : undefined;
  } catch {
    return undefined;
  }
}

export function loadLastLanguage(): string | undefined {
  try {
    return localStorage.getItem(`${PREFIX}_lastLanguage`) ?? undefined;
  } catch {
    return undefined;
  }
}

export function saveLastLanguage(langTag: string): void {
  try {
    localStorage.setItem(`${PREFIX}_lastLanguage`, langTag);
  } catch {
    /* ignore */
  }
}

// Which tags were published last time is itself cached, separately from each tag's entries —
// otherwise a failed /language-tags call would forget every other language this startup, even
// though their entries are still sitting right here in storage from a previous one.
export function saveCachedLanguageList(tags: string[]): void {
  try {
    localStorage.setItem(`${PREFIX}_languages`, JSON.stringify(tags));
  } catch {
    /* ignore */
  }
}

export function loadCachedLanguageList(): string[] | undefined {
  try {
    const raw = localStorage.getItem(`${PREFIX}_languages`);

    return raw ? (JSON.parse(raw) as string[]) : undefined;
  } catch {
    return undefined;
  }
}

// A demo-only switch: force every fetch this startup to skip the network and go straight to
// whatever is cached, to emulate TRS being unavailable without actually taking it down.
export function isOfflineSimulated(): boolean {
  try {
    return localStorage.getItem(`${PREFIX}_simulateOffline`) === "true";
  } catch {
    return false;
  }
}

export function setOfflineSimulated(value: boolean): void {
  try {
    if (value) localStorage.setItem(`${PREFIX}_simulateOffline`, "true");
    else localStorage.removeItem(`${PREFIX}_simulateOffline`);
  } catch {
    /* ignore */
  }
}
