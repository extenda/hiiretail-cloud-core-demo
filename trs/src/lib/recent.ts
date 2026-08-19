const RECENT_KEY = "trs_recent_lookups";
const MAX_RECENT = 6;

export interface Lookup {
  moduleId: string;
  langTag: string;
  tenantId?: string;
}

function isLookup(value: unknown): value is Lookup {
  const candidate = value as Partial<Lookup>;

  return (
    typeof candidate?.moduleId === "string" &&
    typeof candidate?.langTag === "string" &&
    (candidate.tenantId === undefined || typeof candidate.tenantId === "string")
  );
}

export function lookupLabel({ moduleId, langTag, tenantId }: Lookup): string {
  return tenantId
    ? `${tenantId}/${moduleId}/${langTag}`
    : `${moduleId}/${langTag}`;
}

export function loadRecent(): Lookup[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];

    return (JSON.parse(raw) as unknown[]).filter(isLookup).slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function rememberLookup(lookup: Lookup): Lookup[] {
  const label = lookupLabel(lookup);
  const others = loadRecent().filter((item) => lookupLabel(item) !== label);
  const next = [lookup, ...others].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));

  return next;
}
