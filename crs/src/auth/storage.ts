const CREDENTIALS_KEY = "crs_ocms_credentials";
const TOKEN_KEY = "crs_ocms_token";

export interface OcmsCredentials {
  clientId: string;
  clientSecret: string;
}

interface StoredToken {
  accessToken: string;
  expiresAt: number;
}

export function loadCredentials(): OcmsCredentials | null {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OcmsCredentials>;
    if (parsed.clientId && parsed.clientSecret) {
      return parsed as OcmsCredentials;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveCredentials(credentials: OcmsCredentials): void {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
}

export function clearCredentials(): void {
  localStorage.removeItem(CREDENTIALS_KEY);
  clearStoredToken();
}

export function loadStoredToken(): StoredToken | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredToken>;
    if (parsed.accessToken && typeof parsed.expiresAt === "number") {
      return parsed as StoredToken;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveStoredToken(accessToken: string, expiresAt: number): void {
  const entry: StoredToken = { accessToken, expiresAt };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(entry));
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
