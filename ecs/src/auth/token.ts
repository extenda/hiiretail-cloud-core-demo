import {
  loadCredentials,
  loadStoredToken,
  saveStoredToken,
  clearStoredToken,
  type OcmsCredentials,
} from "./storage";

const OAUTH_TOKEN_URL = "/oauth2/token";
const OAUTH_AUDIENCE = "https://hiiretail.com";
const TOKEN_EXPIRY_BUFFER_MS = 30_000;

let pendingTokenRequest: Promise<string> | null = null;

function isTokenValid(expiresAt: number): boolean {
  return Date.now() < expiresAt - TOKEN_EXPIRY_BUFFER_MS;
}

async function fetchAccessToken(
  credentials: OcmsCredentials,
): Promise<string> {
  const response = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${credentials.clientId}:${credentials.clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      audience: OAUTH_AUDIENCE,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Token request failed: ${response.status} ${response.statusText}${text ? ` - ${text}` : ""}`,
    );
  }

  const data = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (
    !data.access_token ||
    typeof data.expires_in !== "number" ||
    !Number.isFinite(data.expires_in) ||
    data.expires_in <= 0
  ) {
    throw new Error(
      "OAuth response missing access_token or a positive expires_in.",
    );
  }

  const expiresAt = Date.now() + data.expires_in * 1000;
  saveStoredToken(data.access_token, expiresAt);

  return data.access_token;
}

export async function getValidAccessToken(): Promise<string> {
  const stored = loadStoredToken();
  if (stored && isTokenValid(stored.expiresAt)) {
    return stored.accessToken;
  }

  clearStoredToken();

  const credentials = loadCredentials();
  if (!credentials) {
    throw new Error("No OCMS credentials configured.");
  }

  if (pendingTokenRequest) {
    return pendingTokenRequest;
  }

  pendingTokenRequest = fetchAccessToken(credentials);
  try {
    return await pendingTokenRequest;
  } finally {
    pendingTokenRequest = null;
  }
}
