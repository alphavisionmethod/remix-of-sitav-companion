// ═══════════════════════════════════════════════════════════════
// SITA OS — secretsd: Secrets Management Daemon
// Encrypted storage, key hierarchy, opaque handles,
// service-scoped keyrings, TPM abstraction
// ═══════════════════════════════════════════════════════════════

import {
  type SecretType, type SecretMetadata, type Keyring, type SecretHandle,
  type KeyringScope, type IPCResult,
} from "./types";

// ── Crypto Engine (AES-256-GCM via Web Crypto) ──────────────

interface EncryptedBlob {
  ciphertext: string; // hex
  iv: string;         // hex
  tag: string;        // included in GCM ciphertext
  version: number;
}

async function generateDEK(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}

async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", key);
  return Array.from(new Uint8Array(raw)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function importKey(hex: string): Promise<CryptoKey> {
  const bytes = new Uint8Array(hex.match(/.{2}/g)!.map(h => parseInt(h, 16)));
  return crypto.subtle.importKey("raw", bytes, "AES-GCM", true, ["encrypt", "decrypt"]);
}

async function encrypt(plaintext: string, key: CryptoKey): Promise<EncryptedBlob> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plaintext));
  const ctHex = Array.from(new Uint8Array(ciphertext)).map(b => b.toString(16).padStart(2, "0")).join("");
  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, "0")).join("");
  return { ciphertext: ctHex, iv: ivHex, tag: "", version: 1 };
}

async function decrypt(blob: EncryptedBlob, key: CryptoKey): Promise<string> {
  const ct = new Uint8Array(blob.ciphertext.match(/.{2}/g)!.map(h => parseInt(h, 16)));
  const iv = new Uint8Array(blob.iv.match(/.{2}/g)!.map(h => parseInt(h, 16)));
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(plaintext);
}

// ── Key Hierarchy ───────────────────────────────────────────

interface KeyHierarchyState {
  masterKeyHex: string;
  kekByKeyring: Map<string, string>; // keyringId -> KEK hex
}

// ── SecretSD Service ────────────────────────────────────────

export class SecretsDaemon {
  private keyrings: Map<string, Keyring> = new Map();
  private secrets: Map<string, SecretMetadata> = new Map();
  private encryptedStore: Map<string, EncryptedBlob> = new Map(); // secretId -> encrypted data
  private keyHierarchy: KeyHierarchyState | null = null;
  private handles: Map<string, SecretHandle> = new Map();
  private dekCache: Map<string, string> = new Map(); // secretId -> DEK hex (wrapped)
  private accessLog: Array<{ timestamp: number; secretId: string; accessor: string; action: string; granted: boolean }> = [];
  private initialized = false;

  // ── Boot ────────────────────────────────────────────────

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Generate master key
    const masterKey = await generateDEK();
    const masterKeyHex = await exportKey(masterKey);
    this.keyHierarchy = { masterKeyHex, kekByKeyring: new Map() };

    // Create default keyrings
    await this.createKeyring("system", "system", "enhanced");
    await this.createKeyring("user-default", "user", "standard");
    await this.createKeyring("service-default", "service", "enhanced");
    await this.createKeyring("ephemeral", "ephemeral", "standard");

    this.initialized = true;
  }

  // ── Keyring Management ──────────────────────────────────

  async createKeyring(
    keyringId: string,
    scope: KeyringScope,
    protectionClass: "standard" | "enhanced" | "hardware"
  ): Promise<Keyring> {
    // Generate per-keyring KEK
    const kek = await generateDEK();
    const kekHex = await exportKey(kek);
    this.keyHierarchy!.kekByKeyring.set(keyringId, kekHex);

    const keyring: Keyring = {
      keyringId, scope, protectionClass,
      hardwareBacked: protectionClass === "hardware",
      createdAt: Date.now(),
      rotatedAt: Date.now(),
      secretCount: 0,
    };

    this.keyrings.set(keyringId, keyring);
    return keyring;
  }

  getKeyring(keyringId: string): Keyring | undefined {
    return this.keyrings.get(keyringId);
  }

  getAllKeyrings(): Keyring[] {
    return Array.from(this.keyrings.values());
  }

  // ── Secret CRUD ─────────────────────────────────────────

  async storeSecret(
    plaintext: string,
    type: SecretType,
    ownerScope: string,
    label: string,
    options?: {
      keyringId?: string;
      exportable?: boolean;
      accessPolicyId?: string;
    }
  ): Promise<IPCResult<SecretMetadata>> {
    const keyringId = options?.keyringId || this.defaultKeyringForScope(ownerScope);
    const keyring = this.keyrings.get(keyringId);
    if (!keyring) return { status: "error", error: "Keyring not found" };

    // Generate per-secret DEK
    const dek = await generateDEK();
    const dekHex = await exportKey(dek);

    // Encrypt the plaintext with DEK
    const blob = await encrypt(plaintext, dek);

    // Store encrypted DEK (wrapped with keyring KEK)
    const kekHex = this.keyHierarchy!.kekByKeyring.get(keyringId)!;
    const kek = await importKey(kekHex);
    const wrappedDek = await encrypt(dekHex, kek);

    const secretId = crypto.randomUUID();

    const metadata: SecretMetadata = {
      secretId, type, ownerScope, label, keyringId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      exportable: options?.exportable ?? false,
      hardwareBacked: keyring.hardwareBacked,
      accessPolicyId: options?.accessPolicyId,
      version: 1,
      revoked: false,
    };

    this.secrets.set(secretId, metadata);
    this.encryptedStore.set(secretId, blob);
    this.dekCache.set(secretId, JSON.stringify(wrappedDek));
    keyring.secretCount++;

    // Zeroize plaintext from memory (best effort in JS)
    plaintext = "";

    this.logAccess(secretId, ownerScope, "store", true);
    return { status: "ok", data: metadata };
  }

  async retrieveSecret(
    secretId: string,
    requesterService: string
  ): Promise<IPCResult<string>> {
    const metadata = this.secrets.get(secretId);
    if (!metadata) {
      this.logAccess(secretId, requesterService, "retrieve", false);
      return { status: "error", error: "Secret not found" };
    }
    if (metadata.revoked) {
      this.logAccess(secretId, requesterService, "retrieve", false);
      return { status: "denied", error: "Secret has been revoked" };
    }

    // Unwrap DEK
    const wrappedDekJson = this.dekCache.get(secretId);
    if (!wrappedDekJson) {
      return { status: "error", error: "DEK not found" };
    }

    const kekHex = this.keyHierarchy!.kekByKeyring.get(metadata.keyringId);
    if (!kekHex) return { status: "error", error: "Keyring KEK not found" };

    const kek = await importKey(kekHex);
    const wrappedDek: EncryptedBlob = JSON.parse(wrappedDekJson);
    const dekHex = await decrypt(wrappedDek, kek);
    const dek = await importKey(dekHex);

    // Decrypt secret
    const blob = this.encryptedStore.get(secretId);
    if (!blob) return { status: "error", error: "Encrypted data not found" };

    const plaintext = await decrypt(blob, dek);
    metadata.lastAccessedAt = Date.now();

    this.logAccess(secretId, requesterService, "retrieve", true);
    return { status: "ok", data: plaintext };
  }

  // ── Opaque Handle Pattern ───────────────────────────────

  issueHandle(
    secretId: string,
    authorizedService: string,
    ttlMs: number = 30000,
    singleUse: boolean = true
  ): IPCResult<SecretHandle> {
    const metadata = this.secrets.get(secretId);
    if (!metadata || metadata.revoked) {
      return { status: "error", error: "Secret not found or revoked" };
    }

    const handle: SecretHandle = {
      handleId: crypto.randomUUID(),
      secretId,
      issuedAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
      singleUse,
      consumed: false,
      authorizedService,
    };

    this.handles.set(handle.handleId, handle);
    return { status: "ok", data: handle };
  }

  async useHandle(handleId: string, callerService: string): Promise<IPCResult<string>> {
    const handle = this.handles.get(handleId);
    if (!handle) return { status: "error", error: "Handle not found" };
    if (handle.consumed) return { status: "denied", error: "Handle already consumed" };
    if (Date.now() > handle.expiresAt) {
      this.handles.delete(handleId);
      return { status: "denied", error: "Handle expired" };
    }
    if (handle.authorizedService !== callerService) {
      return { status: "denied", error: "Handle not authorized for this service" };
    }

    const result = await this.retrieveSecret(handle.secretId, callerService);

    if (handle.singleUse) {
      handle.consumed = true;
    }

    return result;
  }

  // ── Rotation & Revocation ───────────────────────────────

  async rotateSecret(secretId: string, newPlaintext: string): Promise<IPCResult<SecretMetadata>> {
    const metadata = this.secrets.get(secretId);
    if (!metadata) return { status: "error", error: "Secret not found" };

    // Re-encrypt with new DEK
    const dek = await generateDEK();
    const dekHex = await exportKey(dek);
    const blob = await encrypt(newPlaintext, dek);

    const kekHex = this.keyHierarchy!.kekByKeyring.get(metadata.keyringId)!;
    const kek = await importKey(kekHex);
    const wrappedDek = await encrypt(dekHex, kek);

    this.encryptedStore.set(secretId, blob);
    this.dekCache.set(secretId, JSON.stringify(wrappedDek));
    metadata.version++;
    metadata.updatedAt = Date.now();

    this.logAccess(secretId, metadata.ownerScope, "rotate", true);
    return { status: "ok", data: metadata };
  }

  revokeSecret(secretId: string, revokedBy: string): IPCResult {
    const metadata = this.secrets.get(secretId);
    if (!metadata) return { status: "error", error: "Secret not found" };

    metadata.revoked = true;
    metadata.updatedAt = Date.now();

    // Secure erase encrypted data
    this.encryptedStore.delete(secretId);
    this.dekCache.delete(secretId);

    // Invalidate handles
    for (const [hid, handle] of this.handles) {
      if (handle.secretId === secretId) {
        handle.consumed = true;
        this.handles.delete(hid);
      }
    }

    const keyring = this.keyrings.get(metadata.keyringId);
    if (keyring) keyring.secretCount = Math.max(0, keyring.secretCount - 1);

    this.logAccess(secretId, revokedBy, "revoke", true);
    return { status: "ok" };
  }

  // ── Query ───────────────────────────────────────────────

  getSecretMetadata(secretId: string): SecretMetadata | undefined {
    return this.secrets.get(secretId);
  }

  listSecrets(ownerScope?: string, type?: SecretType): SecretMetadata[] {
    let results = Array.from(this.secrets.values()).filter(s => !s.revoked);
    if (ownerScope) results = results.filter(s => s.ownerScope === ownerScope);
    if (type) results = results.filter(s => s.type === type);
    return results;
  }

  getAccessLog(limit = 100) {
    return this.accessLog.slice(-limit);
  }

  // ── Helpers ─────────────────────────────────────────────

  private defaultKeyringForScope(ownerScope: string): string {
    if (ownerScope === "system") return "system";
    if (ownerScope.startsWith("service:")) return "service-default";
    return "user-default";
  }

  private logAccess(secretId: string, accessor: string, action: string, granted: boolean) {
    this.accessLog.push({ timestamp: Date.now(), secretId, accessor, action, granted });
    if (this.accessLog.length > 5000) this.accessLog = this.accessLog.slice(-2500);
  }

  cleanupExpiredHandles(): number {
    const now = Date.now();
    let cleaned = 0;
    for (const [id, handle] of this.handles) {
      if (now > handle.expiresAt || handle.consumed) {
        this.handles.delete(id);
        cleaned++;
      }
    }
    return cleaned;
  }

  getStats() {
    return {
      totalKeyrings: this.keyrings.size,
      totalSecrets: this.secrets.size,
      activeHandles: Array.from(this.handles.values()).filter(h => !h.consumed && Date.now() < h.expiresAt).length,
      revokedSecrets: Array.from(this.secrets.values()).filter(s => s.revoked).length,
      hardwareBacked: this.keyHierarchy ? false : false, // TPM fallback
      tpmPresent: false, // Software-only mode
    };
  }
}

// ── Singleton ──────────────────────────────────────────────

let _secretsd: SecretsDaemon | null = null;
export function getSecretsDaemon(): SecretsDaemon {
  if (!_secretsd) _secretsd = new SecretsDaemon();
  return _secretsd;
}
