import { useMutation } from "@tanstack/react-query";
import { evaluateCondition, evaluateProjectRestrictions } from "../api/client";
import type { EvaluationContextDto } from "../api/client";
import { toFailure } from "../lib/api-error";
import {
  toEvaluationContext,
  type CartLine,
  type CheckoutOutcome,
  type CustomerState,
  type LineCheck,
  type LineOutcome,
} from "../lib/checkout";

export interface CheckoutEvaluationInput {
  lines: CartLine[];
  customer: CustomerState;
  /** Empty string means the checkout is not in a B2B project context. */
  projectId: string;
}

async function checkCondition(
  line: CartLine,
  conditionId: string,
  context: EvaluationContextDto,
): Promise<LineCheck> {
  const body = { item: { id: line.sku }, context };
  const res = await evaluateCondition({ path: { conditionId }, body });

  return {
    kind: "CONDITION",
    conditionId,
    request: { url: `POST /conditions/${conditionId}/evaluate`, body },
    decision: res.data ?? null,
    failure: res.data ? null : toFailure(res.error, res.response),
  };
}

async function checkProjectRestrictions(
  line: CartLine,
  projectId: string,
): Promise<LineCheck> {
  const body = {
    projectId,
    item: { id: line.sku, additionalProperties: line.attributes },
  };
  const res = await evaluateProjectRestrictions({ body });

  return {
    kind: "PROJECT_RESTRICTION",
    conditionId: null,
    request: { url: "POST /project-restrictions/evaluate", body },
    decision: res.data ?? null,
    failure: res.data ? null : toFailure(res.error, res.response),
  };
}

/**
 * One call per line per condition, plus one project-restriction call per line —
 * the API decides a single item against a single condition, so the fan-out is
 * the checkout's job. Small carts, so all of it goes out at once.
 */
export function useCheckoutEvaluation() {
  return useMutation<CheckoutOutcome, Error, CheckoutEvaluationInput>({
    mutationFn: async ({ lines, customer, projectId }) => {
      const context = toEvaluationContext(customer);

      const outcomes = await Promise.all(
        lines.map(async (line): Promise<LineOutcome> => {
          const checks = await Promise.all([
            ...line.conditionIds.map((conditionId) =>
              checkCondition(line, conditionId, context),
            ),
            ...(projectId
              ? [checkProjectRestrictions(line, projectId)]
              : []),
          ]);

          return { sku: line.sku, name: line.name, checks };
        }),
      );

      return { lines: outcomes, context, projectId: projectId || null };
    },
  });
}
