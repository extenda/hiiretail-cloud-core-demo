import { writeFile } from 'node:fs/promises';

import { createTxFetcher } from './tx-fetcher.mjs';
import { createTxWaiter } from './tx-waiter.mjs';
import { indexToTxId, LOAD_TEST_NAME, N_TRANSACTIONS_TO_SEND } from './config.mjs';

const allTransactionIds = Array.from({ length: N_TRANSACTIONS_TO_SEND }).map(indexToTxId);

const getTxById = await createTxFetcher();
const waitForTxToAppear = createTxWaiter(getTxById);
const results = await Promise.all(allTransactionIds.map(waitForTxToAppear));

await writeFile(`${LOAD_TEST_NAME}.txt`, JSON.stringify(results, null, 2));
console.log('Done');
