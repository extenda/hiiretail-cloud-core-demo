/**
 * Project restrictions compare item attributes by value, so a demo has to be
 * able to send a real boolean or number, not just strings.
 */
export type AttributeKind = "string" | "number" | "boolean";

export interface AttributeRow {
  id: number;
  key: string;
  value: string;
  kind: AttributeKind;
}

let nextId = 1;

export function attributeRow(
  key = "",
  value = "",
  kind: AttributeKind = "string",
): AttributeRow {
  return { id: nextId++, key, value, kind };
}

export function rowsFromAttributes(
  attributes: Record<string, unknown>,
): AttributeRow[] {
  return Object.entries(attributes).map(([key, value]) =>
    attributeRow(
      key,
      String(value),
      typeof value === "boolean"
        ? "boolean"
        : typeof value === "number"
          ? "number"
          : "string",
    ),
  );
}

export function toAttributes(rows: AttributeRow[]): Record<string, unknown> {
  return Object.fromEntries(
    rows
      .filter((row) => row.key.trim() !== "")
      .map((row) => [row.key.trim(), castValue(row)]),
  );
}

function castValue(row: AttributeRow): unknown {
  if (row.kind === "boolean") return row.value === "true";
  if (row.kind === "number") {
    const parsed = Number(row.value);

    return Number.isFinite(parsed) ? parsed : row.value;
  }

  return row.value;
}
