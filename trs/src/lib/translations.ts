import type { PluralCategory } from "../api/client";

export const TENANT_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/;

export type PluralForms = Partial<Record<PluralCategory, string>>;

export const LANG_TAGS = [
  "en-US",
  "sv-SE",
  "nb-NO",
  "da-DK",
  "fi-FI",
  "de-DE",
  "nl-NL",
  "fr-FR",
  "uk-UA",
] as const;

export const DEFAULT_LAYER_LANG_TAG = "en-US";

export function languageName(langTag: string): string {
  try {
    return (
      new Intl.DisplayNames(["en"], { type: "language" }).of(langTag) ?? langTag
    );
  } catch {
    return langTag;
  }
}

// A module may publish a tag this demo never listed, so the published ones lead.
export function langTagChoices(published: readonly string[] = []): string[] {
  return [...new Set([...published, ...LANG_TAGS])].sort();
}

// The screen's default target: the first *published* tag that isn't the English source (there
// is nothing to "translate" into English) — favoring what's already started over an arbitrary
// alphabetical pick from the full candidate list — falling back to the first candidate
// otherwise.
export function defaultTargetLangTag(published: readonly string[] = []): string {
  const startedFirst = [...published]
    .filter((tag) => tag !== DEFAULT_LAYER_LANG_TAG)
    .sort();
  if (startedFirst.length > 0) return startedFirst[0];

  return LANG_TAGS.find((tag) => tag !== DEFAULT_LAYER_LANG_TAG) ?? DEFAULT_LAYER_LANG_TAG;
}

export function placeholdersIn(value: string): string[] {
  return [...value.matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map((match) => match[1]);
}

// The service compiles plurals with CLDR at read time and never parses ICU itself (ADR-0006);
// the browser's own Intl.PluralRules carries the same CLDR data, so it is what tells this UI
// which categories a language tag actually needs, without hardcoding a CLDR table.
export function requiredPluralCategories(langTag: string): PluralCategory[] {
  try {
    return new Intl.PluralRules(langTag).resolvedOptions()
      .pluralCategories as PluralCategory[];
  } catch {
    return ["other"];
  }
}

export interface UploadedValue {
  value: string;
  forms?: PluralForms;
}

/*
 * What the Translations screen's "Upload JSON" button accepts: the same flat, unwrapped shape
 * the keysets/ directory now uses (`{ key: { value, plural?: { forms } } }`), a file already
 * wrapped in `entries` (unwrapped here the same way the publish action does), or, for a
 * translator who just has plain strings, `{ key: "value" }` with no plural support.
 */
export function parseUploadedTranslations(
  text: string,
): { entries: Record<string, UploadedValue> } | { error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { error: "That file isn't valid JSON." };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { error: "Expected a JSON object of translation keys." };
  }

  const record = parsed as Record<string, unknown>;
  const body =
    Object.keys(record).length === 1 &&
    "entries" in record &&
    typeof record.entries === "object" &&
    record.entries !== null &&
    !Array.isArray(record.entries)
      ? (record.entries as Record<string, unknown>)
      : record;

  const entries: Record<string, UploadedValue> = {};
  for (const [key, raw] of Object.entries(body)) {
    if (typeof raw === "string") {
      entries[key] = { value: raw };
      continue;
    }
    if (typeof raw === "object" && raw !== null && typeof (raw as { value?: unknown }).value === "string") {
      const entry = raw as { value: string; plural?: { forms?: PluralForms } };
      entries[key] = { value: entry.value, forms: entry.plural?.forms };
      continue;
    }
    return { error: `"${key}" isn't a string or a {value, plural} object.` };
  }

  return { entries };
}

export interface FilterableRow {
  key: string;
  source: string;
  description?: string;
}

export function matchesFilter(row: FilterableRow, filter: string): boolean {
  const needle = filter.trim().toLowerCase();
  if (!needle) return true;

  return (
    row.key.toLowerCase().includes(needle) ||
    row.source.toLowerCase().includes(needle) ||
    (row.description ?? "").toLowerCase().includes(needle)
  );
}
