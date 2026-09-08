import {
  getLanguageTagCoverage,
  getModuleCoverage,
  type LanguageTagKeyCoverageDto,
  type ModuleCoverageDto,
} from "./client";

// Coverage carries the same Extenda guard as the managed publish (trs.stats.read +
// check_tenant_extenda), so both calls always need the Extenda-slot token — never the
// tenant slot, however many permissions that token holds.

export interface CoverageError {
  status: number;
  message: string;
}

function messageFrom(error: unknown): string {
  const message = (error as { message?: unknown } | null)?.message;
  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string") return message;

  return "Request failed.";
}

export async function fetchModuleCoverage(
  moduleId: string,
  token: string,
): Promise<ModuleCoverageDto> {
  const result = await getModuleCoverage({
    path: { moduleId },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (result.error) {
    throw { status: result.response.status, message: messageFrom(result.error) } satisfies CoverageError;
  }

  return result.data!;
}

export async function fetchLanguageTagCoverage(
  moduleId: string,
  langTag: string,
  token: string,
): Promise<LanguageTagKeyCoverageDto> {
  const result = await getLanguageTagCoverage({
    path: { moduleId, langTag },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (result.error) {
    throw { status: result.response.status, message: messageFrom(result.error) } satisfies CoverageError;
  }

  return result.data!;
}
