import type { PublishableLayer } from "../api/client";
import type { DraftRow } from "../lib/draft";
import { placeholdersIn } from "../lib/translations";

const CELL_INPUT =
  "w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none";
const HEAD =
  "px-3 pb-1 text-left text-[10px] font-semibold tracking-wider text-stone-500 uppercase";

interface EntryEditorProps {
  rows: DraftRow[];
  layer: PublishableLayer;
  onChange: (id: number, patch: Partial<DraftRow>) => void;
  onRemove: (id: number) => void;
  onAdd: () => void;
}

function hint(row: DraftRow, layer: PublishableLayer): string | null {
  if (layer !== "default") return null;
  const declared = new Set(
    row.parameters
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean),
  );
  const missing = placeholdersIn(row.value).filter(
    (name) => !declared.has(name),
  );
  if (missing.length === 0) return null;

  return `Undeclared placeholder: ${missing.join(", ")}`;
}

export function EntryEditor({
  rows,
  layer,
  onChange,
  onRemove,
  onAdd,
}: EntryEditorProps) {
  const isDefault = layer === "default";

  return (
    <div className="px-4 py-4">
      {isDefault ? null : (
        <p className="mb-3 rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-500">
          A <span className="font-mono">{layer}</span> file carries the
          translated value alone. Descriptions and parameters stay as the{" "}
          <span className="font-mono">default</span> layer declared them, and a
          key the module never declared is rejected with{" "}
          <span className="font-mono">422</span>.
        </p>
      )}

      <table className="w-full">
        <thead>
          <tr>
            <th className={`${HEAD} w-1/4`}>Key</th>
            <th className={HEAD}>Value</th>
            {isDefault && <th className={`${HEAD} w-1/5`}>Description</th>}
            {isDefault && <th className={`${HEAD} w-1/6`}>Parameters</th>}
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const problem = hint(row, layer);

            return (
              <tr key={row.id} className="align-top">
                <td className="px-3 py-1">
                  <input
                    value={row.key}
                    onChange={(e) => onChange(row.id, { key: e.target.value })}
                    placeholder="pay.button.label"
                    className={`${CELL_INPUT} font-mono text-xs`}
                  />
                </td>
                <td className="px-3 py-1">
                  <input
                    value={row.value}
                    onChange={(e) => onChange(row.id, { value: e.target.value })}
                    placeholder="Pay {amount}"
                    className={CELL_INPUT}
                  />
                  {problem && (
                    <p className="mt-1 text-[11px] text-amber-700">{problem}</p>
                  )}
                </td>
                {isDefault && (
                  <td className="px-3 py-1">
                    <input
                      value={row.description}
                      onChange={(e) =>
                        onChange(row.id, { description: e.target.value })
                      }
                      placeholder="Label on the pay button."
                      className={CELL_INPUT}
                    />
                  </td>
                )}
                {isDefault && (
                  <td className="px-3 py-1">
                    <input
                      value={row.parameters}
                      onChange={(e) =>
                        onChange(row.id, { parameters: e.target.value })
                      }
                      placeholder="amount"
                      className={`${CELL_INPUT} font-mono text-xs`}
                    />
                  </td>
                )}
                <td className="px-1 py-1">
                  <button
                    type="button"
                    onClick={() => onRemove(row.id)}
                    aria-label={`Remove ${row.key || "row"}`}
                    className="mt-1 h-7 w-7 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-red-700"
                  >
                    ×
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button
        type="button"
        onClick={onAdd}
        className="mt-3 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
      >
        Add key
      </button>
    </div>
  );
}
