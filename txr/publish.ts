import { publishTransaction } from "./api.ts";

import { TESTRUNNER_TENANT_ID } from "./constants.ts";
import { zip } from "./utils.ts";

const exampleTransaction = await Deno.readTextFile("transaction.xml");

while (true) {
  const businessUnitId = prompt("business-unit-id:")!;
  const previousTransactionId = prompt("previous-transaction-id:")!;
  const transactionId = prompt("transaction-id:")!;

  const transaction = exampleTransaction
    .replace("[[[BUSINESS_UNIT_ID]]]", businessUnitId)
    .replace("[[[TRANSACTION_ID]]]", transactionId);
  const data = zip(new TextEncoder().encode(transaction))!;

  await publishTransaction(data, {
    "transaction-timestamp": "2022-08-09T00:00:00.000Z",
    "country-code": "US",
    "content-type": "application/zip",
    "correlation-id": crypto.randomUUID(),
    "tenant-id": TESTRUNNER_TENANT_ID,
    "business-unit-id": businessUnitId,
    "transaction-id": transactionId,
    "previous-transaction-id": previousTransactionId,
  });

  console.log("Transaction sent");
}
