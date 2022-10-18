import { sleep } from "https://deno.land/x/sleep@v1.2.1/sleep.ts";

import { publishTransaction } from "../api.ts";
import { prepareTransaction } from "../ingest-many/prepare-transaction.ts";
import { config } from "../ingest-many/config.ts";
import {
  BATCHES_PER_S,
  indexToTxId,
  N_TRANSACTIONS_TO_SEND,
  TXS_PER_BATCH,
} from "./config.mjs";

export const generateTxId = () => indexToTxId(stats.transactionsSent);

const transactionDir = import.meta.resolve("./ingest-many/transactions");
const transactions = await Promise.all(
  Array.from(Deno.readDirSync(transactionDir)).map((v) =>
    Deno.readTextFile(`${transactionDir}/${v.name}`)
  ),
);

const stats = {
  transactionsSent: 0,
  startTime: new Date(),
  endTime: new Date(),
};

const rpsInterval = displayUpdatingRPS();

await loadTest(N_TRANSACTIONS_TO_SEND);

clearInterval(rpsInterval);

console.log(
  `Average throughput: ${
    stats.transactionsSent /
    (stats.endTime.getTime() - stats.startTime.getTime()) * 1000
  }\n`,
  `Total sent: ${stats.transactionsSent}\n`,
);

let previousTransactionId = generateTxId();
async function publish(
  { data, now, businessUnit, transactionId }: ReturnType<
    typeof prepareTransaction
  >,
) {
  await publishTransaction(data, {
    "transaction-timestamp": now.toISOString(),
    "country-code": config.countryCode,
    "content-type": "application/zip",
    "correlation-id": crypto.randomUUID(),
    "tenant-id": config.tenantId,
    "business-unit-id": businessUnit,
    "transaction-id": transactionId,
    "previous-transaction-id": previousTransactionId,
  });

  previousTransactionId = transactionId;
}

async function loadTest(toSend: number) {
  const waitBetweenBatches = 1 / BATCHES_PER_S;

  stats.startTime = new Date();
  while (stats.transactionsSent !== toSend) {
    const batch = Array.from({ length: TXS_PER_BATCH })
      .map((_, index) => transactions[index % transactions.length])
      .map((v) => prepareTransaction(v, generateTxId()));

    await Promise.all(
      batch.map((v) => publish(v).then(() => stats.transactionsSent++)),
    );
    await sleep(waitBetweenBatches);

    console.log(`Sent ${batch.length} transactions`);
  }
  stats.endTime = new Date();
}

function displayUpdatingRPS() {
  return setInterval(() => {
    const now = new Date();
    const diff = (now.getTime() - stats.startTime.getTime()) / 1000;

    console.log(
      `approx ${stats.transactionsSent / diff} transactions per second sent`,
    );
  }, 1000);
}
