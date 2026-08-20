import type { EntityConditionViewDto } from "../api/client";

/** One-line rendering of `condition_value` per rule type. */
export function conditionValueSummary(
  condition: EntityConditionViewDto,
): string {
  if (condition.rule === "AGE_RESTRICTION") {
    const { minimum_age: minimumAge } = condition.condition_value as {
      minimum_age?: number;
    };

    return `minimum_age: ${minimumAge ?? "—"}`;
  }

  return "license id = condition id";
}
