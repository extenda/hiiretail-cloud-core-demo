import type { TranslationEntryDto } from "../api/client";

export const MODULE_ID_PATTERN = /^[a-z][a-z0-9-]{1,63}$/;

export const TENANT_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/;

export const LANG_TAGS = [
  "en-US",
  "sv-SE",
  "nb-NO",
  "da-DK",
  "fi-FI",
  "de-DE",
  "nl-NL",
  "fr-FR",
] as const;

export const DEFAULT_LAYER_LANG_TAG = "en-US";

// A module may publish a tag this demo never listed, so the published ones lead.
export function langTagChoices(published: readonly string[] = []): string[] {
  return [...new Set([...published, ...LANG_TAGS])].sort();
}

export interface KeyedEntry extends TranslationEntryDto {
  key: string;
}

export function toKeyedEntries(entries: {
  [key: string]: TranslationEntryDto;
}): KeyedEntry[] {
  return Object.entries(entries)
    .map(([key, entry]) => ({ key, ...entry }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

export function toEntriesMap(entries: KeyedEntry[]): {
  [key: string]: TranslationEntryDto;
} {
  return Object.fromEntries(
    entries.map(({ key, value, description, parameters }) => [
      key,
      {
        value,
        ...(description ? { description } : {}),
        ...(parameters?.length ? { parameters } : {}),
      },
    ]),
  );
}

export function placeholdersIn(value: string): string[] {
  return [...value.matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map((match) => match[1]);
}

export function undeclaredPlaceholders(entry: TranslationEntryDto): string[] {
  const declared = new Set(entry.parameters ?? []);

  return placeholdersIn(entry.value).filter((name) => !declared.has(name));
}

export function matchesFilter(entry: KeyedEntry, filter: string): boolean {
  const needle = filter.trim().toLowerCase();
  if (!needle) return true;

  return (
    entry.key.toLowerCase().includes(needle) ||
    entry.value.toLowerCase().includes(needle) ||
    (entry.description ?? "").toLowerCase().includes(needle)
  );
}

export type CompareStatus = "same" | "differs" | "leftOnly" | "rightOnly";

export interface CompareRow {
  key: string;
  left?: string;
  right?: string;
  status: CompareStatus;
}

function statusOf(left?: string, right?: string): CompareStatus {
  if (left === undefined) return "rightOnly";
  if (right === undefined) return "leftOnly";

  return left === right ? "same" : "differs";
}

export function compareEntries(
  left: { [key: string]: TranslationEntryDto },
  right: { [key: string]: TranslationEntryDto },
): CompareRow[] {
  const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();

  return keys.map((key) => ({
    key,
    left: left[key]?.value,
    right: right[key]?.value,
    status: statusOf(left[key]?.value, right[key]?.value),
  }));
}
