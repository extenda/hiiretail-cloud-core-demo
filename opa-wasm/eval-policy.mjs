// @ts-check
import fs from "node:fs/promises";
import { execa } from "execa";
import { loadAppPolicy } from "./load-app-policy.mjs";

const input = await fs.readFile(process.argv[3], "utf8").catch(() => {
  return printUsageAndExit();
});

switch (process.argv[2]) {
  case "wasm": {
    const policy = await loadAppPolicy("ccc.ccc-api-prod");
    const [{ result }] = policy.evaluate(JSON.parse(input));
    console.log(JSON.stringify(result, null, 2));
    break;
  }
  case "native": {
    // works only after starting running eval-policy in wasm mode
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
