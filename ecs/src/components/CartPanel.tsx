import type { EntityConditionViewDto } from "../api/client";
import type { CartLine, LineSummary } from "../lib/checkout";
import { cartTotal } from "../lib/checkout";
import { formatPrice } from "../lib/catalog";
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from "../lib/ui";
import { Badge } from "./Badge";
import { DecisionPill } from "./DecisionPill";
import { EmptyState } from "./EmptyState";
import { Panel } from "./Panel";

const CELL = "px-4 py-2.5 text-sm align-top";

function LineStatus({ summary }: { summary: LineSummary | undefined }) {
  if (!summary) return <span className="text-xs text-stone-400">—</span>;

  if (summary.state === "ERROR") {
    return (
      <Badge tone="danger" title={summary.failures[0]?.failure.message}>
        {summary.failures[0]?.failure.status ?? "error"}
      </Badge>
    );
  }
  if (summary.state === "NO_CONDITIONS") {
    return <Badge tone="neutral">nothing to check</Badge>;
  }
  if (summary.state === "UNCHECKED") {
    return (
      <Badge
        tone="warning"
        title="The condition resolved but no rule ran — the evaluation bundle has not picked it up yet."
      >
        not evaluated
      </Badge>
    );
  }

  return <DecisionPill decision={summary.decision} showCode={false} />;
}

function ConditionChips({
  line,
  conditions,
  catalogLoaded,
  onDetach,
}: {
  line: CartLine;
  conditions: EntityConditionViewDto[];
  catalogLoaded: boolean;
  onDetach: (conditionId: string) => void;
}) {
  const byId = new Map(conditions.map((condition) => [condition.id, condition]));

  return (
    <span className="flex flex-wrap gap-1">
      {line.conditionIds.map((id) => {
        const condition = byId.get(id);
        const tone = !condition
          ? catalogLoaded
            ? "warning"
            : "neutral"
          : condition.enabled
            ? "brand"
            : "neutral";
        const title = !condition
          ? catalogLoaded
            ? "Not in the tenant's catalog — this call answers 404"
            : "The condition catalog has not been read yet"
          : `${condition.rule} · ${condition.scope}${condition.enabled ? "" : " · disabled"}`;

        return (
          <span key={id} className="inline-flex items-center gap-1">
            <Badge mono tone={tone} title={title}>
              {id}
            </Badge>
            <button
              type="button"
              onClick={() => onDetach(id)}
              aria-label={`Remove ${id} from ${line.name}`}
              className="text-xs text-stone-400 hover:text-red-700"
            >
              ×
            </button>
          </span>
        );
      })}
    </span>
  );
}

export function CartPanel({
  lines,
  conditions,
  catalogLoaded,
  summaries,
  evaluating,
  onQuantity,
  onRemove,
  onAttach,
  onDetach,
  onClear,
  onEvaluate,
}: {
  lines: CartLine[];
  conditions: EntityConditionViewDto[];
  catalogLoaded: boolean;
  summaries: Map<string, LineSummary> | null;
  evaluating: boolean;
  onQuantity: (sku: string, quantity: number) => void;
  onRemove: (sku: string) => void;
  onAttach: (sku: string, conditionId: string) => void;
  onDetach: (sku: string, conditionId: string) => void;
  onClear: () => void;
  onEvaluate: () => void;
}) {
  return (
    <Panel
      title="Basket"
      subtitle="One call per line per condition — the checkout aggregates the decisions."
      actions={
        <>
          <button
            type="button"
            className={SECONDARY_BUTTON}
            onClick={onClear}
            disabled={lines.length === 0}
          >
            Clear
          </button>
          <button
            type="button"
            className={PRIMARY_BUTTON}
            onClick={onEvaluate}
            disabled={lines.length === 0 || evaluating}
          >
            {evaluating ? "Evaluating…" : "Evaluate basket"}
          </button>
        </>
      }
    >
      {lines.length === 0 ? (
        <EmptyState
          title="The basket is empty."
          hint="Add an item to ask ECS for a decision."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs font-semibold tracking-wide text-stone-500 uppercase">
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">Qty</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Conditions</th>
                <th className="px-4 py-2">Decision</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => {
                const available = conditions.filter(
                  (condition) => !line.conditionIds.includes(condition.id),
                );

                return (
                  <tr
                    key={line.sku}
                    className="border-b border-stone-100 hover:bg-stone-50"
                  >
                    <td className={CELL}>
                      <span className="flex items-baseline gap-2">
                        <span aria-hidden="true">{line.glyph}</span>
                        <span>
                          <span className="block text-stone-900">
                            {line.name}
                          </span>
                          <span className="block font-mono text-xs text-stone-400">
                            {line.sku}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className={CELL}>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label={`One less ${line.name}`}
                          onClick={() =>
                            onQuantity(line.sku, line.quantity - 1)
                          }
                          className="h-6 w-6 rounded-lg border border-stone-300 text-xs text-stone-600 hover:bg-stone-100"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-mono text-xs">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`One more ${line.name}`}
                          onClick={() =>
                            onQuantity(line.sku, line.quantity + 1)
                          }
                          className="h-6 w-6 rounded-lg border border-stone-300 text-xs text-stone-600 hover:bg-stone-100"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className={`${CELL} font-mono text-xs text-stone-600`}>
                      {formatPrice(line.price * line.quantity)}
                    </td>
                    <td className={CELL}>
                      <ConditionChips
                        line={line}
                        conditions={conditions}
                        catalogLoaded={catalogLoaded}
                        onDetach={(conditionId) => onDetach(line.sku, conditionId)}
                      />
                      {available.length > 0 && (
                        <select
                          value=""
                          onChange={(event) => {
                            if (event.target.value) {
                              onAttach(line.sku, event.target.value);
                            }
                          }}
                          aria-label={`Attach a condition to ${line.name}`}
                          className="mt-1.5 rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs text-stone-600 focus:border-brand-500 focus:outline-none"
                        >
                          <option value="">+ condition</option>
                          {available.map((condition) => (
                            <option key={condition.id} value={condition.id}>
                              {condition.id} ({condition.rule})
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className={`${CELL} whitespace-nowrap`}>
                      <LineStatus summary={summaries?.get(line.sku)} />
                    </td>
                    <td className={`${CELL} text-right`}>
                      <button
                        type="button"
                        onClick={() => onRemove(line.sku)}
                        aria-label={`Remove ${line.name}`}
                        className="text-sm text-stone-400 hover:text-red-700"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-stone-500">
              {lines.length} line{lines.length === 1 ? "" : "s"}
            </span>
            <span className="font-mono text-stone-900">
              {formatPrice(cartTotal(lines))}
            </span>
          </div>
        </div>
      )}
    </Panel>
  );
}
