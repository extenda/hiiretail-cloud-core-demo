import type { Decision, EvaluationResultDto, ItemDecisionDto } from "../api/client";

/** SOFT_DENY is "ask the operator something"; HARD_DENY ends the sale. */
const SEVERITY: Record<Decision, number> = {
  ALLOW: 0,
  SOFT_DENY: 1,
  HARD_DENY: 2,
};

export const DECISION_TONE: Record<Decision, string> = {
  ALLOW: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  SOFT_DENY: "bg-amber-50 text-amber-700 ring-amber-600/20",
  HARD_DENY: "bg-red-50 text-red-700 ring-red-600/20",
};

export const DECISION_LABEL: Record<Decision, string> = {
  ALLOW: "Allowed",
  SOFT_DENY: "Needs input",
  HARD_DENY: "Blocked",
};

/** Every reason code the Rego rules can emit, in operator language. */
const REASON_TEXT: Record<string, string> = {
  "age_restriction.missing_context":
    "Customer age has not been asked — prompt the operator for it.",
  "age_restriction.underage":
    "Customer is younger than the minimum age on this condition.",
  "license_requirement.missing_context":
    "The customer's licenses have not been resolved — look them up before selling.",
  "license_requirement.license_missing":
    "Customer does not hold the license this item requires.",
  "project_restriction.project_unreachable":
    "The project's restrictions could not be fetched from CRS.",
  "project_restriction.boolean_not_met":
    "Item attribute does not match the value the project requires.",
  "project_restriction.whitelist_not_met":
    "Item attribute is not one of the values the project allows.",
  "project_restriction.blacklisted_item":
    "The project blacklists this item id.",
};

export function reasonText(reason: string | null): string | null {
  if (!reason) return null;

  return REASON_TEXT[reason] ?? reason;
}

export function worstDecision(decisions: Decision[]): Decision {
  return decisions.reduce<Decision>(
    (worst, decision) =>
      SEVERITY[decision] > SEVERITY[worst] ? decision : worst,
    "ALLOW",
  );
}

export function decisionOf(results: EvaluationResultDto[]): Decision {
  return worstDecision(results.map((result) => result.decision));
}

/**
 * A decision with an empty `results` array means no rule ran: the condition
 * exists in Spanner but the evaluation bundle has not picked it up yet. The API
 * reports that as allowed, which is true but not the same as "checked".
 */
export function isUnchecked(decision: ItemDecisionDto): boolean {
  return decision.results.length === 0;
}
