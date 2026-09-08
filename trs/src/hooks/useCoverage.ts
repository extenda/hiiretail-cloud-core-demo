import { useQuery } from "@tanstack/react-query";
import {
  fetchLanguageTagCoverage,
  fetchModuleCoverage,
  type CoverageError,
} from "../api/coverage";

export function useModuleCoverage(moduleId: string, token: string | undefined) {
  return useQuery<Awaited<ReturnType<typeof fetchModuleCoverage>>, CoverageError>({
    queryKey: ["coverage", moduleId],
    enabled: moduleId !== "" && token !== undefined,
    retry: false,
    queryFn: () => fetchModuleCoverage(moduleId, token!),
  });
}

export function useLanguageTagCoverage(
  moduleId: string,
  langTag: string | null,
  token: string | undefined,
) {
  return useQuery<Awaited<ReturnType<typeof fetchLanguageTagCoverage>>, CoverageError>({
    queryKey: ["coverage-keys", moduleId, langTag],
    enabled: moduleId !== "" && langTag !== null && token !== undefined,
    retry: false,
    queryFn: () => fetchLanguageTagCoverage(moduleId, langTag!, token!),
  });
}
