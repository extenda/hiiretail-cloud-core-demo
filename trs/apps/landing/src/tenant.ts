// The tenant id is an identifier, not a secret (FR-7) — this app is public and reads the same
// anonymous endpoints with or without one. Carrying it as a query param is enough to demo the
// tenant-scoped read, and it is what gets forwarded across the landing -> service link.
export function tenantFromUrl(): string | undefined {
  return new URLSearchParams(window.location.search).get("tenant") ?? undefined;
}

export function withTenant(url: string, tenantId: string | undefined): string {
  if (!tenantId) return url;
  const next = new URL(url);
  next.searchParams.set("tenant", tenantId);

  return next.toString();
}
