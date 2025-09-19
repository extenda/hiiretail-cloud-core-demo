// @deno-types="npm:@types/express@4.17.15"
import express from "npm:express@4.18.2";

const app = express();

app.use(express.json());

app.get("/api/v1/transactions/:transactionId", (req, res) => {
  const { transactionId } = req.params;

  // invalid response
  // res.json({ message: "Hello World" });

  // valid response
  res.json({
    transactionId: transactionId,
    transactionData: "dGVzdA==",
    extraProperty1: "string", 
    countryCode: "NO",
    linkedTransactions: [
      {
        transactionId: transactionId,
        countryCode: "NO",
        transactionData: "dGVzdA==",
      },
    ],
  });
  res.status(200).end();
});

app.post("/api/v1/transactions:search", (req, res) => {
  // invalid response
  // res.json({ message: "Hello World" });

  // valid response
  // search body
  console.log(req.body);
  res.json({
    results: [
      {
        extraProperty1: "string",
        transactionId: "001;01;59;2021-11-1418:13:52;33",
        workstationId: "01",
        operatorId: "01",
        total: "50",
        countryCode: "UK",
        beginDateTime: "2021-11-14 17:13:10 UTC",
        endDateTime: "2021-11-14 18:13:10 UTC",
        businessUnitId: "001",
        receiptNumber: "01",
        events: [{ eventName: "Sale" }, { eventName: "Return" }],
        retailStatus: "Finished",
        isTrainingMode: false,
      },
    ],
    page: {
      take: 10,
      skip: 0,
      total: 1,
      hasMore: false,
    },
  });
});

app.listen(8000, () => {
  console.log("Server is running on http://localhost:8000");
});
