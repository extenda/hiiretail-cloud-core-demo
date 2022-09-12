import { searchTransactions,getTransactionById } from "./api.ts";
import {base64ToBytes, unzip} from './utils.ts';

const transactionsDir = 'transactions';

try {
  // directory to save transactions to
  await Deno.mkdir('./' + transactionsDir)
} catch (e) {
  console.warn(e.message);
  // ignored
}


// https://developer.hiiretail.com/api/txr-search-api#operation/findTransactions
const filter = {
  // transactionId: []
};

let { results, page } = await searchTransactions(filter, { skip: 0, take: 1000 });
await Promise.all(results.map(v => downloadTransaction(v.transactionId)));

while (page.hasMore) {
  const cursor = page.take + page.skip;
  console.log(`Transactions downloaded ${cursor}, transactions left: ${page.total - (cursor)}`);
  const res = await searchTransactions(filter, { skip: cursor, take: 1000 });
  page = res.page;

  await Promise.all(results.map(v => downloadTransaction(v.transactionId)));
}

async function downloadTransaction(transactionId: string) {
  const transaction = await getTransactionById(transactionId);
  const zippedTransaction = base64ToBytes(transaction.transactionData);
  const xml = unzip(zippedTransaction);

  await Deno.writeFile(`./${transactionsDir}/${transaction.transactionId}.xml`, xml)
}


