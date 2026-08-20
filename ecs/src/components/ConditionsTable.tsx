import type { EntityConditionViewDto } from "../api/client";
import { conditionValueSummary } from "../lib/conditions";
import { Badge } from "./Badge";
import { EmptyState } from "./EmptyState";

const CELL = "px-4 py-2.5 text-sm";

export function ConditionsTable({
  conditions,
  onEdit,
  onDelete,
  deletingId,
}: {
  conditions: EntityConditionViewDto[];
  onEdit: (condition: EntityConditionViewDto) => void;
  onDelete: (condition: EntityConditionViewDto) => void;
  deletingId: string | null;
}) {
  if (conditions.length === 0) {
    return (
      <EmptyState
        title="No conditions match."
        hint="Global conditions come from the platform; tenant conditions are the ones you create here."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
            <th className="px-4 py-2">Id</th>
            <th className="px-4 py-2">Rule</th>
            <th className="px-4 py-2">Scope</th>
            <th className="px-4 py-2">Enabled</th>
            <th className="px-4 py-2">Value</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {conditions.map((condition) => {
            const isGlobal = condition.scope === "GLOBAL";

            return (
              <tr
                key={`${condition.scope}-${condition.id}`}
                className="border-b border-stone-100 hover:bg-stone-50"
              >
                <td className={`${CELL} font-mono text-stone-900`}>
                  {condition.id}
                </td>
                <td className={CELL}>
                  <Badge mono tone="info">
                    {condition.rule}
                  </Badge>
                </td>
                <td className={CELL}>
                  <Badge tone={isGlobal ? "neutral" : "brand"}>
                    {condition.scope}
                  </Badge>
                </td>
                <td className={CELL}>
                  <Badge tone={condition.enabled ? "success" : "warning"}>
                    {condition.enabled ? "enabled" : "disabled"}
                  </Badge>
                </td>
                <td className={`${CELL} font-mono text-xs text-stone-600`}>
                  {conditionValueSummary(condition)}
                </td>
                <td className={`${CELL} text-right whitespace-nowrap`}>
                  {isGlobal ? (
                    <span className="text-xs text-stone-400">read-only</span>
                  ) : (
                    <span className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => onEdit(condition)}
                        className="text-xs font-medium text-brand-600 hover:text-brand-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(condition)}
                        disabled={deletingId === condition.id}
                        className="text-xs font-medium text-red-700 hover:text-red-800 disabled:opacity-50"
                      >
                        {deletingId === condition.id ? "Deleting…" : "Delete"}
                      </button>
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
