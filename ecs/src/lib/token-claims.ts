import { loadStoredToken } from "../auth/storage";

const TENANT_CLAIM = "https://extendaretail.com/tenant";

/**
 * The tenant is never a parameter in this API — every read, write and decision
 * is scoped to the tenant claim on the token. The demo shows it so the audience
 * can see which catalog they are looking at. Nothing here is verified; the API
 * does that.
 */
export function currentTenantId(): string | null {
  const stored = loadStoredToken();
  if (!stored) return null;

  const payload = stored.accessToken.split(".")[1];
  if (!payload) return null;

  try {
    const claims = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as Record<string, unknown>;

    const tenant = claims[TENANT_CLAIM] ?? claims.tid;

    return typeof tenant === "string" ? tenant : null;
  } catch {
    return null;
  }
}
