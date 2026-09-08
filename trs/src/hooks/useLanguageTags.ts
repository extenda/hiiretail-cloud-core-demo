import { useQuery } from "@tanstack/react-query";
import type { LanguageTagsDto } from "../api/client";
import { fetchLanguageTags, type Snapshot } from "../api/read";
import { ReadError, readOrKeep } from "./read-outcome";

export function useLanguageTags(moduleId: string) {
  return useQuery<Snapshot<LanguageTagsDto>, ReadError>({
    queryKey: ["language-tags", moduleId],
    enabled: moduleId !== "",
    retry: false,
    queryFn: async ({ client, queryKey }) =>
      readOrKeep(
        client.getQueryData<Snapshot<LanguageTagsDto>>(queryKey),
        (revalidators) => fetchLanguageTags(moduleId, revalidators),
      ),
  });
}
