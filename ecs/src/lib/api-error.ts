import type { CheckFailure } from "./checkout";

/**
 * The generated SDK hands back `{ data, error, response }`; `error` is whatever
 * the service put in the body, which is a NestJS error DTO for 4xx and nothing
 * at all for a 403 from the gateway.
 */
export function errorMessage(error: unknown, response?: Response): string {
  if (error && typeof error === "object") {
    const { message } = error as { message?: unknown };
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
  }
  if (typeof error === "string" && error.length > 0) return error;
  if (response) {
    return response.status === 403
      ? "Forbidden — the OCMS client is missing the permission for this call."
      : `${response.status} ${response.statusText}`;
  }

  return "Request failed";
}

export function toFailure(error: unknown, response?: Response): CheckFailure {
  return {
    status: response?.status ?? null,
    message: errorMessage(error, response),
  };
}
