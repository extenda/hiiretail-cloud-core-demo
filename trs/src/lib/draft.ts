import type {
  PublishableLayer,
  PublishTranslationFileDto,
  ResolvedTranslationFileDto,
} from "../api/client";
import { toKeyedEntries } from "./translations";

export interface DraftRow {
  id: number;
  key: string;
  value: string;
  description: string;
  parameters: string;
}

let nextId = 0;

export function emptyRow(): DraftRow {
  nextId += 1;

  return { id: nextId, key: "", value: "", description: "", parameters: "" };
}

export function rowsFromFile(file: ResolvedTranslationFileDto): DraftRow[] {
  return toKeyedEntries(file.entries).map((entry) => ({
    ...emptyRow(),
    key: entry.key,
    value: entry.value,
    description: entry.description ?? "",
    parameters: (entry.parameters ?? []).join(", "),
  }));
}

function parseParameters(raw: string): string[] {
  return raw
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name !== "");
}

export function rowsToBody(
  rows: DraftRow[],
  layer: PublishableLayer,
): PublishTranslationFileDto {
  const entries = rows.map((row) => {
    const parameters = parseParameters(row.parameters);
    const description = row.description.trim();

    return [
      row.key.trim(),
      layer === "default"
        ? {
            value: row.value,
            ...(description ? { description } : {}),
            ...(parameters.length ? { parameters } : {}),
          }
        : { value: row.value },
    ] as const;
  });

  return { entries: Object.fromEntries(entries) };
}

export function validateRows(rows: DraftRow[]): string[] {
  const problems: string[] = [];
  const keys = rows.map((row) => row.key.trim());

  if (rows.length === 0) {
    problems.push("At least one key is required.");
  }
  if (keys.some((key) => key === "")) {
    problems.push("Every row needs a key.");
  }
  if (rows.some((row) => row.value.trim() === "")) {
    problems.push("Every row needs a value.");
  }

  const duplicates = keys.filter(
    (key, index) => key !== "" && keys.indexOf(key) !== index,
  );
  if (duplicates.length > 0) {
    problems.push(`Duplicate keys: ${[...new Set(duplicates)].join(", ")}`);
  }

  return problems;
}
