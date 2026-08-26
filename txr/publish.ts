import { publishTransaction } from "./api.ts";

import { TENANT_ID } from "./constants.ts";
import { zip } from "./utils.ts";

const exampleTransaction = await Deno.readTextFile("transaction.xml");

// const businessUnitId = prompt("business-unit-id:")!;
const previousTransactionId = prompt("previous-transaction-id:")!;
const transactionId = prompt("transaction-id:")!;

const businessUnitId = "001";
const transactionDate = new Date().toISOString();

const transaction = exampleTransaction
  .replaceAll("[[[TRANSACTION_DATE]]]", transactionDate)
  .replaceAll("[[[BUSINESS_UNIT_ID]]]", businessUnitId)
  .replaceAll("[[[TRANSACTION_ID]]]", transactionId);
const data = zip(new TextEncoder().encode(transaction))!;

await publishTransaction(data, {
  "transaction-timestamp": transactionDate,
  "country-code": "PT",
  "content-type": "application/zip",
  "correlation-id": crypto.randomUUID(),
  "tenant-id": TENANT_ID,
  "business-unit-id": businessUnitId,
  "transaction-id": transactionId,
  "previous-transaction-id": previousTransactionId,
});

console.log("Transaction sent");
