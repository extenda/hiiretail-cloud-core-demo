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

export type ReadOutcome<T> =
  | { kind: "ok"; data: T; etag: string | null }
  | { kind: "notModified" };

// `cache: "no-store"` bypasses the browser's own HTTP cache entirely — TRS's reads carry
// `Cache-Control: public, max-age=300, stale-while-revalidate=86400`, which a plain fetch()
// would happily honor even across a hard reload (a reload's cache-bypass only reliably covers
// the document and its parser-referenced resources, not fetch() calls JS makes afterwards),
// serving up to five-minute-old — or, thanks to stale-while-revalidate, even older — copy no
// matter how the page was reloaded. Sending `If-None-Match` ourselves instead means every
// startup always asks the origin directly: 304 confirms nothing changed (cheap, no body), and
// only a real change costs the full payload.
function conditionalHeaders(etag: string | null | undefined): HeadersInit | undefined {
  return etag ? { "if-none-match": etag } : undefined;
}

export async function fetchLanguageTags(
  etag?: string | null,
): Promise<ReadOutcome<string[]>> {
  const response = await fetch(`/api/modules/${MODULE_ID}/language-tags`, {
    cache: "no-store",
    headers: conditionalHeaders(etag),
  });
  if (response.status === 304) return { kind: "notModified" };
  if (!response.ok) {
    // 404 means nothing published at all yet — en-US (fetched separately) is all there is.
    if (response.status === 404) return { kind: "ok", data: [], etag: null };
    throw new Error(await messageFrom(response));
  }
  const body = (await response.json()) as { languageTags: string[] };

  return { kind: "ok", data: body.languageTags, etag: response.headers.get("etag") };
}

// format=icu: the compiled-string shape a consumer's i18n runtime wants (description,
// parameters and plural structure already resolved into one ICU MessageFormat string per
// key), not the raw editor shape the management app reads/writes.
export async function fetchTranslations(
  langTag: string,
  tenantId: string | undefined,
  etag?: string | null,
): Promise<ReadOutcome<Record<string, string>>> {
  const url = `${basePath(tenantId)}/modules/${MODULE_ID}/translations/${encodeURIComponent(langTag)}?format=icu`;
  const response = await fetch(url, {
    cache: "no-store",
    headers: conditionalHeaders(etag),
  });
  if (response.status === 304) return { kind: "notModified" };
  if (!response.ok) throw new Error(await messageFrom(response));
  const body = (await response.json()) as { entries: Record<string, string> };

  return { kind: "ok", data: body.entries, etag: response.headers.get("etag") };
}
