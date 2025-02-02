import { sleep } from 'jsr:@so-dang-cool/sleep@1.3.0';
import { format } from 'jsr:@std/datetime@0.225.0';
import { resolve } from 'jsr:@std/path@0.225.0';
import { DOMParser } from 'npm:linkedom@0.18.6';

import { publishTransaction } from '../api.ts';
import { TENANT_ID } from '../constants.ts';
import { zip } from '../utils.ts';
import { config } from './config.ts';

const transactionDir = resolve('./ingest-many/transactions');
const transactions = Deno.readDir(transactionDir);
let previousTransactionId = 'FIRST_TRANSACTION';

for await (const transaction of transactions) {
  const file = await Deno.readTextFile(`${transactionDir}/${transaction.name}`);
  const document = new DOMParser().parseFromString(file, 'text/xml');
  const now = new Date();
  const nowStr = format(now, 'yyyy-MM-ddTHH:mm:ss');

  const bu = document
    .getElementsByTagName('BusinessUnit')[0]
    .getElementsByTagName('UnitID')[0];
  bu.setAttribute('Name', config.businessUnitId || bu.getAttribute('Name'));
  const businessUnit = bu.getAttribute('Name');

  const ws = document.getElementsByTagName('WorkstationID')[0];
  ws.innerHTML = config.workstationId || ws.innerHTML;
  const workstation = ws.innerHTML;

  const o = document.getElementsByTagName('OperatorID')[0];
  o.innerHTML = config.operatorId || o.innerHTML;

  const sn = document.getElementsByTagName('SequenceNumber')[0];
  sn.innerHTML = (config.sequenceNumber++).toString();
  const sequenceNumber = sn.innerHTML;

  const rn = document.getElementsByTagName('ReceiptNumber')[0];
  rn.innerHTML = (config.receiptNumber++).toString();
  const receiptNumber = rn.innerHTML;

  const tid = document.getElementsByTagName('TransactionID')[0];
  tid.innerHTML = `${businessUnit};${workstation};${sequenceNumber};${nowStr.replace(
    'T',
    '',
  )};${receiptNumber}`;
  const transactionId = tid.innerHTML;

  const beginDate = document.getElementsByTagName('BeginDateTime')[0];
  beginDate.innerHTML = nowStr;

  const endDate = document.getElementsByTagName('EndDateTime')[0];
  endDate.innerHTML = nowStr;

  const data = zip(new TextEncoder().encode(document.toString()))!;

  await publishTransaction(data, {
    'transaction-timestamp': now.toISOString(),
    'country-code': config.countryCode || 'NO',
    'content-type': 'application/zip',
    'correlation-id': crypto.randomUUID(),
    'tenant-id': config.tenantId || TENANT_ID,
    'business-unit-id': businessUnit,
    'transaction-id': transactionId,
    'previous-transaction-id': previousTransactionId,
  });

  console.log(
    `Published transaction from ${transaction.name} as ${transactionId}`,
  );

  previousTransactionId = transactionId;

  await sleep.millis(config.msBetweenIngests / 1000);
}
