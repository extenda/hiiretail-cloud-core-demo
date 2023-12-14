// @ts-check
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import fs1 from "node:fs";
import { Readable } from "node:stream";
import stream from "node:stream/promises";
import opa from "@open-policy-agent/opa-wasm";
import jsonwebtoken from "jsonwebtoken";
import jwkToBuffer from "jwk-to-pem";
import { Storage } from "@google-cloud/storage";
import { execa } from "execa";

export const DEFAULT_OPTIONS = {
  opaVersion: "v0.43.0",
  workDir: "node_modules/.opa-policy",
  nativeBundleBucket: "authz-bundles",
  getNativeBundlePath: (systemName) => `systems/${systemName}.tar.gz`,
  log: console.log,
  forceRebuild: false,
  entrypoints: [
    "policy/envoy/ingress/main/main",
    "policy/com.styra.envoy.app/rules/rules",
  ],
};

export async function loadAppPolicy(
  /** @type {string} */ systemName,
  options = DEFAULT_OPTIONS
) {
  const { module, data } = await buildModuleAndData(systemName, options);
  const policy = await opa.loadPolicy(module, undefined, makeCustomBuiltins());
  policy.setData(data);
  return policy;
}

/**
 * @typedef {{ isResolved: boolean; value: ReturnType<typeof buildModuleAndDataNoCache>; }} CacheEntry
 * @type {Record<string, CacheEntry>}
 * */
const BUILD_CACHE = {};
function buildModuleAndData(
  /** @type {string} */ systemName,
  /** @type {typeof DEFAULT_OPTIONS} */ options
) {
  let cached = BUILD_CACHE[systemName];
  if (cached == undefined || (options.forceRebuild && cached.isResolved)) {
    cached = {
      isResolved: false,
      value: buildModuleAndDataNoCache(systemName, options).then((value) => {
        cached.isResolved = true;
        return value;
      }),
    };
    BUILD_CACHE[systemName] = cached;
  }

  return cached.value;
}

async function buildModuleAndDataNoCache(
  /** @type {string} */ systemName,
  /** @type {typeof DEFAULT_OPTIONS} */ options
) {
  await fs
    .mkdir(options.workDir, { recursive: true })
    .catch((_ignored) => void 0);

  const opaFile = `${options.workDir}/opa`;
  if (!fs1.existsSync(opaFile)) {
    options.log("Downloading OPA...");

    const parentDir = path.dirname(opaFile);
    await fs.mkdir(parentDir, { recursive: true }).catch((_ignored) => void 0);

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

    const opaBinaryUrl = `https://github.com/open-policy-agent/opa/releases/download/${options.opaVersion}/${binary}`;
    const res = await fetch(opaBinaryUrl);
    if (!res.ok) {
      throw new Error(
        `OPA download failed: (${res.statusText}): ${await res.text()}`
      );
    }

    const outStream = fs1.createWriteStream(opaFile, { flags: "wx" });
    // @ts-expect-error: res.body has wrong type
    await stream.finished(Readable.fromWeb(res.body).pipe(outStream));
    await fs.chmod(opaFile, "111"); // make executable
  }

  const nativeBundle = `${options.workDir}/native-bundle.tar.gz`;
  {
    options.log("Downloading native bundle...");

    const parentDir = path.dirname(nativeBundle);
    await fs.mkdir(parentDir, { recursive: true }).catch((_ignored) => void 0);

    const bundleFile = new Storage({ projectId: "<anything>" })
      .bucket(options.nativeBundleBucket)
      .file(options.getNativeBundlePath(systemName));

    await bundleFile.download({ destination: nativeBundle });
  }

  const wasmBundle = `${options.workDir}/wasm-bundle.tar.gz`;
  {
    options.log("Building WASM bundle...");

    const parentDir = path.dirname(wasmBundle);
    await fs.mkdir(parentDir, { recursive: true }).catch((_ignored) => void 0);

    await execa(opaFile, [
      "build",
      ...["-t", "wasm"],
      ...options.entrypoints.map((e) => ["-e", e]).flat(),
      ...["-b", nativeBundle],
      ...["-o", wasmBundle],
    ]);
  }

  const wasmModuleFile = `${options.workDir}/policy.wasm`;
  const dataFile = `${options.workDir}/data.json`;
  {
    await execa("tar", [
      "-x",
      ...["-f", wasmBundle],
      ...["-C", options.workDir],
      "/policy.wasm",
      "/data.json",
    ]);
  }

  return {
    module: await fs.readFile(wasmModuleFile),
    data: JSON.parse(await fs.readFile(dataFile, "utf8")),
  };
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
          clockTimestamp: time !== undefined ? +time / 1_000_000 : undefined,
        });
        return [true, header, payload];
      } catch (_error) {
        return [false, {}, {}];
      }
    },
  };
}
