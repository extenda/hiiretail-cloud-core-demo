import { publishTransaction } from "./api.ts";

import { TENANT_ID } from "./constants.ts";
import { zip } from "./utils.ts";

const BATCH_SIZE = 100;
const EXAMPLE_TRANSACTION = await Deno.readTextFile("transaction.xml");

console.time("perf-test");
Deno.addSignalListener("SIGINT", () => {
  console.timeEnd("perf-test");
  Deno.exit();
});

console.log("starting performance test", new Date());

for (let i = 1;; i++) {
  await Promise.all(
    Array
      .from({ length: BATCH_SIZE }, makeTransaction)
      .map(sendTransaction),
  );
  console.log(`batch #${i} sent`);
}

// @ts-ignore: too lazy to type
function sendTransaction({ data, attributes }) {
  return publishTransaction(data, attributes);
}

function makeTransaction() {
  const businessUnitId = crypto.randomUUID();
  const previousTransactionId = crypto.randomUUID();
  const transactionId = crypto.randomUUID();

  const transaction = EXAMPLE_TRANSACTION
    .replace("[[[BUSINESS_UNIT_ID]]]", businessUnitId)
    .replace("[[[TRANSACTION_ID]]]", transactionId);

  const data = zip(new TextEncoder().encode(transaction))!;
  const attributes = {
    "transaction-timestamp": new Date().toISOString(),
    "country-code": "NO",
    "content-type": "application/zip",
    "correlation-id": crypto.randomUUID(),
    "tenant-id": TENANT_ID,
    "business-unit-id": businessUnitId,
    "transaction-id": transactionId,
    "previous-transaction-id": previousTransactionId,
  };

  return { data, attributes };
}
