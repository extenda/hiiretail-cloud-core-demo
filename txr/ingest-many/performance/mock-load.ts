import { resolve } from "https://deno.land/std@0.136.0/path/mod.ts";
import { quantile, mean } from "https://deno.land/x/statistics@v0.1.1/mod.ts";
import {prepareTransaction} from '../prepare-transaction.ts';
import {getTransactionById, publishTransaction, searchTransactions} from '../../api.ts';
import {config} from '../config.ts';
import {TESTRUNNER_TENANT_ID} from '../../constants.ts';
import {sleep} from 'https://deno.land/x/sleep@v1.2.1/sleep.ts';

let calculationInterval: number;

const searchChecks: Record<string, Promise<void>> = {};

const stats = {
  transactionsSent: 0,
  accessibleByIdIn: [] as number[],
  searchableIn: [] as number[],
  startTime: new Date(),
  endTime: new Date(),
};

const loadConfig = {
  transactionsPerBatch: 15,
  batchesPerSecond: 4,
};

const ONE_MINUTE_LOAD = (loadConfig.transactionsPerBatch * loadConfig.batchesPerSecond) * 60;

const transactionDir = resolve('./ingest-many/transactions');
const transactions = await Promise.all(Array.from(Deno.readDirSync(transactionDir)).map(v => Deno.readTextFile(`${transactionDir}/${v.name}`)));
let previousTransactionId = 'FIRST_TRANSACTION';

function getTransaction(index: number) {
  return transactions[index % transactions.length];
}

async function checkGetById(transactionId: string) {
  const then = Date.now();
  let found = false;
  while (Date.now() - then > 60000 || !found) {
    try {
      await getTransactionById(transactionId);
      stats.accessibleByIdIn.push(Date.now() - then)
      found = true;
      delete searchChecks[transactionId + ':getById'];
    } catch (e) {}
    await sleep(0.1)
  }
}

async function checkSearch(transactionId: string) {
  const then = Date.now();
  let found = false;
  while (Date.now() - then > 60000 || !found) {
    try {
      const res = await searchTransactions({
        transactionIds: [transactionId]
      });
      if (res.results.length > 0) {
        found = true;
        stats.searchableIn.push(Date.now() - then)
        delete searchChecks[transactionId + ':search'];
      }
    } catch (e) {}
    await sleep(0.1)
  }
}

async function publish({data, now, businessUnit, transactionId}: ReturnType<typeof prepareTransaction>) {
  await publishTransaction(data, {
    "transaction-timestamp": now.toISOString(),
    "country-code": config.countryCode || 'NO',
    "content-type": "application/zip",
    "correlation-id": crypto.randomUUID(),
    "tenant-id": config.tenantId || TESTRUNNER_TENANT_ID,
    "business-unit-id": businessUnit,
    "transaction-id": transactionId,
    "previous-transaction-id": previousTransactionId,
  });

  previousTransactionId = transactionId;
}

async function mockLoad(toSend: number) {
  let sent = 0;
  const waitBetweenBatches = 1 / loadConfig.batchesPerSecond;

  calculationInterval = setInterval(() => {
    stats.transactionsSent = sent;
    const now = new Date();
    const diff = (now.getTime() - stats.startTime.getTime()) / 1000;

    console.log(`approx ${stats.transactionsSent / diff} transactions per second sent`)
  }, 1000);

  stats.startTime = new Date();
  while (sent !== toSend) {
    const batch = Array.from({ length: loadConfig.transactionsPerBatch })
      .map((_, i) => getTransaction(i))
      .map((v) => prepareTransaction(v));

    await Promise.all(batch.map(v => publish(v).then(() => {
      searchChecks[v.transactionId + ':getById'] = checkGetById(v.transactionId);
      searchChecks[v.transactionId + ':search'] = checkSearch(v.transactionId);
    }).then(() => sent++)))
    await sleep(waitBetweenBatches)

    console.log(`Sent ${batch.length} transactions`)
  }
  stats.endTime = new Date();
  clearInterval(calculationInterval);
}

await mockLoad(ONE_MINUTE_LOAD)
  .then(() => clearInterval(calculationInterval))
  .then(() => Promise.all(Object.values(searchChecks)))
  .catch(() => clearInterval(calculationInterval));

console.log(
  `\n`,
  `mean get by id: ${mean(stats.accessibleByIdIn)}\n`,
  `mean search: ${mean(stats.searchableIn)}\n`,
  `[99%, 95%, 50%] get by id: ${quantile(stats.accessibleByIdIn, [.99, .95, .50])}\n`,
  `[99%, 95%, 50%] search: ${quantile(stats.searchableIn, [.99, .95, .50])}\n`,
  `\n`,
  `Average throughput: ${stats.transactionsSent / (stats.endTime.getTime() - stats.startTime.getTime()) * 1000}\n`,
  `\n`,
  `Total sent: ${stats.transactionsSent}\n`,
)
