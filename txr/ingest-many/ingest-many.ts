import { resolve } from "https://deno.land/std@0.136.0/path/mod.ts";
import { sleep } from "https://deno.land/x/sleep/mod.ts";
import { config } from './config.ts';
import {publishTransaction} from '../api.ts';
import {TESTRUNNER_TENANT_ID} from '../constants.ts';
import {prepareTransaction} from './prepare-transaction.ts';

const transactionDir = resolve('./ingest-many/transactions');
const transactions = Deno.readDir(transactionDir);
let previousTransactionId = 'FIRST_TRANSACTION';

for await (const transaction of transactions) {
  const file = await Deno.readTextFile(`${transactionDir}/${transaction.name}`);
  const { data, transactionId, businessUnit, now } = await prepareTransaction(file);

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

  console.log(`Published transaction from ${transaction.name} as ${transactionId}`)

  previousTransactionId = transactionId;

  await sleep(config.msBetweenIngests / 1000);
}
