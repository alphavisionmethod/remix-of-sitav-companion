// ═══════════════════════════════════════════════════════════════
// ed25519 signature verification (Web Crypto)
// ═══════════════════════════════════════════════════════════════

import { base64ToBytes } from "./package-format";

export interface VerifyArgs {
  /** Raw bytes that were signed (typically canonicalized manifest). */
  message: Uint8Array | string;
  /** base64 ed25519 signature. */
  signature: string;
  /** base64 ed25519 public key (raw 32 bytes). */
  publicKey: string;
}

function toBytes(v: Uint8Array | string): Uint8Array {
  return typeof v === "string" ? new TextEncoder().encode(v) : v;
}

/** Verify an ed25519 signature using Web Crypto. */
export async function verifyEd25519({ message, signature, publicKey }: VerifyArgs): Promise<boolean> {
  try {
    const sigBytes = base64ToBytes(signature);
    const keyBytes = base64ToBytes(publicKey);
    if (keyBytes.length !== 32) return false;
    if (sigBytes.length !== 64) return false;

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "Ed25519" },
      false,
      ["verify"],
    );

    return await crypto.subtle.verify({ name: "Ed25519" }, cryptoKey, sigBytes, toBytes(message));
  } catch {
    // Web Crypto Ed25519 may not be available in all environments — degrade honestly.
    return false;
  }
}

/** Returns true if the runtime supports ed25519 verification natively. */
export async function isEd25519Available(): Promise<boolean> {
  try {
    const seed = new Uint8Array(32);
    await crypto.subtle.importKey("raw", seed, { name: "Ed25519" }, false, ["verify"]);
    return true;
  } catch {
    return false;
  }
}
