import { DOMParser } from "https://esm.sh/linkedom@0.14.17";
import { format } from "https://deno.land/std@0.136.0/datetime/mod.ts";

import { config } from "./config.ts";
import { zip } from "../utils.ts";

export function prepareTransaction(
  file: string,
  transactionId = crypto.randomUUID(),
) {
  const document = new DOMParser().parseFromString(file, "text/xml");
  const now = new Date();
  const nowStr = format(now, "yyyy-MM-ddTHH:mm:ss");

  const bu =
    document.getElementsByTagName("BusinessUnit")[0].getElementsByTagName(
      "UnitID",
    )[0];
  bu.setAttribute("Name", config.businessUnitId || bu.getAttribute("Name"));
  const businessUnit = bu.getAttribute("Name");

  const ws = document.getElementsByTagName("WorkstationID")[0];
  ws.innerHTML = config.workstationId || ws.innerHTML;

  const o = document.getElementsByTagName("OperatorID")[0];
  o.innerHTML = config.operatorId || o.innerHTML;

  const sn = document.getElementsByTagName("SequenceNumber")[0];
  sn.innerHTML = (config.sequenceNumber++).toString();

  const rn = document.getElementsByTagName("ReceiptNumber")[0];
  rn.innerHTML = (config.receiptNumber++).toString();

  const tid = document.getElementsByTagName("TransactionID")[0];
  tid.innerHTML = transactionId;

  const beginDate = document.getElementsByTagName("BeginDateTime")[0];
  beginDate.innerHTML = nowStr;

  const endDate = document.getElementsByTagName("EndDateTime")[0];
  endDate.innerHTML = nowStr;

  const data = zip(new TextEncoder().encode(document.toString()))!;

  return { data, transactionId, businessUnit, now };
}
