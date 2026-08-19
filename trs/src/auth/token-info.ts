export type TokenKind = "user" | "client" | "unknown";

export type ApiEnvironment = "staging" | "prod";

export interface TokenInfo {
  kind: TokenKind;
  environment?: ApiEnvironment;
  tenantId?: string;
  subject?: string;
  email?: string;
  expiresAt?: number;
}

export type Inspection =
  | { ok: true; info: TokenInfo }
  | { ok: false; reason: string };

const TENANT_CLAIM = "https://extendaretail.com/tenant";

// A signed-in person and a machine client are issued by different hosts, and each host has one
// issuer per environment. Nothing here is verified — the API does that; this is for the operator
// staring at a 403, wondering which token they pasted.
const USER_TOKEN_HOST = "securetoken.google.com";
const CLIENT_TOKEN_HOST = "auth.retailsvc";

interface Claims {
  iss?: string;
  sub?: string;
  exp?: number;
  email?: string;
  tid?: string;
  [claim: string]: unknown;
}

function kindOf(issuer: string): TokenKind {
  if (issuer.includes(USER_TOKEN_HOST)) return "user";
  if (issuer.includes(CLIENT_TOKEN_HOST)) return "client";

  return "unknown";
}

function environmentOf(issuer: string): ApiEnvironment | undefined {
  if (kindOf(issuer) === "unknown") return undefined;

  return /staging|\.dev/.test(issuer) ? "staging" : "prod";
}

export function normalizeToken(raw: string): string {
  return raw.trim().replace(/^Bearer\s+/i, "").replace(/\s+/g, "");
}

function decodeSegment(segment: string): unknown {
  return JSON.parse(
    atob(segment.replace(/-/g, "+").replace(/_/g, "/")),
  ) as unknown;
}

export function inspectToken(raw: string): Inspection {
  const parts = normalizeToken(raw).split(".");
  if (parts.length !== 3) {
    return { ok: false, reason: "Not a JWT — expected three dot-separated parts." };
  }

  let claims: Claims;
  try {
    claims = decodeSegment(parts[1]) as Claims;
  } catch {
    return { ok: false, reason: "The payload is not base64url-encoded JSON." };
  }

  const issuer = claims.iss ?? "";

  return {
    ok: true,
    info: {
      kind: kindOf(issuer),
      environment: environmentOf(issuer),
      tenantId: (claims[TENANT_CLAIM] as string | undefined) ?? claims.tid,
      subject: claims.sub,
      email: claims.email,
      expiresAt: typeof claims.exp === "number" ? claims.exp * 1000 : undefined,
    },
  };
}

export function isExpired({ expiresAt }: TokenInfo, now = Date.now()): boolean {
  return expiresAt !== undefined && expiresAt <= now;
}

export function expiryLabel({ expiresAt }: TokenInfo, now = Date.now()): string {
  if (expiresAt === undefined) return "no exp claim";
  const minutes = Math.round((expiresAt - now) / 60_000);

  return minutes <= 0 ? "expired" : `expires in ${minutes} min`;
}
