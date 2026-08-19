import type { KeyedEntry } from "../lib/translations";
import { placeholdersIn } from "../lib/translations";
import { EmptyState } from "./EmptyState";

const HEAD =
  "border-b border-stone-200 bg-stone-50 px-4 py-2 text-left text-[10px] font-semibold tracking-wider text-stone-500 uppercase";

function Placeholders({ entry }: { entry: KeyedEntry }) {
  const used = placeholdersIn(entry.value);
  if (used.length === 0 && !entry.parameters?.length) {
    return <span className="text-stone-300">—</span>;
  }

  const declared = new Set(entry.parameters ?? []);

  return (
    <span className="flex flex-wrap gap-1">
      {used.map((name) => (
        <span
          key={name}
          title={
            declared.has(name)
              ? "Declared parameter"
              : "Placeholder not declared in parameters"
          }
          className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ring-1 ring-inset ${
            declared.has(name)
              ? "bg-stone-100 text-stone-600 ring-stone-500/20"
              : "bg-amber-50 text-amber-700 ring-amber-600/20"
          }`}
        >
          {name}
        </span>
      ))}
    </span>
  );
}

export function EntriesTable({ entries }: { entries: KeyedEntry[] }) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="No keys match this filter."
        hint="Untranslated keys are absent from the response, never empty."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className={HEAD}>Key</th>
            <th className={HEAD}>Value</th>
            <th className={HEAD}>Description</th>
            <th className={HEAD}>Parameters</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.key}
              className="border-b border-stone-100 last:border-0 hover:bg-stone-50"
            >
              <td className="px-4 py-2.5 align-top font-mono text-xs text-stone-800">
                {entry.key}
              </td>
              <td className="px-4 py-2.5 align-top text-sm text-stone-900">
                {entry.value}
              </td>
              <td className="max-w-xs px-4 py-2.5 align-top text-xs text-stone-500">
                {entry.description ?? <span className="text-stone-300">—</span>}
              </td>
              <td className="px-4 py-2.5 align-top">
                <Placeholders entry={entry} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
