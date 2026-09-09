const PREFIX = "trs_demo-service";

export interface CachedLanguage {
  entries: Record<string, string>;
  // The ETag this copy was fetched with, so the next startup can send `If-None-Match` instead
  // of trusting the response's own `Cache-Control` — see api.ts for why that matters.
  etag: string | null;
  fetchedAt: number;
}

// Storing every downloaded language on startup — not just the active one — is the point of
// this cache: it is what lets the dropdown switch languages instantly with no network wait,
// and what a language falls back to if a later startup's fetch fails.
export function saveCachedLanguage(
  langTag: string,
  entries: Record<string, string>,
  etag: string | null,
): void {
  try {
    const value: CachedLanguage = { entries, etag, fetchedAt: Date.now() };
    localStorage.setItem(`${PREFIX}_lang_${langTag}`, JSON.stringify(value));
  } catch {
    /* storage unavailable — the app still works, just without an offline fallback */
  }
}

export function loadCachedLanguage(langTag: string): CachedLanguage | undefined {
  try {
    const raw = localStorage.getItem(`${PREFIX}_lang_${langTag}`);

    return raw ? (JSON.parse(raw) as CachedLanguage) : undefined;
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

export interface CachedLanguageList {
  tags: string[];
  etag: string | null;
}

// Which tags were published last time is itself cached, separately from each tag's entries —
// otherwise a failed /language-tags call would forget every other language this startup, even
// though their entries are still sitting right here in storage from a previous one.
export function saveCachedLanguageList(tags: string[], etag: string | null): void {
  try {
    const value: CachedLanguageList = { tags, etag };
    localStorage.setItem(`${PREFIX}_languages`, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function loadCachedLanguageList(): CachedLanguageList | undefined {
  try {
    const raw = localStorage.getItem(`${PREFIX}_languages`);

    return raw ? (JSON.parse(raw) as CachedLanguageList) : undefined;
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
