import { TENANT_ID } from "../constants.ts";

export const config = {
  // total number of transactions to publish
  transactionCount: 20000,

  // number of transactions to publish per second (evenly distributed)
  transactionsPerSecond: 60, // NOTE: set 10-20% more to account for latencies

  // business unit IDs to distribute transactions across (round-robin)
  businessUnitIds: Array.from({ length: 500 }, (_, i) => `at-test-${i + 1}`),
  workstationId: "9800",
  operatorId: "txr-ingestor-1",

  // starting values for per-BU sequence/receipt counters
  initialSequenceNumber: 1,
  initialReceiptNumber: 1,

  // default values, will be used if left undefined
  countryCode: "NO",
  tenantId: TENANT_ID,
};
