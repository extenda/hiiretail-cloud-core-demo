import type { LanguageTagsDto, ResolvedTranslationFileDto } from "./client";

// Hand-written rather than using the generated SDK: reads are anonymous, and the
// demo needs the 304 revalidation path plus the raw ETag / Last-Modified headers,
// which the SDK collapses into an error result.

export interface ReadHeaders {
  etag: string | null;
  lastModified: string | null;
  cacheControl: string | null;
}

export interface Snapshot<T> extends ReadHeaders {
  status: number;
  body: T;
}

export type ReadOutcome<T> =
  | { kind: "ok"; snapshot: Snapshot<T> }
  | { kind: "notModified"; status: 304 }
  | { kind: "error"; status: number; message: string };

export interface Revalidators {
  ifNoneMatch?: string | null;
  ifModifiedSince?: string | null;
}

export interface ReadScope {
  moduleId: string;
  langTag: string;
  tenantId?: string;
}

export type TranslationsOutcome = ReadOutcome<ResolvedTranslationFileDto>;
export type LanguageTagsOutcome = ReadOutcome<LanguageTagsDto>;

const segment = encodeURIComponent;

function translationsPath({ moduleId, langTag, tenantId }: ReadScope): string {
  const scope = tenantId ? `/api/tenants/${segment(tenantId)}` : "/api";

  return `${scope}/modules/${segment(moduleId)}/translations/${segment(langTag)}`;
}

function headersFrom(response: Response): ReadHeaders {
  return {
    etag: response.headers.get("etag"),
    lastModified: response.headers.get("last-modified"),
    cacheControl: response.headers.get("cache-control"),
  };
}

async function messageFrom(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message.join(", ");
    if (body.message) return body.message;
  } catch {
    /* non-JSON body */
  }

  return response.statusText || `Request failed with ${response.status}`;
}

function revalidationHeaders({
  ifNoneMatch,
  ifModifiedSince,
}: Revalidators): Headers {
  const headers = new Headers({ Accept: "application/json" });
  if (ifNoneMatch) {
    headers.set("if-none-match", ifNoneMatch);
  } else if (ifModifiedSince) {
    headers.set("if-modified-since", ifModifiedSince);
  }

  return headers;
}

async function read<T>(
  path: string,
  revalidators: Revalidators,
): Promise<ReadOutcome<T>> {
  const response = await fetch(path, {
    headers: revalidationHeaders(revalidators),
  });

  if (response.status === 304) {
    return { kind: "notModified", status: 304 };
  }

  if (!response.ok) {
    return {
      kind: "error",
      status: response.status,
      message: await messageFrom(response),
    };
  }

  return {
    kind: "ok",
    snapshot: {
      status: response.status,
      body: (await response.json()) as T,
      ...headersFrom(response),
    },
  };
}

export function fetchTranslations(
  scope: ReadScope,
  revalidators: Revalidators = {},
): Promise<TranslationsOutcome> {
  return read(translationsPath(scope), revalidators);
}

export function fetchLanguageTags(
  moduleId: string,
  revalidators: Revalidators = {},
): Promise<LanguageTagsOutcome> {
  return read(
    `/api/modules/${segment(moduleId)}/language-tags`,
    revalidators,
  );
}
