export const INPUT_API_URL = "https://txr-input.retailsvc.com/api/v1";
export const SEARCH_API_URL = "https://txr-search.retailsvc.com/api/v1";
export const TENANT_ID = "CIR7nQwtS0rA6t0S6ejd";
export const TOKEN = await Deno.readTextFile("token.jwt").then((str) =>
  str.trim()
);
