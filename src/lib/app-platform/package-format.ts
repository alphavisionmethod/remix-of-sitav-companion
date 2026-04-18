// ═══════════════════════════════════════════════════════════════
// Package format helpers — canonicalization + hashing
// ═══════════════════════════════════════════════════════════════

import type { PackageManifest } from "./package-schema";

/** Stable canonical JSON (sorted keys) for hashing/signing. */
export function canonicalize(manifest: PackageManifest): string {
  return JSON.stringify(stripSignature(manifest), sortReplacer);
}

function sortReplacer(_k: string, v: unknown) {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return Object.keys(v as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = (v as Record<string, unknown>)[k];
        return acc;
      }, {});
  }
  return v;
}

/** Returns a copy of the manifest with the `signature.signature` removed.
 *  Used so the digest can be verified against a clean manifest. */
export function stripSignature(manifest: PackageManifest): PackageManifest {
  if (!manifest.signature) return manifest;
  const { signature, ...rest } = manifest.signature;
  void signature;
  return { ...manifest, signature: rest as PackageManifest["signature"] };
}

/** sha-256 hex of canonicalized manifest. */
export async function manifestHash(manifest: PackageManifest): Promise<string> {
  const data = new TextEncoder().encode(canonicalize(manifest));
  const buf = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(new Uint8Array(buf));
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/, "");
  if (clean.length % 2 !== 0) throw new Error("invalid hex");
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
