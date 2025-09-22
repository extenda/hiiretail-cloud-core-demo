// @deno-types="npm:@types/express@4.17.15"
import express from "npm:express@4.18.2";
import { zip } from "../utils.ts";

const app = express();

app.use(express.json());
app.use((req, _, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid authorization header" });
  }
  const token = authHeader.split(" ")[1];
  try {
    // Verify JWT token here
    // For demo purposes, just checking if token exists
    if (!token) {
      throw new Error("Invalid token");
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
});

app.get("/api/v1/transactions/:transactionId", async (req, res) => {
  const { transactionId } = req.params;

  res.json({
    transactionId: transactionId,
    transactionData: btoa(
      String.fromCharCode(
        ...(await zip(
          await Deno.readFile(
            "./storageless/transactions/" + transactionId + ".xml"
          )
        )!)
      )
    ),
    extraProperty1: "string",
    countryCode: "NO",
    linkedTransactions: [
      {
        transactionId: transactionId,
        countryCode: "NO",
        transactionData: btoa(
          String.fromCharCode(
            ...(await zip(
              await Deno.readFile(
                "./storageless/transactions/void-item-sale.xml"
              )
            )!)
          )
        ),
      },
    ],
  });
  res.status(200).end();
});

app.post("/api/v1/transactions:search", async (req, res) => {
  const searchResult = await Deno.readFile("./storageless/search-result.json");
  const searchResultJson = JSON.parse(new TextDecoder().decode(searchResult));

  res.json({
    results: searchResultJson,
    page: {
      take: 10,
      skip: 0,
      total: searchResultJson.length,
      hasMore: false,
    },
  });
});

app.listen(8000, () => {
  console.log("Server is running on http://localhost:8000");
});
