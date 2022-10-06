// import { resolve } from "https://deno.land/std@0.136.0/path/mod.ts";
// import {prepareTransaction} from '../prepare-transaction.ts';
// import {publishTransaction} from '../../api.ts';
// import {config} from '../config.ts';
// import {TESTRUNNER_TENANT_ID} from '../../constants.ts';
// import {sleep} from 'https://deno.land/x/sleep@v1.2.1/sleep.ts';

// const loadConfig = {
//   transactionsPerBatch: 10,
//   batchesPerSecond: 1,
//   startTime: new Date(),
// };
//
// const transactionDir = resolve('./ingest-many/transactions');
// const transactions = Array.from(Deno.readDirSync(transactionDir);
// let previousTransactionId = 'FIRST_TRANSACTION';
//
// function getTransaction(index: number) {
//   return transactions[index % transactions.length];
// }
//
// async function publish({data, now, businessUnit, transactionId}: ReturnType<typeof prepareTransaction>) {
//   await publishTransaction(data, {
//     "transaction-timestamp": now.toISOString(),
//     "country-code": config.countryCode || 'NO',
//     "content-type": "application/zip",
//     "correlation-id": crypto.randomUUID(),
//     "tenant-id": config.tenantId || TESTRUNNER_TENANT_ID,
//     "business-unit-id": businessUnit,
//     "transaction-id": transactionId,
//     "previous-transaction-id": previousTransactionId,
//   });
//
//   previousTransactionId = transactionId;
// }
//
// async function mockLoad(toSend: number) {
//   let sent = 0;
//   const waitBetweenBatches = 1000 / loadConfig.batchesPerSecond;
//
//   while (sent !== toSend) {
//     const batch = Array.from({ length: loadConfig.transactionsPerBatch })
//       .map((_, i) => getTransaction(i))
//       .map((v) => prepareTransaction(v.name));
//
//     await sleep(waitBetweenBatches)
//
//     console.log(batch)
//     sent += batch.length;
//   }
// }
//
// await mockLoad(20);
