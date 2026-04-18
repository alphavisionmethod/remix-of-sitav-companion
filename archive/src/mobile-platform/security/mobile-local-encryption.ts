// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Local Encryption (envelope cipher abstraction)
// ═══════════════════════════════════════════════════════════════

export interface LocalEncryptionEnvelope {
  algorithm: "AES-GCM";
  ciphertext: string; // base64
  iv: string;        // base64
  /** Identifier of the key in secure storage / Keychain / Keystore. */
  keyId: string;
  createdAt: string;
}

export async function encryptLocal(plaintext: string, keyId = "sita.default"): Promise<LocalEncryptionEnvelope> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("WebCrypto not available — mobile local encryption requires a secure context.");
  }
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  // Derive a stable per-keyId key from the keyId string (placeholder until adapter wires Keystore/Keychain).
  const keyMaterial = await crypto.subtle.digest("SHA-256", enc.encode(`sita:${keyId}`));
  const key = await crypto.subtle.importKey("raw", keyMaterial, "AES-GCM", false, ["encrypt"]);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plaintext));
  return {
    algorithm: "AES-GCM",
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ct))),
    iv: btoa(String.fromCharCode(...iv)),
    keyId,
    createdAt: new Date().toISOString(),
  };
}

export async function decryptLocal(env: LocalEncryptionEnvelope): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("WebCrypto not available.");
  }
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const iv = Uint8Array.from(atob(env.iv), (c) => c.charCodeAt(0));
  const ct = Uint8Array.from(atob(env.ciphertext), (c) => c.charCodeAt(0));
  const keyMaterial = await crypto.subtle.digest("SHA-256", enc.encode(`sita:${env.keyId}`));
  const key = await crypto.subtle.importKey("raw", keyMaterial, "AES-GCM", false, ["decrypt"]);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return dec.decode(pt);
}
