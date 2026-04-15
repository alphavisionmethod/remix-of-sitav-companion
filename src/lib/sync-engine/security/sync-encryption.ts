// ═══════════════════════════════════════════════════════════════
// SITA OS — Sync Encryption Engine
// Multi-class encryption for distributed sync objects
// ═══════════════════════════════════════════════════════════════

import type { EncryptionClass } from "../sync-object-model";

/** Key derivation hierarchy level */
export type KeyLevel = "master" | "device" | "namespace" | "object";

/** Encryption key metadata */
export interface EncryptionKeyMeta {
  keyId: string;
  level: KeyLevel;
  algorithm: "AES-256-GCM" | "ChaCha20-Poly1305" | "AES-256-CBC";
  createdAt: string;
  rotatedAt?: string;
  expiresAt?: string;
  deviceId?: string;
  namespace?: string;
  status: "active" | "rotated" | "revoked" | "expired";
}

/** Encrypted payload wrapper */
export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  tag: string;
  keyId: string;
  algorithm: string;
  encryptionClass: EncryptionClass;
}

/** Key rotation event */
export interface KeyRotationEvent {
  oldKeyId: string;
  newKeyId: string;
  level: KeyLevel;
  rotatedAt: string;
  reason: "scheduled" | "manual" | "compromise" | "device-revoked";
  affectedObjects: number;
}

/** Recovery key for account recovery */
export interface RecoveryKeyInfo {
  recoveryKeyHash: string;
  createdAt: string;
  lastVerifiedAt?: string;
  usageCount: number;
}

class SyncEncryptionEngine {
  private keys = new Map<string, EncryptionKeyMeta>();
  private keyHierarchy = new Map<string, string>(); // childKeyId -> parentKeyId
  private rotationHistory: KeyRotationEvent[] = [];
  private recoveryKey: RecoveryKeyInfo | null = null;

  // ─── Key Management ─────────────────────────

  /** Generate a new encryption key */
  generateKey(level: KeyLevel, opts?: { deviceId?: string; namespace?: string }): EncryptionKeyMeta {
    const keyId = `key_${level}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const key: EncryptionKeyMeta = {
      keyId,
      level,
      algorithm: "AES-256-GCM",
      createdAt: new Date().toISOString(),
      deviceId: opts?.deviceId,
      namespace: opts?.namespace,
      status: "active",
    };
    this.keys.set(keyId, key);
    return key;
  }

  /** Derive a child key from a parent key */
  deriveKey(parentKeyId: string, level: KeyLevel, opts?: { deviceId?: string; namespace?: string }): EncryptionKeyMeta {
    const parent = this.keys.get(parentKeyId);
    if (!parent) throw new Error(`Parent key ${parentKeyId} not found`);

    const child = this.generateKey(level, opts);
    this.keyHierarchy.set(child.keyId, parentKeyId);
    return child;
  }

  /** Get the active key for a given level and scope */
  getActiveKey(level: KeyLevel, opts?: { deviceId?: string; namespace?: string }): EncryptionKeyMeta | undefined {
    return Array.from(this.keys.values()).find(k =>
      k.level === level &&
      k.status === "active" &&
      (!opts?.deviceId || k.deviceId === opts.deviceId) &&
      (!opts?.namespace || k.namespace === opts.namespace)
    );
  }

  /** Rotate a key — creates new key and marks old as rotated */
  rotateKey(oldKeyId: string, reason: KeyRotationEvent["reason"] = "scheduled"): EncryptionKeyMeta {
    const oldKey = this.keys.get(oldKeyId);
    if (!oldKey) throw new Error(`Key ${oldKeyId} not found`);

    oldKey.status = "rotated";
    oldKey.rotatedAt = new Date().toISOString();

    const newKey = this.generateKey(oldKey.level, {
      deviceId: oldKey.deviceId,
      namespace: oldKey.namespace,
    });

    // Preserve hierarchy
    const parent = this.keyHierarchy.get(oldKeyId);
    if (parent) this.keyHierarchy.set(newKey.keyId, parent);

    this.rotationHistory.push({
      oldKeyId,
      newKeyId: newKey.keyId,
      level: oldKey.level,
      rotatedAt: new Date().toISOString(),
      reason,
      affectedObjects: 0,
    });

    return newKey;
  }

  /** Revoke a key (e.g., device compromise) */
  revokeKey(keyId: string): void {
    const key = this.keys.get(keyId);
    if (key) {
      key.status = "revoked";
      // Also revoke all child keys
      for (const [childId, parentId] of this.keyHierarchy) {
        if (parentId === keyId) this.revokeKey(childId);
      }
    }
  }

  // ─── Encryption Operations ──────────────────

  /** Encrypt data based on encryption class */
  encrypt(data: unknown, encryptionClass: EncryptionClass, opts?: { deviceId?: string; namespace?: string }): EncryptedPayload | null {
    if (encryptionClass === "non-syncable") return null;
    if (encryptionClass === "standard") {
      // Standard: server-visible, no encryption needed for sync
      return {
        ciphertext: btoa(JSON.stringify(data)),
        iv: "",
        tag: "",
        keyId: "none",
        algorithm: "none",
        encryptionClass,
      };
    }

    // For encrypted classes, use appropriate key
    const keyLevel: KeyLevel = encryptionClass === "device-bound" ? "device" : "namespace";
    let key = this.getActiveKey(keyLevel, opts);
    if (!key) {
      key = this.generateKey(keyLevel, opts);
    }

    // Simulated encryption (in production, use Web Crypto API)
    const plaintext = JSON.stringify(data);
    const iv = this.generateIV();

    return {
      ciphertext: btoa(plaintext), // Simulated — real impl uses AES-GCM
      iv,
      tag: this.generateTag(plaintext, iv),
      keyId: key.keyId,
      algorithm: key.algorithm,
      encryptionClass,
    };
  }

  /** Decrypt an encrypted payload */
  decrypt(payload: EncryptedPayload): unknown {
    if (payload.encryptionClass === "standard" || payload.algorithm === "none") {
      return JSON.parse(atob(payload.ciphertext));
    }

    const key = this.keys.get(payload.keyId);
    if (!key || key.status === "revoked") {
      throw new Error(`Key ${payload.keyId} unavailable or revoked`);
    }

    // Simulated decryption
    return JSON.parse(atob(payload.ciphertext));
  }

  /** Check if an encryption class requires E2EE */
  requiresE2EE(encryptionClass: EncryptionClass): boolean {
    return encryptionClass === "e2ee" || encryptionClass === "device-bound";
  }

  /** Check if data can be synced given its encryption class */
  canSync(encryptionClass: EncryptionClass): boolean {
    return encryptionClass !== "non-syncable";
  }

  /** Check if server can read the data */
  isServerVisible(encryptionClass: EncryptionClass): boolean {
    return encryptionClass === "standard";
  }

  // ─── Recovery ───────────────────────────────

  /** Generate a recovery key for account recovery */
  generateRecoveryKey(): string {
    const recoveryKey = Array.from({ length: 6 }, () =>
      Math.random().toString(36).slice(2, 6).toUpperCase()
    ).join("-");

    this.recoveryKey = {
      recoveryKeyHash: this.hashRecoveryKey(recoveryKey),
      createdAt: new Date().toISOString(),
      usageCount: 0,
    };

    return recoveryKey;
  }

  /** Verify a recovery key */
  verifyRecoveryKey(key: string): boolean {
    if (!this.recoveryKey) return false;
    const hash = this.hashRecoveryKey(key);
    const valid = hash === this.recoveryKey.recoveryKeyHash;
    if (valid) {
      this.recoveryKey.lastVerifiedAt = new Date().toISOString();
      this.recoveryKey.usageCount++;
    }
    return valid;
  }

  /** Get recovery key info (without the actual key) */
  getRecoveryKeyInfo(): RecoveryKeyInfo | null {
    return this.recoveryKey ? { ...this.recoveryKey } : null;
  }

  // ─── Status & Monitoring ────────────────────

  /** Get all keys */
  getAllKeys(): EncryptionKeyMeta[] {
    return Array.from(this.keys.values());
  }

  /** Get active keys only */
  getActiveKeys(): EncryptionKeyMeta[] {
    return this.getAllKeys().filter(k => k.status === "active");
  }

  /** Get key rotation history */
  getRotationHistory(): KeyRotationEvent[] {
    return [...this.rotationHistory];
  }

  /** Get encryption status by namespace */
  getNamespaceEncryptionStatus(): Array<{ namespace: string; keyId: string; algorithm: string; status: string }> {
    return this.getAllKeys()
      .filter(k => k.namespace)
      .map(k => ({
        namespace: k.namespace!,
        keyId: k.keyId,
        algorithm: k.algorithm,
        status: k.status,
      }));
  }

  /** Get key hierarchy as a tree */
  getKeyHierarchy(): Array<{ keyId: string; parentKeyId?: string; level: KeyLevel }> {
    return this.getAllKeys().map(k => ({
      keyId: k.keyId,
      parentKeyId: this.keyHierarchy.get(k.keyId),
      level: k.level,
    }));
  }

  // ─── Internal ───────────────────────────────

  private generateIV(): string {
    return Array.from({ length: 12 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join("");
  }

  private generateTag(plaintext: string, iv: string): string {
    let hash = 0;
    const combined = plaintext + iv;
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) - hash) + combined.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(8, "0");
  }

  private hashRecoveryKey(key: string): string {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
      hash |= 0;
    }
    return `rk_${Math.abs(hash).toString(16)}`;
  }
}

/** Singleton encryption engine */
export const syncEncryption = new SyncEncryptionEngine();
