import {
  attributeRow,
  type AttributeKind,
  type AttributeRow,
} from "../lib/attributes";
import { INPUT, SECONDARY_BUTTON } from "../lib/ui";

const KINDS: AttributeKind[] = ["string", "number", "boolean"];

export function AttributeEditor({
  rows,
  onChange,
}: {
  rows: AttributeRow[];
  onChange: (rows: AttributeRow[]) => void;
}) {
  const update = (id: number, patch: Partial<AttributeRow>) =>
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.id} className="flex gap-2">
          <input
            value={row.key}
            onChange={(event) => update(row.id, { key: event.target.value })}
            placeholder="propertyName"
            aria-label="Attribute name"
            className={`${INPUT} font-mono`}
          />
          {row.kind === "boolean" ? (
            <select
              value={row.value === "true" ? "true" : "false"}
              onChange={(event) => update(row.id, { value: event.target.value })}
              aria-label="Attribute value"
              className={`${INPUT} font-mono`}
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          ) : (
            <input
              value={row.value}
              type={row.kind === "number" ? "number" : "text"}
              onChange={(event) => update(row.id, { value: event.target.value })}
              placeholder="value"
              aria-label="Attribute value"
              className={`${INPUT} font-mono`}
            />
          )}
          <select
            value={row.kind}
            onChange={(event) =>
              update(row.id, { kind: event.target.value as AttributeKind })
            }
            aria-label="Attribute type"
            className="rounded-lg border border-stone-300 bg-white px-2 py-2 text-xs text-stone-600 focus:border-brand-500 focus:outline-none"
          >
            {KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onChange(rows.filter((other) => other.id !== row.id))}
            aria-label={`Remove ${row.key || "attribute"}`}
            className="px-1 text-sm text-stone-400 hover:text-red-700"
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        className={SECONDARY_BUTTON}
        onClick={() => onChange([...rows, attributeRow()])}
      >
        Add attribute
      </button>
    </div>
  );
}
