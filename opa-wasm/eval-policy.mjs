// @ts-check
import fs from "node:fs/promises";
import { execa } from "execa";
import { loadAppPolicy } from "./lib/app-policy.mjs";

const input = await fs.readFile(process.argv[3], "utf8").catch(() => {
  return printUsageAndExit();
});

switch (process.argv[2]) {
  case "wasm": {
    const policy = await loadAppPolicy("ccc.ccc-api-prod");
    const [{ result }] = policy.evaluate(JSON.parse(input));
    console.log(JSON.stringify(result, null, 2));

    // NOTE: uncomment to run benchmark
    // const start = Date.now();
    // const runs = 10_000;
    // for (let i = 0; i < runs; i++) {
    //   policy.evaluate(JSON.parse(input));
    // }
    // const latency = (Date.now() - start) / runs;
    // console.log(`Avg latency (${runs} runs): ${latency}ms`);
    break;
  }
  case "native": {
    // works only after running at least once in wasm mode
    await execa(
      "./tmp/opa",
      [
        "eval",
        "data.policy.envoy.ingress.main.main",
        ...["-b", "tmp/native-bundle.tar.gz"],
        ...["-f", "pretty"],
        "-I",
      ],
      { input, stdout: "inherit", stderr: "inherit" }
    ).catch(() => 0);
    break;
  }
  default: {
    printUsageAndExit();
  }
}

function printUsageAndExit() {
  console.error(`Usage: node eval-policy.mjs {wasm,native} <input>`);
  return process.exit(1);
}
