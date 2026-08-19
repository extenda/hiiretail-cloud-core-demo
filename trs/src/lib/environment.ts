import type { ApiEnvironment } from "../auth/token-info";

export const API_ENVIRONMENT: ApiEnvironment = __TRS_ENVIRONMENT__;

export const API_HOST =
  API_ENVIRONMENT === "staging"
    ? "translation.retailsvc.dev"
    : "translation.retailsvc.com";
