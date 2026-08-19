import type { TranslateRow } from "../hooks/useTranslateDraft";

const HEAD =
  "px-3 pb-1 text-left text-[10px] font-semibold tracking-wider text-stone-500 uppercase";

const INPUT =
  "w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none";

interface TranslateEditorProps {
  rows: TranslateRow[];
  values: Record<string, string>;
  langTag: string;
  onChange: (key: string, value: string) => void;
}

function Removal() {
  return (
    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
      will be removed
    </span>
  );
}

export function TranslateEditor({
  rows,
  values,
  langTag,
  onChange,
}: TranslateEditorProps) {
  return (
    <div className="px-4 py-4">
      <table className="w-full">
        <thead>
          <tr>
            <th className={`${HEAD} w-2/5`}>Source · en-US</th>
            <th className={HEAD}>{langTag}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const value = values[row.key] ?? "";
            const clearing = row.published !== undefined && value.trim() === "";

            return (
              <tr key={row.key} className="align-top">
                <td className="px-3 py-2">
                  <p className="text-sm text-stone-800">{row.source}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-stone-400">
                    {row.key}
                    {row.parameters.length > 0 &&
                      ` · {${row.parameters.join("} {")}}`}
                  </p>
                  {row.description && (
                    <p className="mt-0.5 text-xs text-stone-500">
                      {row.description}
                    </p>
                  )}
                </td>
                <td className="px-3 py-2">
                  <input
                    value={value}
                    onChange={(e) => onChange(row.key, e.target.value)}
                    placeholder={row.inherited ?? "not translated"}
                    className={INPUT}
                  />
                  <div className="mt-1 flex items-center gap-2">
                    {row.inherited !== undefined && value.trim() === "" && (
                      <span className="text-[11px] text-stone-400">
                        inherits the managed copy
                      </span>
                    )}
                    {clearing && <Removal />}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
