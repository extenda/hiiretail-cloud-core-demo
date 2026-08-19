import { useQuery } from "@tanstack/react-query";
import type { ResolvedTranslationFileDto } from "../api/client";
import { fetchTranslations, type ReadScope, type Snapshot } from "../api/read";
import { ReadError, unwrap } from "./read-outcome";

export function useTranslations(scope: ReadScope) {
  const { moduleId, langTag, tenantId } = scope;

  return useQuery<Snapshot<ResolvedTranslationFileDto>, ReadError>({
    queryKey: ["translations", tenantId ?? null, moduleId, langTag],
    enabled: moduleId !== "" && langTag !== "",
    retry: false,
    queryFn: async () => unwrap(await fetchTranslations(scope)),
  });
}
