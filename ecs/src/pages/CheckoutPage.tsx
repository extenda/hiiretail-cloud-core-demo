import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CartPanel } from "../components/CartPanel";
import { CatalogPanel } from "../components/CatalogPanel";
import { CustomerPanel } from "../components/CustomerPanel";
import { ErrorBlock } from "../components/ErrorBlock";
import { ProjectContextPanel } from "../components/ProjectContextPanel";
import { ReceiptPanel } from "../components/ReceiptPanel";
import { useCheckoutEvaluation } from "../hooks/useCheckoutEvaluation";
import { useConditions } from "../hooks/useConditions";
import type { CatalogProduct } from "../lib/catalog";
import {
  EMPTY_CUSTOMER,
  summarizeLine,
  toCartLine,
  type CartLine,
  type CustomerState,
  type LineSummary,
  type Prompt,
} from "../lib/checkout";
import { LINK_BUTTON } from "../lib/ui";

export function CheckoutPage() {
  const conditionsQuery = useConditions();
  const evaluation = useCheckoutEvaluation();

  const [lines, setLines] = useState<CartLine[]>([]);
  const [customer, setCustomer] = useState<CustomerState>(EMPTY_CUSTOMER);
  const [projectId, setProjectId] = useState("");
  const ageInputRef = useRef<HTMLInputElement>(null);

  const conditions = conditionsQuery.data ?? [];

  const summaries = useMemo<Map<string, LineSummary> | null>(() => {
    if (!evaluation.data) return null;

    return new Map(
      evaluation.data.lines.map((line) => [line.sku, summarizeLine(line)]),
    );
  }, [evaluation.data]);

  const addProduct = (product: CatalogProduct) => {
    setLines((current) => {
      const existing = current.find((line) => line.sku === product.sku);
      if (existing) {
        return current.map((line) =>
          line.sku === product.sku
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      }

      return [...current, toCartLine(product)];
    });
  };

  const updateLine = (sku: string, update: (line: CartLine) => CartLine) =>
    setLines((current) =>
      current.map((line) => (line.sku === sku ? update(line) : line)),
    );

  const evaluate = () => evaluation.mutate({ lines, customer, projectId });

  const answerPrompt = (prompt: Prompt) => {
    if (prompt === "AGE") {
      setCustomer((current) => ({ ...current, ageAsked: true }));
      requestAnimationFrame(() => ageInputRef.current?.focus());
    } else {
      setCustomer((current) => ({ ...current, licensesResolved: true }));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-normal text-stone-900">Checkout</h1>
        <p className="mt-1 text-sm text-stone-500">
          A stand-in POS. Add items, answer what the operator would answer, and
          every line is decided by the Entity Conditions Service.
        </p>
      </div>

      {conditionsQuery.isError && (
        <ErrorBlock title="Could not load the condition catalog">
          {(conditionsQuery.error as Error).message}
        </ErrorBlock>
      )}

      {conditionsQuery.isSuccess && conditions.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This tenant has no conditions at all — every evaluation will answer
          404.{" "}
          <Link to="/conditions" className={LINK_BUTTON}>
            Create one on the Condition catalog screen
          </Link>
          .
        </div>
      )}

      {evaluation.isError && (
        <ErrorBlock title="Evaluation failed">
          {(evaluation.error as Error).message}
        </ErrorBlock>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <CustomerPanel
            customer={customer}
            conditions={conditions}
            onChange={setCustomer}
            ageInputRef={ageInputRef}
          />
          <ProjectContextPanel projectId={projectId} onChange={setProjectId} />
          <CatalogPanel
            conditions={conditions}
            catalogLoaded={conditionsQuery.isSuccess}
            onAdd={addProduct}
          />
        </div>

        <div className="space-y-4 lg:col-span-2">
          <CartPanel
            lines={lines}
            conditions={conditions}
            catalogLoaded={conditionsQuery.isSuccess}
            summaries={summaries}
            evaluating={evaluation.isPending}
            onQuantity={(sku, quantity) =>
              quantity <= 0
                ? setLines((current) =>
                    current.filter((line) => line.sku !== sku),
                  )
                : updateLine(sku, (line) => ({ ...line, quantity }))
            }
            onRemove={(sku) =>
              setLines((current) => current.filter((line) => line.sku !== sku))
            }
            onAttach={(sku, conditionId) =>
              updateLine(sku, (line) => ({
                ...line,
                conditionIds: [...line.conditionIds, conditionId],
              }))
            }
            onDetach={(sku, conditionId) =>
              updateLine(sku, (line) => ({
                ...line,
                conditionIds: line.conditionIds.filter(
                  (id) => id !== conditionId,
                ),
              }))
            }
            onClear={() => {
              setLines([]);
              evaluation.reset();
            }}
            onEvaluate={evaluate}
          />

          {evaluation.data && (
            <ReceiptPanel
              outcome={evaluation.data}
              evaluating={evaluation.isPending}
              onPrompt={answerPrompt}
              onReevaluate={evaluate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
