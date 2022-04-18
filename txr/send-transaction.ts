import { deflate } from "https://deno.land/x/denoflate@1.2.1/mod.ts";
import { publishTransaction } from "./api.ts";

import { TESTRUNNER_TENANT_ID, TOKEN } from "./constants.ts";

const DEFAULT_HEADERS = {
  "transaction-timestamp": "2022-08-09T00:00:00.000Z",
  "country-code": "US",
  "content-type": "application/zip",
  "correlation-id": crypto.randomUUID(),
  "tenant-id": TESTRUNNER_TENANT_ID,
  "Authorization": `Bearer ${TOKEN}`,
};

const exampleTransaction = await Deno.readTextFile("transaction.xml");

export async function sendTransaction(
  { businessUnitId, transactionId, previousTransactionId }: {
    businessUnitId: string;
    transactionId: string;
    previousTransactionId: string;
  },
) {
  const transaction = exampleTransaction
    .replace("[[[BUSINESS_UNIT_ID]]]", businessUnitId)
    .replace("[[[TRANSACTION_ID]]]", transactionId);
  const data = deflate(new TextEncoder().encode(transaction), 1);

  await publishTransaction(data, {
    ...DEFAULT_HEADERS,
    "business-unit-id": businessUnitId,
    "transaction-id": transactionId,
    "previous-transaction-id": previousTransactionId,
  });

  console.log("Transaction sent");
}
