import type {
  CustomerContextDto,
  Decision,
  EvaluationContextDto,
  EvaluationResultDto,
  ItemDecisionDto,
} from "../api/client";
import type { CatalogProduct } from "./catalog";
import { decisionOf, isUnchecked, worstDecision } from "./decisions";

export interface CartLine {
  sku: string;
  name: string;
  price: number;
  glyph: string;
  quantity: number;
  /** Editable per line — this is what the checkout claims about the item. */
  conditionIds: string[];
  attributes: Record<string, unknown>;
}

export function toCartLine(product: CatalogProduct): CartLine {
  return {
    sku: product.sku,
    name: product.name,
    price: product.price,
    glyph: product.glyph,
    quantity: 1,
    conditionIds: [...product.conditionIds],
    attributes: { ...product.attributes },
  };
}

/**
 * What the checkout knows about the customer. Both fields are three-state on
 * purpose: not asked yet (omitted from the request, which the rules answer with
 * SOFT_DENY), asked and known, or asked and empty.
 */
export interface CustomerState {
  ageAsked: boolean;
  age: number | null;
  licensesResolved: boolean;
  licenses: string[];
}

export const EMPTY_CUSTOMER: CustomerState = {
  ageAsked: false,
  age: null,
  licensesResolved: false,
  licenses: [],
};

export function toEvaluationContext(
  customer: CustomerState,
): EvaluationContextDto {
  const context: CustomerContextDto = {};

  if (customer.ageAsked) {
    context.customer_age = customer.age;
  }
  if (customer.licensesResolved) {
    context.licenses = customer.licenses;
  }

  return Object.keys(context).length > 0 ? { customer: context } : {};
}

export interface CheckFailure {
  status: number | null;
  message: string;
}

export type CheckKind = "CONDITION" | "PROJECT_RESTRICTION";

export interface LineCheck {
  kind: CheckKind;
  /** The condition id asked about; null for the project-restriction call. */
  conditionId: string | null;
  request: unknown;
  decision: ItemDecisionDto | null;
  failure: CheckFailure | null;
}

export interface LineOutcome {
  sku: string;
  name: string;
  checks: LineCheck[];
}

export interface CheckoutOutcome {
  lines: LineOutcome[];
  context: EvaluationContextDto;
  projectId: string | null;
}

export type LineState = "NO_CONDITIONS" | "ERROR" | "UNCHECKED" | "DECIDED";

export interface LineSummary {
  state: LineState;
  decision: Decision;
  results: EvaluationResultDto[];
  failures: { conditionId: string | null; failure: CheckFailure }[];
}

export function summarizeLine(line: LineOutcome): LineSummary {
  const failures = line.checks
    .filter((check) => check.failure !== null)
    .map((check) => ({
      conditionId: check.conditionId,
      failure: check.failure!,
    }));

  const decisions = line.checks
    .map((check) => check.decision)
    .filter((decision): decision is ItemDecisionDto => decision !== null);

  const results = decisions.flatMap((decision) => decision.results);

  if (failures.length > 0) {
    return { state: "ERROR", decision: "HARD_DENY", results, failures };
  }
  if (line.checks.length === 0) {
    return { state: "NO_CONDITIONS", decision: "ALLOW", results, failures };
  }
  if (decisions.every(isUnchecked)) {
    return { state: "UNCHECKED", decision: "ALLOW", results, failures };
  }

  return { state: "DECIDED", decision: decisionOf(results), results, failures };
}

export type Prompt = "AGE" | "LICENSES";

export interface CheckoutSummary {
  decision: Decision;
  blocked: boolean;
  errorCount: number;
  uncheckedCount: number;
  prompts: Prompt[];
}

export function summarizeCheckout(outcome: CheckoutOutcome): CheckoutSummary {
  const summaries = outcome.lines.map(summarizeLine);
  const results = summaries.flatMap((summary) => summary.results);
  const reasons = new Set(
    results.map((result) => result.reason).filter((reason) => reason !== null),
  );

  const prompts: Prompt[] = [];
  if (reasons.has("age_restriction.missing_context")) prompts.push("AGE");
  if (reasons.has("license_requirement.missing_context")) {
    prompts.push("LICENSES");
  }

  const errorCount = summaries.filter(
    (summary) => summary.state === "ERROR",
  ).length;

  const decision = worstDecision(
    summaries
      .filter((summary) => summary.state === "DECIDED")
      .map((summary) => summary.decision),
  );

  return {
    decision,
    blocked: decision !== "ALLOW" || errorCount > 0,
    errorCount,
    uncheckedCount: summaries.filter(
      (summary) => summary.state === "UNCHECKED",
    ).length,
    prompts,
  };
}

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.price * line.quantity, 0);
}
