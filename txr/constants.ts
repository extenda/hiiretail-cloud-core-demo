export const TESTRUNNER_TENANT_ID = "CIR7nQwtS0rA6t0S6ejd";
export const TOKEN = await Deno.readTextFile(
  import.meta.resolve("./token.jwt"),
).then((str) => str.trim());
