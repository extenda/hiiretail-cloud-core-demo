// @ts-check
import os from "node:os";
import fs from "node:fs/promises";
import fs1 from "node:fs";
import stream from "node:stream/promises";
import stream1 from "node:stream";
import opa from "@open-policy-agent/opa-wasm";
import jsonwebtoken from "jsonwebtoken";
import jwkToBuffer from "jwk-to-pem";
import tar from "tar";
import { Storage } from "@google-cloud/storage";
import { execa } from "execa";

const OPA_VERSION = "v0.43.0";
const POLICY_BUNDLE_BUCKET = "authz-bundles";
const WORKDIR = "./tmp";
const OPA_FILE = `${WORKDIR}/opa`;
const INPUT_DIR = `${WORKDIR}/in`;
const INPUT_BUNDLE = `${INPUT_DIR}/bundle.tar.gz`;
const OUTPUT_DIR = `${WORKDIR}/out`;
const OUTPUT_BUNDLE = `${OUTPUT_DIR}/bundle.tar.gz`;
const BUILD_CACHE = {};

/** @param {string} systemName */
export async function loadAppPolicy(systemName) {
  const { module, data } = await buildModuleAndData(systemName);
  const policy = await opa.loadPolicy(module, undefined, makeCustomBuiltins());
  policy.setData(data);
  return policy;
}

/**  @param {string} systemName */
async function buildModuleAndData(systemName) {
  if (BUILD_CACHE[systemName] !== undefined) {
    return BUILD_CACHE[systemName];
  }

  if (!fs1.existsSync(WORKDIR)) {
    await fs.mkdir(WORKDIR, { recursive: true });
  }

  if (!fs1.existsSync(OPA_FILE)) {
    let binary = "";
    switch (os.platform()) {
      case "linux":
        binary = "opa_linux_amd64_static";
        break;
      case "darwin":
        binary = "opa_darwin_amd64";
        break;
      default:
        throw new Error("Unsupported OS: " + os.platform());
    }

    const opaBinaryUrl = `https://github.com/open-policy-agent/opa/releases/download/${OPA_VERSION}/${binary}`;
    const res = await fetch(opaBinaryUrl);
    if (!res.ok) {
      throw new Error(
        `OPA download failed: (${res.statusText}): ${await res.text()}`
      );
    }

    const body = /** @type never */ (res.body);
    const outStream = fs1.createWriteStream(OPA_FILE, { flags: "wx" });
    await stream.finished(stream1.Readable.fromWeb(body).pipe(outStream));
    await fs.chmod(OPA_FILE, "111"); // make executable
  }

  if (!fs1.existsSync(INPUT_BUNDLE)) {
    console.log("Downloading...");
    await fs.mkdir(INPUT_DIR, { recursive: true });

    if (!fs1.existsSync(INPUT_BUNDLE)) {
      const bundleFile = new Storage({ projectId: "<anything>" })
        .bucket(POLICY_BUNDLE_BUCKET)
        .file(`systems/${systemName}.tar.gz`);

      await bundleFile.download({ destination: INPUT_BUNDLE });
    }

    await tar.extract({ file: INPUT_BUNDLE, cwd: INPUT_DIR });
  }

  if (!fs1.existsSync(OUTPUT_BUNDLE)) {
    console.log("Building...");
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    if (!fs1.existsSync(OUTPUT_BUNDLE)) {
      await execa(OPA_FILE, [
        "build",
        ...["-t", "wasm"],
        ...["-e", "policy/envoy/ingress/main/main"],
        ...["-o", OUTPUT_BUNDLE],
        INPUT_DIR,
      ]);
    }

    await tar.extract({ file: OUTPUT_BUNDLE, cwd: OUTPUT_DIR });
  }

  const module = await fs.readFile(`${OUTPUT_DIR}/policy.wasm`);
  const data = JSON.parse(await fs.readFile(`${OUTPUT_DIR}/data.json`, "utf8"));

  BUILD_CACHE[systemName] = { module, data };
  return { module, data };
}

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
          const { keys } = JSON.parse(cert);
          const keyInfo = keys.find((k) => k.kid === decoded?.header.kid);
          key = jwkToBuffer(keyInfo);
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
