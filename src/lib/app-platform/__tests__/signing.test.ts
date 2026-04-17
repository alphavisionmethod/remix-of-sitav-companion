// Tests for ed25519 signing (Web Crypto, runs in Node 20+)
import { describe, it, expect } from "vitest";
import { verifyEd25519, isEd25519Available } from "@/lib/app-platform/signing";
import { bytesToBase64 } from "@/lib/app-platform/package-format";

describe("ed25519 signing", () => {
  it("reports availability", async () => {
    // Just ensures the call doesn't throw
    const ok = await isEd25519Available();
    expect(typeof ok).toBe("boolean");
  });

  it("rejects invalid signature length", async () => {
    const ok = await verifyEd25519({
      message: "hello",
      signature: bytesToBase64(new Uint8Array(10)),
      publicKey: bytesToBase64(new Uint8Array(32)),
    });
    expect(ok).toBe(false);
  });

  it("rejects invalid public key length", async () => {
    const ok = await verifyEd25519({
      message: "hello",
      signature: bytesToBase64(new Uint8Array(64)),
      publicKey: bytesToBase64(new Uint8Array(10)),
    });
    expect(ok).toBe(false);
  });

  it("verifies a real ed25519 signature roundtrip", async () => {
    const available = await isEd25519Available();
    if (!available) return;
    const pair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]) as CryptoKeyPair;
    const msg = new TextEncoder().encode("authentic-message");
    const sigBuf = await crypto.subtle.sign({ name: "Ed25519" }, pair.privateKey, msg);
    const pubBuf = await crypto.subtle.exportKey("raw", pair.publicKey);
    const ok = await verifyEd25519({
      message: msg,
      signature: bytesToBase64(new Uint8Array(sigBuf)),
      publicKey: bytesToBase64(new Uint8Array(pubBuf)),
    });
    expect(ok).toBe(true);
  });
});
