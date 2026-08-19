import type { CompareRow, CompareStatus } from "../lib/translations";

const HEAD =
  "px-4 py-2 text-left text-[10px] font-semibold tracking-wider text-stone-500 uppercase";

const BADGES: Record<CompareStatus, { label: string; className: string }> = {
  same: { label: "same", className: "bg-stone-100 text-stone-500" },
  differs: { label: "differs", className: "bg-brand-50 text-brand-700" },
  leftOnly: { label: "left only", className: "bg-amber-50 text-amber-700" },
  rightOnly: { label: "right only", className: "bg-amber-50 text-amber-700" },
};

interface CompareTableProps {
  rows: CompareRow[];
  leftLabel: string;
  rightLabel: string;
}

export function CompareTable({
  rows,
  leftLabel,
  rightLabel,
}: CompareTableProps) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-stone-100">
          <th className={`${HEAD} w-1/4`}>Key</th>
          <th className={HEAD}>{leftLabel}</th>
          <th className={HEAD}>{rightLabel}</th>
          <th className={`${HEAD} w-24`} />
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const badge = BADGES[row.status];

          return (
            <tr key={row.key} className="border-b border-stone-50 align-top">
              <td className="px-4 py-2 font-mono text-xs text-stone-700">
                {row.key}
              </td>
              <td className="px-4 py-2 text-sm text-stone-800">
                {row.left ?? <span className="text-stone-400">absent</span>}
              </td>
              <td className="px-4 py-2 text-sm text-stone-800">
                {row.right ?? <span className="text-stone-400">absent</span>}
              </td>
              <td className="px-4 py-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${badge.className}`}
                >
                  {badge.label}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
