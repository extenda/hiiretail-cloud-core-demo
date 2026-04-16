import { useQuery } from "@tanstack/react-query";
import { fetchGroups } from "../api/businessUnit";

export function useBusinessUnitGroups(enabled = true) {
  return useQuery({
    queryKey: ["bum", "groups"],
    queryFn: () => fetchGroups(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
