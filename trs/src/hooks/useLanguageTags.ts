import { useQuery } from "@tanstack/react-query";
import type { LanguageTagsDto } from "../api/client";
import { fetchLanguageTags, type Snapshot } from "../api/read";
import { ReadError, unwrap } from "./read-outcome";

export function useLanguageTags(moduleId: string) {
  return useQuery<Snapshot<LanguageTagsDto>, ReadError>({
    queryKey: ["language-tags", moduleId],
    enabled: moduleId !== "",
    retry: false,
    queryFn: async () => unwrap(await fetchLanguageTags(moduleId)),
  });
}
