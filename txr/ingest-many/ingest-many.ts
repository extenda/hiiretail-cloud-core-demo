import { format } from "jsr:@std/datetime@0.225.0";
import { resolve } from "jsr:@std/path@0.225.0";
import { DOMParser } from "npm:linkedom@0.18.6";

import { publishTransaction } from "../api.ts";
import { TENANT_ID } from "../constants.ts";
import { zip } from "../utils.ts";
import { config } from "./config.ts";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const templatePath = resolve("./ingest-many/transactions/regular-sales.xml");
const templateXml = await Deno.readTextFile(templatePath);

interface BuState {
  sequenceNumber: number;
  receiptNumber: number;
  previousTransactionId: string;
}

const buState = new Map<string, BuState>(
  config.businessUnitIds.map((id) => [
    id,
    {
      sequenceNumber: config.initialSequenceNumber,
      receiptNumber: config.initialReceiptNumber,
      previousTransactionId: "FIRST_TRANSACTION",
    },
  ]),
);
let buIndex = 0;

function buildTransaction() {
  const businessUnitId =
    config.businessUnitIds[buIndex % config.businessUnitIds.length];
  buIndex++;
  const state = buState.get(businessUnitId)!;

  const document = new DOMParser().parseFromString(templateXml, "text/xml");
  const now = new Date();
  const nowStr = format(now, "yyyy-MM-ddTHH:mm:ss");

  const bu = document
    .getElementsByTagName("BusinessUnit")[0]
    .getElementsByTagName("UnitID")[0];
  bu.setAttribute("Name", businessUnitId);
  const businessUnit = bu.getAttribute("Name");

  const ws = document.getElementsByTagName("WorkstationID")[0];
  ws.innerHTML = config.workstationId || ws.innerHTML;
  const workstation = ws.innerHTML;

  const o = document.getElementsByTagName("OperatorID")[0];
  o.innerHTML = config.operatorId || o.innerHTML;

  const sn = document.getElementsByTagName("SequenceNumber")[0];
  sn.innerHTML = (state.sequenceNumber++).toString();
  const sequenceNumber = sn.innerHTML;

  const rn = document.getElementsByTagName("ReceiptNumber")[0];
  rn.innerHTML = (state.receiptNumber++).toString();
  const receiptNumber = rn.innerHTML;

  const tid = document.getElementsByTagName("TransactionID")[0];
  tid.innerHTML = `${businessUnit};${workstation};${sequenceNumber};${nowStr.replace(
    "T",
    "",
  )};${receiptNumber}`;
  const transactionId = tid.innerHTML;

  const beginDate = document.getElementsByTagName("BeginDateTime")[0];
  beginDate.innerHTML = nowStr;

  const endDate = document.getElementsByTagName("EndDateTime")[0];
  endDate.innerHTML = nowStr;

  const data = zip(new TextEncoder().encode(document.toString()))!;

  const headers = {
    "transaction-timestamp": now.toISOString(),
    "country-code": config.countryCode || "NO",
    "content-type": "application/zip",
    "correlation-id": crypto.randomUUID(),
    "tenant-id": config.tenantId || TENANT_ID,
    "business-unit-id": businessUnit,
    "transaction-id": transactionId,
    "previous-transaction-id": state.previousTransactionId,
  };

  state.previousTransactionId = transactionId;

  return { data, headers, transactionId };
}

let sent = 0;
const tps = config.transactionsPerSecond;
const ingestStart = performance.now();

while (sent < config.transactionCount) {
  const batchStart = performance.now();
  const batchSize = Math.min(tps, config.transactionCount - sent);
  const interval = 1000 / tps;

  // Stagger publishes evenly across the 1-second window
  const promises: Promise<void>[] = [];
  for (let i = 0; i < batchSize; i++) {
    const tx = buildTransaction();

    // Fire publish without awaiting — spreads requests across the second
    promises.push(publishTransaction(tx.data, tx.headers));

    if (i < batchSize - 1) {
      // Wait until the next slot relative to the batch start
      const targetTime = batchStart + (i + 1) * interval;
      const sleepMs = targetTime - performance.now();
      if (sleepMs > 0) await delay(sleepMs);
    }
  }

  const results = await Promise.allSettled(promises);

  const failed = results.filter((r) => r.status === "rejected");
  sent += batchSize;

  const elapsed = performance.now() - batchStart;
  const batchTps = elapsed > 0 ? (batchSize * 1000) / elapsed : 0;
  const wallElapsed = performance.now() - ingestStart;
  const avgTps = wallElapsed > 0 ? (sent * 1000) / wallElapsed : 0;
  console.log(
    `[${sent}/${config.transactionCount}] Batch of ${batchSize} sent in ${elapsed.toFixed(0)}ms` +
      ` (~${batchTps.toFixed(1)} tx/s this batch, ~${avgTps.toFixed(1)} tx/s avg)` +
      (failed.length ? ` (${failed.length} failed)` : ""),
  );

  if (failed.length) {
    for (const f of failed) {
      console.error("  ", (f as PromiseRejectedResult).reason);
    }
    console.error(`Aborting due to ${failed.length} failed transaction(s).`);
    Deno.exit(1);
  }

  // If publishes are still in-flight past the 1s window, the next batch
  // starts immediately (the warning above will show elapsed > 1000ms).
  // Otherwise, wait for the remainder of the 1-second window.
  const remaining = 1000 - (performance.now() - batchStart);
  if (remaining > 0 && sent < config.transactionCount) {
    await delay(remaining);
  }
}

console.log(`Done. Published ${sent} transactions.`);
