import { useState } from "react";
import { AttributeEditor } from "../components/AttributeEditor";
import { Badge } from "../components/Badge";
import { DecisionPill } from "../components/DecisionPill";
import { EmptyState } from "../components/EmptyState";
import { ErrorBlock } from "../components/ErrorBlock";
import { JsonBlock } from "../components/JsonBlock";
import { Panel } from "../components/Panel";
import { useProjectRestrictionEvaluation } from "../hooks/useProjectRestrictionEvaluation";
import { rowsFromAttributes, toAttributes, type AttributeRow } from "../lib/attributes";
import { DEMO_CATALOG } from "../lib/catalog";
import { isUnchecked, reasonText } from "../lib/decisions";
import { FIELD_LABEL, INPUT, PRIMARY_BUTTON } from "../lib/ui";

const FIRST_PRODUCT = DEMO_CATALOG[0];

export function ProjectRestrictionsPage() {
  const evaluation = useProjectRestrictionEvaluation();

  const [projectId, setProjectId] = useState("");
  const [itemId, setItemId] = useState(FIRST_PRODUCT.sku);
  const [rows, setRows] = useState<AttributeRow[]>(() =>
    rowsFromAttributes(FIRST_PRODUCT.attributes),
  );

  const loadProduct = (sku: string) => {
    const product = DEMO_CATALOG.find((candidate) => candidate.sku === sku);
    if (!product) return;

    setItemId(product.sku);
    setRows(rowsFromAttributes(product.attributes));
  };

  const evaluate = () =>
    evaluation.mutate({
      projectId: projectId.trim(),
      itemId: itemId.trim(),
      attributes: toAttributes(rows),
    });

  const decision = evaluation.data?.decision;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-normal text-stone-900">
          Project restrictions
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Restrictions live in the customer registry, not in the condition
          catalog. ECS fetches them for the project on every call and decides the
          item against them.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Item" subtitle="What the checkout would send for one line.">
          <div className="space-y-4 p-4">
            <div>
              <label htmlFor="pr-project-id" className={FIELD_LABEL}>
                CRS project id
              </label>
              <input
                id="pr-project-id"
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                placeholder="fc03c9aa-bbb9-413d-997a-be8e9f6f28f0"
                className={`${INPUT} font-mono`}
              />
            </div>

            <div>
              <label htmlFor="pr-item-id" className={FIELD_LABEL}>
                Item id
              </label>
              <input
                id="pr-item-id"
                value={itemId}
                onChange={(event) => setItemId(event.target.value)}
                className={`${INPUT} font-mono`}
              />
              <p className="mt-1 text-xs text-stone-400">
                BLACKLISTEDITEMS restrictions match on this id.
              </p>
            </div>

            <div>
              <label htmlFor="pr-product" className={FIELD_LABEL}>
                Load a demo item
              </label>
              <select
                id="pr-product"
                value=""
                onChange={(event) => loadProduct(event.target.value)}
                className={INPUT}
              >
                <option value="">pick an item…</option>
                {DEMO_CATALOG.map((product) => (
                  <option key={product.sku} value={product.sku}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className={FIELD_LABEL}>
                Attributes{" "}
                <span className="font-mono text-stone-400">
                  item.additionalProperties
                </span>
              </p>
              <AttributeEditor rows={rows} onChange={setRows} />
              <p className="mt-2 text-xs text-stone-400">
                BOOLEAN restrictions compare one attribute to a required value;
                WHITELIST restrictions check it against a list of allowed values.
              </p>
            </div>

            <button
              type="button"
              className={PRIMARY_BUTTON}
              disabled={
                projectId.trim() === "" ||
                itemId.trim() === "" ||
                evaluation.isPending
              }
              onClick={evaluate}
            >
              {evaluation.isPending ? "Evaluating…" : "Evaluate"}
            </button>
          </div>
        </Panel>

        <div className="space-y-4">
          {evaluation.isError && (
            <ErrorBlock title="Evaluation failed">
              {(evaluation.error as Error).message}
            </ErrorBlock>
          )}

          <Panel
            title="Decision"
            subtitle="One result per restriction the project carries."
            actions={
              decision ? (
                <DecisionPill
                  decision={decision.allow ? "ALLOW" : "HARD_DENY"}
                  showCode={false}
                />
              ) : undefined
            }
          >
            {!decision ? (
              <EmptyState
                title="No decision yet."
                hint="Enter a project id and evaluate the item."
              />
            ) : isUnchecked(decision) ? (
              <div className="p-4 text-sm text-stone-600">
                The project has no restrictions, so there was nothing to check —
                the item is allowed by default.
              </div>
            ) : (
              <ul>
                {decision.results.map((result, index) => (
                  <li
                    key={`${result.restriction ?? "restriction"}-${index}`}
                    className="flex flex-wrap items-baseline gap-2 border-b border-stone-100 px-4 py-2.5 last:border-b-0"
                  >
                    <DecisionPill decision={result.decision} showCode={false} />
                    {result.restriction && (
                      <Badge mono tone="info">
                        {result.restriction}
                      </Badge>
                    )}
                    <span className="text-sm text-stone-700">
                      {reasonText(result.reason) ?? "Allowed."}
                    </span>
                    {result.reason && (
                      <span className="font-mono text-[10px] text-stone-400">
                        {result.reason}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {evaluation.data && (
            <Panel title="Raw call">
              <div className="p-4">
                <JsonBlock
                  value={{
                    request: (evaluation.data.request as { body?: unknown }).body,
                    response: evaluation.data.decision,
                  }}
                  maxHeight="max-h-80"
                />
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
