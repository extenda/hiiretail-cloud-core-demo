import { deflate, inflate } from "https://deno.land/x/pako@v2.0.3/pako.js";

export function base64ToBytes(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

export function zip(data: Uint8Array): Uint8Array {
  return deflate(data) as Uint8Array;
}

export function unzip(data: Uint8Array): Uint8Array {
  return inflate(data) as Uint8Array;
}
