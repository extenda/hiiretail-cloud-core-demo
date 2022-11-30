import { pipe } from "https://deno.land/x/compose@1.3.2/index.js";
import { getTransactionById } from "./api.ts";
import { base64ToBytes, unzip } from "./utils.ts";

const transactionId = prompt("transaction-id:")!;

const transactionData = pipe(
  await getTransactionById(transactionId),
  (_) => base64ToBytes(_.transactionData),
  (_) => unzip(_),
  (_) => new TextDecoder().decode(_),
);

console.log(transactionData);
