/*
run this to start server:

  ```bash
  ./opa run --server --watch --log-level debug systems_ccc.ccc-api-prod.tar.gz
  ```
*/

import * as fs from "node:fs/promises";

const input = JSON.parse(await fs.readFile("sample-input.json"));
const res = await fetch(
  "http://localhost:8181/v1/data/policy/envoy/ingress/main/main",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  }
);

console.log(await res.json());
