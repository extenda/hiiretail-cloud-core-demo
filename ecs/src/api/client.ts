import { client } from "./generated/client.gen";
import { getValidAccessToken } from "../auth/token";
import type { EvaluateData, Evaluate2Data } from "./generated";

client.setConfig({
  baseUrl: "/api",
  auth: () => getValidAccessToken(),
});

/*
 * Both evaluate endpoints carry `operationId: evaluate` in the spec, so the
 * generator disambiguates them by document order (`evaluate`, `evaluate2`).
 * These two checks fail the build if a regeneration ever swaps them, instead of
 * silently sending carts to the project-restriction endpoint.
 */
export type AssertConditionUrl = EvaluateData["url"] extends
  "/conditions/{conditionId}/evaluate" ? true : never;
export type AssertProjectRestrictionUrl = Evaluate2Data["url"] extends
  "/project-restrictions/evaluate" ? true : never;

export { client };

export {
  evaluate as evaluateCondition,
  evaluate2 as evaluateProjectRestrictions,
  listEntityConditions,
  getEntityCondition,
  upsertEntityCondition,
  deleteEntityCondition,
} from "./generated";

export type {
  ConditionScope,
  CustomerContextDto,
  Decision,
  EntityConditionRule,
  EntityConditionViewDto,
  EvaluateConditionRequestDto,
  EvaluateProjectRestrictionsRequestDto,
  EvaluationContextDto,
  EvaluationResultDto,
  ItemDecisionDto,
  ProjectRestrictionItemDto,
  RuleType,
  UpsertEntityConditionRequestDto,
} from "./generated";
