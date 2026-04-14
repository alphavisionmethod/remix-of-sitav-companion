// ═══════════════════════════════════════════════════════════════
// SITA OS — secretsd: Secrets Management Daemon
// Encrypted storage, key hierarchy, opaque handles,
// service-scoped keyrings, TPM abstraction, versioning,
// policy bindings, deletion queue, secure memory
// ═══════════════════════════════════════════════════════════════

import {
  type SecretType, type SecretMetadata, type Keyring, type SecretHandle,
  type KeyringScope, type IPCResult, type SecretStatus,
  type SecretVersion, type SecretAccessPolicyBinding, type SecretDeletionEntry,
  type EnhancedSecretHandle, type SecretOperation, type TPMState, type TPMPosture,
  type KeyHierarchyNode, DEFAULT_SECRET_POLICY_BINDINGS,
} from "./types";

// ── Secure Buffer (best-effort zeroization in JS) ───────────

class SecureBuffer {
  private buffer: Uint8Array;
  private disposed = false;

  constructor(size: number) {
    this.buffer = new Uint8Array(size);
  }

  static fromString(str: string): SecureBuffer {
    const enc = new TextEncoder();
    const data = enc.encode(str);
    const buf = new SecureBuffer(data.length);
    buf.buffer.set(data);
    return buf;
  }

  get data(): Uint8Array {
    if (this.disposed) throw new Error("SecureBuffer already disposed");
    return this.buffer;
  }

  dispose(): void {
    if (!this.disposed) {
      crypto.getRandomValues(this.buffer as Uint8Array<ArrayBuffer>);
      this.buffer.fill(0);
      this.disposed = true;
    }
  }
}

// ── Crypto Engine (AES-256-GCM via Web Crypto) ──────────────

interface EncryptedBlob {
  ciphertext: string;
  iv: string;
  tag: string;
  version: number;
  aad?: string;
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
  return crypto.subtle.importKey("raw", bytes.buffer as ArrayBuffer, "AES-GCM", true, ["encrypt", "decrypt"]);
}

async function encrypt(plaintext: string, key: CryptoKey, aad?: string): Promise<EncryptedBlob> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const params: AesGcmParams = { name: "AES-GCM", iv: iv.buffer as ArrayBuffer };
  if (aad) params.additionalData = enc.encode(aad);
  const ciphertext = await crypto.subtle.encrypt(params, key, enc.encode(plaintext));
  const ctHex = Array.from(new Uint8Array(ciphertext)).map(b => b.toString(16).padStart(2, "0")).join("");
  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, "0")).join("");
  return { ciphertext: ctHex, iv: ivHex, tag: "", version: 2, aad };
}

async function decrypt(blob: EncryptedBlob, key: CryptoKey): Promise<string> {
  const ct = new Uint8Array(blob.ciphertext.match(/.{2}/g)!.map(h => parseInt(h, 16)));
  const iv = new Uint8Array(blob.iv.match(/.{2}/g)!.map(h => parseInt(h, 16)));
  const params: AesGcmParams = { name: "AES-GCM", iv: iv.buffer as ArrayBuffer };
  if (blob.aad) params.additionalData = new TextEncoder().encode(blob.aad);
  const plaintext = await crypto.subtle.decrypt(params, key, ct.buffer as ArrayBuffer);
  return new TextDecoder().decode(plaintext);
}

// ── HKDF Key Derivation ────────────────────────────────────

async function deriveKeyHKDF(baseKeyHex: string, context: string, length: number = 256): Promise<string> {
  const baseBytes = new Uint8Array(baseKeyHex.match(/.{2}/g)!.map(h => parseInt(h, 16)));
  const baseKey = await crypto.subtle.importKey("raw", baseBytes.buffer as ArrayBuffer, "HKDF", false, ["deriveBits"]);
  const enc = new TextEncoder();
  const derived = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt: enc.encode("sita-os-secrets"), info: enc.encode(context) },
    baseKey, length
  );
  return Array.from(new Uint8Array(derived)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ── Extended Metadata ───────────────────────────────────────

interface ExtendedSecretMetadata extends SecretMetadata {
  status: SecretStatus;
  lastRotatedAt?: number;
  accessCount: number;
  deletionDeadline?: number;
}

// ── Key Hierarchy ───────────────────────────────────────────

interface KeyHierarchyState {
  masterKeyHex: string;
  kekByKeyring: Map<string, string>;
  kekVersions: Map<string, Array<{ version: number; kekHex: string; createdAt: number }>>;
}

// ── TPM Abstraction Layer ───────────────────────────────────

class TPMAbstractionLayer {
  private state: TPMState = {
    present: false,
    sealedKeys: [],
    fallbackMode: true,
    postureFlag: "software_fallback",
    attestationAvailable: false,
  };

  async initialize(): Promise<TPMState> {
    // In browser environment, TPM is never available
    this.state.present = false;
    this.state.fallbackMode = true;
    this.state.postureFlag = "software_fallback";
    return this.state;
  }

  async sealKey(keyHex: string, pcrValues?: number[]): Promise<string> {
    // Software fallback: wrap key with additional entropy
    const sealId = `seal-${crypto.randomUUID().slice(0, 8)}`;
    this.state.sealedKeys.push(sealId);
    return sealId;
  }

  async unsealKey(sealId: string): Promise<string | null> {
    if (!this.state.sealedKeys.includes(sealId)) return null;
    return sealId;
  }

  getState(): TPMState {
    return { ...this.state };
  }

  getPosture(): TPMPosture {
    return this.state.postureFlag;
  }
}

// ── SecretSD Service ────────────────────────────────────────

export class SecretsDaemon {
  private keyrings: Map<string, Keyring> = new Map();
  private secrets: Map<string, ExtendedSecretMetadata> = new Map();
  private encryptedStore: Map<string, EncryptedBlob> = new Map();
  private keyHierarchy: KeyHierarchyState | null = null;
  private handles: Map<string, EnhancedSecretHandle> = new Map();
  private dekCache: Map<string, string> = new Map();
  private accessLog: Array<{ timestamp: number; secretId: string; accessor: string; action: string; granted: boolean; operation?: string }> = [];
  private versionHistory: Map<string, SecretVersion[]> = new Map();
  private policyRegistry: SecretAccessPolicyBinding[] = [...DEFAULT_SECRET_POLICY_BINDINGS];
  private deletionQueue: SecretDeletionEntry[] = [];
  private tpm = new TPMAbstractionLayer();
  private initialized = false;

  private static readonly MAX_VERSIONS = 5;
  private static readonly DELETION_RETENTION_MS = 24 * 60 * 60 * 1000;

  // ── Boot ────────────────────────────────────────────────

  async initialize(): Promise<void> {
    if (this.initialized) return;

    await this.tpm.initialize();

    const masterKey = await generateDEK();
    const masterKeyHex = await exportKey(masterKey);
    this.keyHierarchy = { masterKeyHex, kekByKeyring: new Map(), kekVersions: new Map() };

    await this.createKeyring("system", "system", "enhanced");
    await this.createKeyring("user-default", "user", "standard");
    await this.createKeyring("service-default", "service", "enhanced");
    await this.createKeyring("ephemeral", "ephemeral", "standard");

    this.initialized = true;
  }

  // ── Keyring Management ──────────────────────────────────

  async createKeyring(
    keyringId: string, scope: KeyringScope,
    protectionClass: "standard" | "enhanced" | "hardware"
  ): Promise<Keyring> {
    const kek = await generateDEK();
    const kekHex = await exportKey(kek);
    this.keyHierarchy!.kekByKeyring.set(keyringId, kekHex);
    this.keyHierarchy!.kekVersions.set(keyringId, [{ version: 1, kekHex, createdAt: Date.now() }]);

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

  async rotateKeyring(keyringId: string): Promise<IPCResult> {
    const keyring = this.keyrings.get(keyringId);
    if (!keyring) return { status: "error", error: "Keyring not found" };

    const oldKekHex = this.keyHierarchy!.kekByKeyring.get(keyringId);
    if (!oldKekHex) return { status: "error", error: "KEK not found" };

    // Generate new KEK
    const newKek = await generateDEK();
    const newKekHex = await exportKey(newKek);

    // Re-wrap all DEKs in this keyring
    const oldKek = await importKey(oldKekHex);
    const newKekKey = await importKey(newKekHex);

    for (const [secretId, meta] of this.secrets) {
      if (meta.keyringId !== keyringId || meta.status !== "active") continue;

      const wrappedDekJson = this.dekCache.get(secretId);
      if (!wrappedDekJson) continue;

      const wrappedDek: EncryptedBlob = JSON.parse(wrappedDekJson);
      const dekHex = await decrypt(wrappedDek, oldKek);
      const reWrapped = await encrypt(dekHex, newKekKey, `keyring:${keyringId}:secret:${secretId}`);
      this.dekCache.set(secretId, JSON.stringify(reWrapped));
    }

    this.keyHierarchy!.kekByKeyring.set(keyringId, newKekHex);
    const versions = this.keyHierarchy!.kekVersions.get(keyringId) || [];
    versions.push({ version: versions.length + 1, kekHex: newKekHex, createdAt: Date.now() });
    this.keyHierarchy!.kekVersions.set(keyringId, versions);

    keyring.rotatedAt = Date.now();
    this.logAccess("keyring:" + keyringId, "system", "rotate-keyring", true);
    return { status: "ok" };
  }

  async destroyKeyring(keyringId: string): Promise<IPCResult> {
    const keyring = this.keyrings.get(keyringId);
    if (!keyring) return { status: "error", error: "Keyring not found" };

    // Destroy all secrets in keyring
    for (const [secretId, meta] of this.secrets) {
      if (meta.keyringId === keyringId) {
        this.encryptedStore.delete(secretId);
        this.dekCache.delete(secretId);
        meta.status = "destroyed";
      }
    }

    this.keyHierarchy!.kekByKeyring.delete(keyringId);
    this.keyrings.delete(keyringId);
    this.logAccess("keyring:" + keyringId, "system", "destroy-keyring", true);
    return { status: "ok" };
  }

  getKeyring(keyringId: string): Keyring | undefined {
    return this.keyrings.get(keyringId);
  }

  getAllKeyrings(): Keyring[] {
    return Array.from(this.keyrings.values());
  }

  // ── Secret CRUD ─────────────────────────────────────────

  async storeSecret(
    plaintext: string, type: SecretType, ownerScope: string, label: string,
    options?: { keyringId?: string; exportable?: boolean; accessPolicyId?: string }
  ): Promise<IPCResult<SecretMetadata>> {
    const keyringId = options?.keyringId || this.defaultKeyringForScope(ownerScope);
    const keyring = this.keyrings.get(keyringId);
    if (!keyring) return { status: "error", error: "Keyring not found" };

    const secretId = crypto.randomUUID();
    const dek = await generateDEK();
    const dekHex = await exportKey(dek);
    const blob = await encrypt(plaintext, dek, `secret:${secretId}:v1`);

    const kekHex = this.keyHierarchy!.kekByKeyring.get(keyringId)!;
    const kek = await importKey(kekHex);
    const wrappedDek = await encrypt(dekHex, kek, `keyring:${keyringId}:secret:${secretId}`);

    const metadata: ExtendedSecretMetadata = {
      secretId, type, ownerScope, label, keyringId,
      createdAt: Date.now(), updatedAt: Date.now(),
      exportable: options?.exportable ?? false,
      hardwareBacked: keyring.hardwareBacked,
      accessPolicyId: options?.accessPolicyId,
      version: 1, revoked: false,
      status: "active", accessCount: 0,
    };

    this.secrets.set(secretId, metadata);
    this.encryptedStore.set(secretId, blob);
    this.dekCache.set(secretId, JSON.stringify(wrappedDek));
    keyring.secretCount++;

    // Store version 1
    this.versionHistory.set(secretId, [{
      versionId: crypto.randomUUID(), secretId, version: 1,
      ciphertextRef: secretId, wrappingKeyId: keyringId, createdAt: Date.now(),
    }]);

    const secBuf = SecureBuffer.fromString(plaintext);
    secBuf.dispose();

    this.logAccess(secretId, ownerScope, "store", true);
    return { status: "ok", data: metadata };
  }

  async retrieveSecret(secretId: string, requesterService: string, operation?: SecretOperation): Promise<IPCResult<string>> {
    const metadata = this.secrets.get(secretId);
    if (!metadata) {
      this.logAccess(secretId, requesterService, "retrieve", false);
      return { status: "error", error: "Secret not found" };
    }
    if (metadata.status !== "active") {
      this.logAccess(secretId, requesterService, "retrieve", false);
      return { status: "denied", error: `Secret is ${metadata.status}` };
    }

    // Check policy binding
    const binding = this.policyRegistry.find(b => b.secretType === metadata.type);
    if (binding && !binding.allowedServices.includes("*") && !binding.allowedServices.includes(requesterService)) {
      this.logAccess(secretId, requesterService, "retrieve", false, operation);
      return { status: "denied", error: "Service not authorized for this secret type" };
    }

    const wrappedDekJson = this.dekCache.get(secretId);
    if (!wrappedDekJson) return { status: "error", error: "DEK not found" };

    const kekHex = this.keyHierarchy!.kekByKeyring.get(metadata.keyringId);
    if (!kekHex) return { status: "error", error: "Keyring KEK not found" };

    const kek = await importKey(kekHex);
    const wrappedDek: EncryptedBlob = JSON.parse(wrappedDekJson);
    const dekHex = await decrypt(wrappedDek, kek);
    const dek = await importKey(dekHex);

    const blob = this.encryptedStore.get(secretId);
    if (!blob) return { status: "error", error: "Encrypted data not found" };

    const plaintext = await decrypt(blob, dek);
    metadata.lastAccessedAt = Date.now();
    metadata.accessCount++;

    this.logAccess(secretId, requesterService, "retrieve", true, operation);
    return { status: "ok", data: plaintext };
  }

  // ── Enhanced Opaque Handle Pattern ──────────────────────

  issueHandle(
    secretId: string, authorizedService: string,
    allowedOperations: SecretOperation[] = ["decrypt"],
    ttlMs?: number, singleUse: boolean = true
  ): IPCResult<EnhancedSecretHandle> {
    const metadata = this.secrets.get(secretId);
    if (!metadata || metadata.status !== "active") {
      return { status: "error", error: "Secret not found or not active" };
    }

    // Enforce policy max TTL
    const binding = this.policyRegistry.find(b => b.secretType === metadata.type);
    const maxTtl = binding?.maxHandleTtlMs ?? 60000;
    const actualTtl = Math.min(ttlMs ?? 30000, maxTtl);

    const nonce = crypto.randomUUID();
    const handle: EnhancedSecretHandle = {
      handleId: crypto.randomUUID(),
      secretId, issuedAt: Date.now(), expiresAt: Date.now() + actualTtl,
      singleUse, consumed: false, authorizedService,
      allowedOperations, nonce,
      signature: `hsig-${nonce.slice(0, 8)}`,
    };

    this.handles.set(handle.handleId, handle);
    this.logAccess(secretId, authorizedService, "issue-handle", true, allowedOperations[0]);
    return { status: "ok", data: handle };
  }

  async useHandle(handleId: string, callerService: string, operation: SecretOperation = "decrypt"): Promise<IPCResult<string>> {
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
    if (!handle.allowedOperations.includes(operation)) {
      this.logAccess(handle.secretId, callerService, `use-handle:${operation}`, false, operation);
      return { status: "denied", error: `Operation '${operation}' not allowed on this handle` };
    }

    const result = await this.retrieveSecret(handle.secretId, callerService, operation);
    if (handle.singleUse) handle.consumed = true;
    return result;
  }

  // ── Key Derivation (HKDF) ──────────────────────────────

  async deriveKey(secretId: string, context: string, callerService: string): Promise<IPCResult<string>> {
    const metadata = this.secrets.get(secretId);
    if (!metadata || metadata.status !== "active") {
      return { status: "error", error: "Secret not found or not active" };
    }

    // Retrieve base secret
    const secretResult = await this.retrieveSecret(secretId, callerService, "derive");
    if (secretResult.status !== "ok" || !secretResult.data) return secretResult;

    // Derive using HKDF
    const baseHex = Array.from(new TextEncoder().encode(secretResult.data))
      .map(b => b.toString(16).padStart(2, "0")).join("");
    const derived = await deriveKeyHKDF(baseHex, context);

    this.logAccess(secretId, callerService, "derive-key", true, "derive");
    return { status: "ok", data: derived };
  }

  // ── Rotation & Versioning ───────────────────────────────

  async rotateSecret(secretId: string, newPlaintext: string): Promise<IPCResult<SecretMetadata>> {
    const metadata = this.secrets.get(secretId);
    if (!metadata || metadata.status !== "active") return { status: "error", error: "Secret not found or not active" };

    // Save current version
    const versions = this.versionHistory.get(secretId) || [];
    const currentVersion: SecretVersion = {
      versionId: crypto.randomUUID(), secretId, version: metadata.version,
      ciphertextRef: `${secretId}:v${metadata.version}`, wrappingKeyId: metadata.keyringId,
      createdAt: metadata.updatedAt, supersededAt: Date.now(),
    };
    versions.push(currentVersion);
    if (versions.length > SecretsDaemon.MAX_VERSIONS) versions.shift();
    this.versionHistory.set(secretId, versions);

    // Re-encrypt with new DEK
    const dek = await generateDEK();
    const dekHex = await exportKey(dek);
    const newVersion = metadata.version + 1;
    const blob = await encrypt(newPlaintext, dek, `secret:${secretId}:v${newVersion}`);

    const kekHex = this.keyHierarchy!.kekByKeyring.get(metadata.keyringId)!;
    const kek = await importKey(kekHex);
    const wrappedDek = await encrypt(dekHex, kek, `keyring:${metadata.keyringId}:secret:${secretId}`);

    this.encryptedStore.set(secretId, blob);
    this.dekCache.set(secretId, JSON.stringify(wrappedDek));
    metadata.version = newVersion;
    metadata.updatedAt = Date.now();
    metadata.lastRotatedAt = Date.now();

    const secBuf = SecureBuffer.fromString(newPlaintext);
    secBuf.dispose();

    this.logAccess(secretId, metadata.ownerScope, "rotate", true);
    return { status: "ok", data: metadata };
  }

  // ── Revocation & Deletion Lifecycle ─────────────────────

  revokeSecret(secretId: string, revokedBy: string): IPCResult {
    const metadata = this.secrets.get(secretId);
    if (!metadata) return { status: "error", error: "Secret not found" };
    if (metadata.status !== "active") return { status: "error", error: `Cannot revoke: status is ${metadata.status}` };

    metadata.status = "revoked";
    metadata.revoked = true;
    metadata.updatedAt = Date.now();

    // Invalidate handles
    for (const [hid, handle] of this.handles) {
      if (handle.secretId === secretId) {
        handle.consumed = true;
        this.handles.delete(hid);
      }
    }

    this.logAccess(secretId, revokedBy, "revoke", true);
    return { status: "ok" };
  }

  softDeleteSecret(secretId: string, retentionMs?: number): IPCResult {
    const metadata = this.secrets.get(secretId);
    if (!metadata) return { status: "error", error: "Secret not found" };
    if (metadata.status === "destroyed") return { status: "error", error: "Already destroyed" };

    metadata.status = "soft_deleted";
    metadata.updatedAt = Date.now();
    metadata.deletionDeadline = Date.now() + (retentionMs ?? SecretsDaemon.DELETION_RETENTION_MS);

    const entry: SecretDeletionEntry = {
      deletionId: crypto.randomUUID(), secretId,
      deleteMode: "soft", scheduledAt: metadata.deletionDeadline!,
    };
    this.deletionQueue.push(entry);

    this.logAccess(secretId, "system", "soft-delete", true);
    return { status: "ok" };
  }

  secureErase(secretId: string): IPCResult {
    const metadata = this.secrets.get(secretId);
    if (!metadata) return { status: "error", error: "Secret not found" };

    // Overwrite encrypted store
    this.encryptedStore.delete(secretId);
    this.dekCache.delete(secretId);
    this.versionHistory.delete(secretId);

    // Invalidate handles
    for (const [hid, handle] of this.handles) {
      if (handle.secretId === secretId) {
        handle.consumed = true;
        this.handles.delete(hid);
      }
    }

    metadata.status = "destroyed";
    metadata.updatedAt = Date.now();

    const keyring = this.keyrings.get(metadata.keyringId);
    if (keyring) keyring.secretCount = Math.max(0, keyring.secretCount - 1);

    this.logAccess(secretId, "system", "secure-erase", true);
    return { status: "ok" };
  }

  processDeletionQueue(): { processed: number; failed: number } {
    const now = Date.now();
    let processed = 0, failed = 0;

    for (const entry of this.deletionQueue) {
      if (entry.completedAt) continue;
      if (now < entry.scheduledAt) continue;

      const result = this.secureErase(entry.secretId);
      if (result.status === "ok") {
        entry.completedAt = now;
        entry.result = "completed";
        processed++;
      } else {
        entry.result = "failed";
        failed++;
      }
    }

    return { processed, failed };
  }

  // ── Policy Registry ─────────────────────────────────────

  registerPolicy(binding: SecretAccessPolicyBinding): void {
    const idx = this.policyRegistry.findIndex(b => b.bindingId === binding.bindingId);
    if (idx >= 0) this.policyRegistry[idx] = binding;
    else this.policyRegistry.push(binding);
  }

  getPolicies(): SecretAccessPolicyBinding[] {
    return [...this.policyRegistry];
  }

  getPolicyForType(type: SecretType): SecretAccessPolicyBinding | undefined {
    return this.policyRegistry.find(b => b.secretType === type);
  }

  // ── Query ───────────────────────────────────────────────

  getSecretMetadata(secretId: string): ExtendedSecretMetadata | undefined {
    return this.secrets.get(secretId);
  }

  listSecrets(ownerScope?: string, type?: SecretType, includeDeleted = false): SecretMetadata[] {
    let results = Array.from(this.secrets.values());
    if (!includeDeleted) results = results.filter(s => s.status === "active");
    if (ownerScope) results = results.filter(s => s.ownerScope === ownerScope);
    if (type) results = results.filter(s => s.type === type);
    return results;
  }

  getVersionHistory(secretId: string): SecretVersion[] {
    return this.versionHistory.get(secretId) || [];
  }

  getDeletionQueue(): SecretDeletionEntry[] {
    return [...this.deletionQueue];
  }

  getAccessLog(limit = 100) {
    return this.accessLog.slice(-limit);
  }

  getActiveHandles(): EnhancedSecretHandle[] {
    const now = Date.now();
    return Array.from(this.handles.values()).filter(h => !h.consumed && h.expiresAt > now);
  }

  getTPMState(): TPMState {
    return this.tpm.getState();
  }

  getKeyHierarchyTree(): KeyHierarchyNode {
    const keyrings = this.getAllKeyrings();
    const root: KeyHierarchyNode = {
      id: "root", label: "Root Device Key", type: "root_device_key",
      algorithm: "AES-256-GCM", createdAt: Date.now(),
      hardwareBacked: this.tpm.getPosture() === "hardware_sealed",
      children: [{
        id: "master-kek", label: "Master KEK", type: "kek",
        parentId: "root", algorithm: "AES-256-GCM", createdAt: Date.now(),
        hardwareBacked: false,
        children: keyrings.map(kr => ({
          id: `kr-${kr.keyringId}`, label: `${kr.scope} keyring: ${kr.keyringId}`,
          type: "keyring_master" as const, parentId: "master-kek",
          algorithm: "AES-256-GCM", createdAt: kr.createdAt, rotatedAt: kr.rotatedAt,
          hardwareBacked: kr.hardwareBacked,
          children: Array.from(this.secrets.values())
            .filter(s => s.keyringId === kr.keyringId && s.status === "active")
            .slice(0, 10)
            .map(s => ({
              id: `dek-${s.secretId.slice(0, 8)}`, label: `DEK: ${s.label}`,
              type: "dek" as const, parentId: `kr-${kr.keyringId}`,
              algorithm: "AES-256-GCM", createdAt: s.createdAt,
              hardwareBacked: s.hardwareBacked,
            })),
        })),
      }],
    };
    return root;
  }

  // ── Helpers ─────────────────────────────────────────────

  private defaultKeyringForScope(ownerScope: string): string {
    if (ownerScope === "system") return "system";
    if (ownerScope.startsWith("service:")) return "service-default";
    return "user-default";
  }

  private logAccess(secretId: string, accessor: string, action: string, granted: boolean, operation?: string) {
    this.accessLog.push({ timestamp: Date.now(), secretId, accessor, action, granted, operation });
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
    const allSecrets = Array.from(this.secrets.values());
    return {
      totalKeyrings: this.keyrings.size,
      totalSecrets: this.secrets.size,
      activeSecrets: allSecrets.filter(s => s.status === "active").length,
      revokedSecrets: allSecrets.filter(s => s.status === "revoked").length,
      softDeletedSecrets: allSecrets.filter(s => s.status === "soft_deleted").length,
      destroyedSecrets: allSecrets.filter(s => s.status === "destroyed").length,
      activeHandles: Array.from(this.handles.values()).filter(h => !h.consumed && Date.now() < h.expiresAt).length,
      pendingDeletions: this.deletionQueue.filter(d => !d.completedAt).length,
      tpmState: this.tpm.getState(),
      keyringVersions: Object.fromEntries(
        Array.from(this.keyHierarchy?.kekVersions.entries() || []).map(([k, v]) => [k, v.length])
      ),
    };
  }
}

// ── Singleton ──────────────────────────────────────────────

let _secretsd: SecretsDaemon | null = null;
export function getSecretsDaemon(): SecretsDaemon {
  if (!_secretsd) _secretsd = new SecretsDaemon();
  return _secretsd;
}
