import { useMutation } from "@tanstack/react-query";
import { evaluateProjectRestrictions } from "../api/client";
import type { ItemDecisionDto } from "../api/client";
import { errorMessage } from "../lib/api-error";

export interface ProjectRestrictionInput {
  projectId: string;
  itemId: string;
  attributes: Record<string, unknown>;
}

export interface ProjectRestrictionOutcome {
  request: unknown;
  decision: ItemDecisionDto;
}

/** The playground call: one item, one project, restrictions fetched live from CRS. */
export function useProjectRestrictionEvaluation() {
  return useMutation<ProjectRestrictionOutcome, Error, ProjectRestrictionInput>({
    mutationFn: async ({ projectId, itemId, attributes }) => {
      const body = {
        projectId,
        item: { id: itemId, additionalProperties: attributes },
      };
      const res = await evaluateProjectRestrictions({ body });

      if (res.error || !res.data) {
        throw new Error(errorMessage(res.error, res.response));
      }

      return {
        request: { url: "POST /project-restrictions/evaluate", body },
        decision: res.data,
      };
    },
  });
}
