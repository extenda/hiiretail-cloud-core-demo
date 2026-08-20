import { useQuery } from "@tanstack/react-query";
import { listEntityConditions, type EntityConditionViewDto } from "../api/client";
import { errorMessage } from "../lib/api-error";

export const CONDITIONS_QUERY_KEY = ["entity-conditions"];

/** Global conditions plus the signed-in tenant's own, as the API merges them. */
export function useConditions() {
  return useQuery<EntityConditionViewDto[]>({
    queryKey: CONDITIONS_QUERY_KEY,
    queryFn: async () => {
      const res = await listEntityConditions();
      if (res.error || !res.data) {
        throw new Error(errorMessage(res.error, res.response));
      }

      return res.data;
    },
  });
}

export function licenseConditionIds(
  conditions: EntityConditionViewDto[] | undefined,
): string[] {
  return (conditions ?? [])
    .filter((condition) => condition.rule === "LICENSE_REQUIREMENT")
    .map((condition) => condition.id);
}
