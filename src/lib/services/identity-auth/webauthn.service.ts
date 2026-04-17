// ═══════════════════════════════════════════════════════════════
// SITA OS — WebAuthn / Passkey Service (Phase 19.B)
// Real navigator.credentials.create/get ceremony
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface PasskeyRecord {
  id: string;
  credentialId: string;
  deviceLabel: string | null;
  transports: string[];
  lastUsedAt: string | null;
  createdAt: string;
}

function bufToB64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64UrlToBuf(b64url: string): ArrayBuffer {
  const pad = "=".repeat((4 - (b64url.length % 4)) % 4);
  const b64 = (b64url + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const buf = new ArrayBuffer(bin.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
  return buf;
}

export const WebAuthnService = {
  /** Returns true if WebAuthn is supported on this device. */
  isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      typeof window.PublicKeyCredential !== "undefined" &&
      typeof navigator.credentials?.create === "function"
    );
  },

  /** Returns true if platform authenticator (e.g., Touch ID, Windows Hello) is available. */
  async isPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  },

  /** Enroll a new passkey for the current user. */
  async enrollPasskey(deviceLabel?: string): Promise<PasskeyRecord> {
    if (!this.isSupported()) throw new Error("WebAuthn not supported on this device");

    // 1. Request server challenge + creation options
    const { data: opts, error: optsErr } = await supabase.functions.invoke("webauthn-challenge", {
      body: { action: "registration-options", deviceLabel },
    });
    if (optsErr || !opts?.options) throw new Error(optsErr?.message ?? "Failed to get options");

    // 2. Convert b64url-encoded fields to ArrayBuffers
    const publicKey: PublicKeyCredentialCreationOptions = {
      ...opts.options,
      challenge: b64UrlToBuf(opts.options.challenge),
      user: {
        ...opts.options.user,
        id: b64UrlToBuf(opts.options.user.id),
      },
      excludeCredentials: (opts.options.excludeCredentials ?? []).map((c: any) => ({
        ...c,
        id: b64UrlToBuf(c.id),
      })),
    };

    // 3. Run navigator.credentials.create ceremony
    const cred = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential | null;
    if (!cred) throw new Error("Passkey creation cancelled");

    const response = cred.response as AuthenticatorAttestationResponse;
    const attestation = {
      id: cred.id,
      rawId: bufToB64Url(cred.rawId),
      type: cred.type,
      response: {
        clientDataJSON: bufToB64Url(response.clientDataJSON),
        attestationObject: bufToB64Url(response.attestationObject),
        transports: response.getTransports?.() ?? [],
      },
    };

    // 4. Server-verify + persist
    const { data: verified, error: verErr } = await supabase.functions.invoke("webauthn-challenge", {
      body: { action: "registration-verify", attestation, deviceLabel },
    });
    if (verErr || !verified?.passkey) throw new Error(verErr?.message ?? "Verification failed");

    return verified.passkey as PasskeyRecord;
  },

  /** Authenticate current user via existing passkey (step-up assertion). */
  async assertPasskey(): Promise<{ verified: boolean; credentialId?: string }> {
    if (!this.isSupported()) throw new Error("WebAuthn not supported");

    const { data: opts, error: optsErr } = await supabase.functions.invoke("webauthn-challenge", {
      body: { action: "assertion-options" },
    });
    if (optsErr || !opts?.options) throw new Error(optsErr?.message ?? "No challenge");

    const publicKey: PublicKeyCredentialRequestOptions = {
      ...opts.options,
      challenge: b64UrlToBuf(opts.options.challenge),
      allowCredentials: (opts.options.allowCredentials ?? []).map((c: any) => ({
        ...c,
        id: b64UrlToBuf(c.id),
      })),
    };

    const cred = (await navigator.credentials.get({ publicKey })) as PublicKeyCredential | null;
    if (!cred) return { verified: false };

    const response = cred.response as AuthenticatorAssertionResponse;
    const assertion = {
      id: cred.id,
      rawId: bufToB64Url(cred.rawId),
      type: cred.type,
      response: {
        clientDataJSON: bufToB64Url(response.clientDataJSON),
        authenticatorData: bufToB64Url(response.authenticatorData),
        signature: bufToB64Url(response.signature),
        userHandle: response.userHandle ? bufToB64Url(response.userHandle) : null,
      },
    };

    const { data: verified, error: verErr } = await supabase.functions.invoke("webauthn-challenge", {
      body: { action: "assertion-verify", assertion },
    });
    if (verErr) throw new Error(verErr.message);
    return { verified: !!verified?.verified, credentialId: cred.id };
  },

  /** List the current user's enrolled passkeys. */
  async listPasskeys(): Promise<PasskeyRecord[]> {
    const { data, error } = await supabase
      .from("user_passkeys")
      .select("id, credential_id, device_label, transports, last_used_at, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      id: r.id,
      credentialId: r.credential_id,
      deviceLabel: r.device_label,
      transports: r.transports ?? [],
      lastUsedAt: r.last_used_at,
      createdAt: r.created_at,
    }));
  },

  /** Revoke (delete) a passkey by id. */
  async revokePasskey(passkeyId: string): Promise<boolean> {
    const { error } = await supabase.from("user_passkeys").delete().eq("id", passkeyId);
    return !error;
  },
};
