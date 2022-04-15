import { deflate } from "https://deno.land/x/denoflate@1.2.1/mod.ts";

const TESTRUNNER_TENANT_ID = "CIR7nQwtS0rA6t0S6ejd";
const token = await Deno.readTextFile("token.jwt").then((str) => str.trim());
const payload = deflate(await Deno.readFile("transaction.xml"), 1);
const headers = {
  "previous-transaction-id": "demo3",
  "transaction-id": "demo4",
  "business-unit-id": "demo",
  "transaction-timestamp": "2022-08-09T00:00:00.000Z",
  "country-code": "US",
  "content-type": "application/zip",
  "correlation-id": crypto.randomUUID(),
  "tenant-id": TESTRUNNER_TENANT_ID,
  "Authorization": `Bearer ${token}`,
};

await publishTransaction(payload, headers);

async function publishTransaction(
  payload: Uint8Array,
  headers: Record<string, string>,
) {
  const res = await fetch(
    "https://txr-input.retailsvc.dev/api/v1/transactions",
    {
      method: "POST",
      headers: headers,
      body: payload,
    },
  );

  if (res.status !== 202) {
    throw new Error(`Publishing failed with code: ${res.status}`);
  }
}
