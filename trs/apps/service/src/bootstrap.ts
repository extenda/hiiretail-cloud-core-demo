import i18next from "i18next";
import ICU from "i18next-icu";
import { fetchLanguageTags, fetchTranslations } from "./api";
import {
  isOfflineSimulated,
  loadCachedLanguage,
  loadCachedLanguageList,
  loadLastLanguage,
  saveCachedLanguage,
  saveCachedLanguageList,
  saveLastLanguage,
} from "./storage";
import { tenantFromUrl } from "./tenant";

export interface BootstrapResult {
  tenantId?: string;
  languages: string[];
  // True if anything this startup had to fall back to a cached copy — either TRS was
  // genuinely unreachable, or the offline simulation switch is on.
  offline: boolean;
}

interface LanguageOutcome {
  entries: Record<string, string> | undefined;
  fromCache: boolean;
}

// The one fallback rule, applied identically to every language: always try TRS first: if
// it's not available (or the offline simulation switch is on), fall back to whatever this app
// cached the last time it *was* available. Nothing is ever fetched twice in the same startup,
// and a language is only lost entirely if TRS has never once been reachable for it.
//
// "Try TRS first" always means a real round trip, never a browser-HTTP-cache hit: api.ts sends
// this cached copy's ETag as `If-None-Match` and disables the browser's own cache, so a 304
// (nothing changed) and a 200 (something did) are both a genuine answer from the origin, not
// five-minute-old `Cache-Control: max-age` served without ever asking.
async function loadLanguage(
  langTag: string,
  tenantId: string | undefined,
  simulateOffline: boolean,
): Promise<LanguageOutcome> {
  const cached = loadCachedLanguage(langTag);

  if (!simulateOffline) {
    try {
      const outcome = await fetchTranslations(langTag, tenantId, cached?.etag);
      if (outcome.kind === "notModified") {
        return { entries: cached?.entries, fromCache: false };
      }
      saveCachedLanguage(langTag, outcome.data, outcome.etag);

      return { entries: outcome.data, fromCache: false };
    } catch {
      // fall through to the cache below
    }
  }

  return { entries: cached?.entries, fromCache: true };
}

function pickInitialLanguage(available: string[]): string {
  const stored = loadLastLanguage();
  if (stored && available.includes(stored)) return stored;

  const browserMatch = navigator.languages.find((tag) => available.includes(tag));
  if (browserMatch) return browserMatch;

  return available[0];
}

/*
 * Everything the app needs before its first paint: the default (en-US) keyset, fetched and
 * stored first since every other language falls back to it, then every other published
 * language, fetched and stored in parallel — "stored on startup" means exactly this, not a
 * per-switch fetch later. Switching languages afterwards is instant, off what is already in
 * localStorage / i18next's own resource store.
 */
export async function bootstrap(): Promise<BootstrapResult> {
  const tenantId = tenantFromUrl();
  const simulateOffline = isOfflineSimulated();
  let offline = simulateOffline;

  const enUS = await loadLanguage("en-US", tenantId, simulateOffline);
  offline ||= enUS.fromCache;

  await i18next.use(ICU).init({
    fallbackLng: "en-US",
    lng: "en-US",
    resources: { "en-US": { translation: enUS.entries ?? {} } },
    // Keys are flat strings like "landing.hero.title" — the dot is not a nesting separator.
    keySeparator: false,
    nsSeparator: false,
    interpolation: { escapeValue: false },
  });

  let tags: string[];
  if (simulateOffline) {
    tags = loadCachedLanguageList()?.tags ?? ["en-US"];
  } else {
    const cachedList = loadCachedLanguageList();
    try {
      const outcome = await fetchLanguageTags(cachedList?.etag);
      if (outcome.kind === "notModified") {
        tags = cachedList?.tags ?? ["en-US"];
      } else {
        tags = outcome.data;
        saveCachedLanguageList(tags, outcome.etag);
      }
    } catch {
      tags = cachedList?.tags ?? ["en-US"];
      offline = true;
    }
  }

  const others = tags.filter((tag) => tag !== "en-US");

  const loaded = await Promise.all(
    others.map(async (tag) => {
      const outcome = await loadLanguage(tag, tenantId, simulateOffline);
      offline ||= outcome.fromCache;
      if (!outcome.entries) return undefined;
      i18next.addResourceBundle(tag, "translation", outcome.entries, true, true);

      return tag;
    }),
  );

  const languages = [
    "en-US",
    ...loaded.filter((tag): tag is string => tag !== undefined).sort(),
  ];

  await i18next.changeLanguage(pickInitialLanguage(languages));

  return { tenantId, languages, offline };
}

export function setLanguage(langTag: string): void {
  saveLastLanguage(langTag);
  void i18next.changeLanguage(langTag);
}
