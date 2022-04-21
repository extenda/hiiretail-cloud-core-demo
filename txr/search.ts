import { searchTransactions } from "./api.ts";

const businessUnitId = prompt("business-unit-id:")!;

const response = await searchTransactions({
  businessUnitId,
});

console.log("Results:", response.results.map((_) => _.transactionId));
