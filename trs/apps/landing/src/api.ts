const MODULE_ID = "demo-landing";

function basePath(tenantId: string | undefined): string {
  return tenantId ? `/api/tenants/${encodeURIComponent(tenantId)}` : "/api";
}

async function messageFrom(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] };

    return Array.isArray(body.message)
      ? body.message.join(", ")
      : body.message ?? response.statusText;
  } catch {
    return response.statusText || `Request failed with ${response.status}`;
  }
}

export async function fetchLanguageTags(): Promise<string[]> {
  const response = await fetch(`/api/modules/${MODULE_ID}/language-tags`);
  if (!response.ok) {
    // 404 means nothing published at all yet — en-US (fetched separately) is all there is.
    if (response.status === 404) return [];
    throw new Error(await messageFrom(response));
  }
  const body = (await response.json()) as { languageTags: string[] };

  return body.languageTags;
}

// format=icu: the compiled-string shape a consumer's i18n runtime wants (description,
// parameters and plural structure already resolved into one ICU MessageFormat string per
// key), not the raw editor shape the management app reads/writes.
export async function fetchTranslations(
  langTag: string,
  tenantId: string | undefined,
): Promise<Record<string, string>> {
  const url = `${basePath(tenantId)}/modules/${MODULE_ID}/translations/${encodeURIComponent(langTag)}?format=icu`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(await messageFrom(response));
  const body = (await response.json()) as { entries: Record<string, string> };

  return body.entries;
}
