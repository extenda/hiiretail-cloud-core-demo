import { useQuery } from "@tanstack/react-query";
import type { RawTranslationFileDto } from "../api/client";
import { fetchTranslations, type ReadScope, type Snapshot } from "../api/read";
import { ReadError, readOrKeep } from "./read-outcome";

export function useTranslations(scope: ReadScope) {
  const { moduleId, langTag, tenantId } = scope;

  return useQuery<Snapshot<RawTranslationFileDto>, ReadError>({
    queryKey: ["translations", tenantId ?? null, moduleId, langTag],
    enabled: moduleId !== "" && langTag !== "",
    retry: false,
    queryFn: async ({ client, queryKey }) =>
      readOrKeep(
        client.getQueryData<Snapshot<RawTranslationFileDto>>(queryKey),
        (revalidators) => fetchTranslations(scope, revalidators),
      ),
  });
}
