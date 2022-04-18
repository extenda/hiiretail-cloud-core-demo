import { sendTransaction } from "./send-transaction.ts";

while (true) {
  const businessUnitId = prompt("business-unit-id:")!;
  const previousTransactionId = prompt("previous-transaction-id:")!;
  const transactionId = prompt("transaction-id:")!;

  await sendTransaction({
    businessUnitId,
    previousTransactionId,
    transactionId,
  });
}
