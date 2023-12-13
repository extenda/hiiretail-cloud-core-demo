import fs from "node:fs/promises";
import opa from "@open-policy-agent/opa-wasm";
import jsonwebtoken from "jsonwebtoken";

const policy = await opa.loadPolicy(
  await fs.readFile("out/policy.wasm"),
  undefined,
  makeCustomBuiltins()
);
policy.setData(JSON.parse(await fs.readFile("out/data.json")));

const input = JSON.parse(await fs.readFile("sample-input.json"));
const res = policy.evaluate(input);
console.dir(res, { depth: 10 });

// NOTE: uncomment to run benchmark
// console.time("evaluate 10K");
// for (let i = 0; i < 10000; i++) {
//   policy.evaluate(input);
// }
// console.timeEnd("evaluate 10K");

function makeCustomBuiltins() {
  return {
    "time.now_ns": () => Date.now() * 1000,
    "io.jwt.decode": (jwt) => {
      const decoded = jsonwebtoken.decode(jwt, { complete: true });
      if (decoded === null) {
        return [{}, {}, {}];
      }
      return [decoded.header, decoded.payload, decoded.signature];
    },
    "io.jwt.decode_verify": (jwt, { cert, iss, aud, time, ...other }) => {
      if (Object.keys(other).length !== 0) {
        throw new Error(
          "Unknown constraints: " + Object.keys(other).join(", ")
        );
      }

      try {
        let key = cert;
        if (cert.startsWith('{"keys":')) {
          const decoded = jsonwebtoken.decode(jwt, { complete: true });
          if (decoded === null) {
            throw new Error("Malformed JWT");
          }

          const { keys } = JSON.parse(cert);
          key = keys.find((k) => k.kid === decoded.header.kid)?.n;
        }

        const { header, payload } = jsonwebtoken.verify(jwt, key, {
          issuer: iss,
          audience: aud,
          complete: true,
          clockTimestamp: time !== undefined ? time / 1_000_000 : undefined,
        });
        return [true, header, payload];
      } catch (_error) {
        return [false, {}, {}];
      }
    },
  };
}
