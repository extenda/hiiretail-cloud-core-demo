import fs from "node:fs/promises";
import opa from "@open-policy-agent/opa-wasm";
import jsonwebtoken from "jsonwebtoken";

const policy = await opa.loadPolicy(
  await fs.readFile("out/policy.wasm"),
  undefined,
  buildCustomBuiltins()
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

function buildCustomBuiltins() {
  return {
    "io.jwt.decode": (jwt) => {
      const decoded = jsonwebtoken.decode(jwt, { complete: true });
      if (decoded === null) {
        return [{}, {}, {}];
      }

      return [decoded.header, decoded.payload, decoded.signature];
    },
    "io.jwt.decode_verify": (jwt, { cert, iss, aud, time, ...other }) => {
      // TODO: not sure what to do with time
      const _time = time;
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
          key = keys[decoded.header.kid]?.n;
        }

        const { header, payload } = jsonwebtoken.verify(jwt, key, {
          issuer: iss,
          audience: aud,
          // TODO: not sure what to do with time
          // clockTimestamp: time !== undefined ? time / 1000 : undefined,
        });

        // console.log("OK(io.jwt.decode_verify)", { cert, iss, aud, time }, "=", {
        //   ok: true,
        // });
        // console.log("ok");
        return [true, header, payload];
      } catch (error) {
        // console.log(
        //   "ERROR(io.jwt.decode_verify)",
        //   { cert: cert.slice(0, 10) + "...", iss, aud, time },
        //   "=",
        //   { error: error.message }
        // );
        // const decoded = jsonwebtoken.decode(jwt, { complete: true });
        // console.log("err", { error: error.message, decoded, cert });
        return [false, {}, {}];
      }
    },
    "time.now_ns": () => Date.now() * 1000,
  };
}
