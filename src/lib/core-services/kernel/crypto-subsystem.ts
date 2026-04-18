// ═══════════════════════════════════════════════════════════════
// SITA OS — Security: Cryptographic Subsystem
// LUKS2 FDE, TPM 2.0 key sealing, key hierarchy, rotation
// ═══════════════════════════════════════════════════════════════

export type KeyPurpose = "master" | "volume" | "file" | "transport" | "signing" | "session";
export type KeyAlgorithm = "aes-256-xts" | "aes-256-gcm" | "chacha20-poly1305" | "ed25519" | "x25519" | "rsa-4096";
export type KeyState = "active" | "rotated" | "compromised" | "destroyed";

export interface CryptoKey {
  id: string;
  name: string;
  purpose: KeyPurpose;
  algorithm: KeyAlgorithm;
  state: KeyState;
  createdAt: number;
  rotatedAt: number | null;
  expiresAt: number;
  sealedToTPM: boolean;
  sealedToPCRs: string[];
  parentKeyId: string | null; // Key hierarchy
  derivationPath: string;
  rotationCount: number;
}

// ── LUKS2 Configuration ────────────────────────────────────────

export interface LUKS2Config {
  version: "2";
  cipher: "aes-xts-plain64";
  keySize: 512; // bits (256-bit XTS = 512-bit total)
  hashSpec: "sha256";
  kdf: {
    type: "argon2id";
    memory: number;  // KB
    time: number;     // iterations
    cpus: number;     // parallelism
  };
  keySlots: LUKS2KeySlot[];
  segments: LUKS2Segment[];
}

export interface LUKS2KeySlot {
  id: number;
  type: "luks2" | "tpm2";
  state: "active" | "inactive";
  keyMaterialHash: string;
  priority: "prefer" | "normal" | "ignore";
}

export interface LUKS2Segment {
  id: number;
  type: "crypt";
  offset: string;
  size: string;
  ivTweak: string;
  encryption: string;
}

// ── TPM 2.0 Sealing ───────────────────────────────────────────

export interface TPMSealedObject {
  id: string;
  keyId: string;
  pcrPolicy: string[]; // PCR values that must match to unseal
  authPolicy: string;
  sealedAt: number;
  unsealed: boolean;
  unsealAttempts: number;
  lastUnsealAt: number | null;
}

// ── TLS Configuration ──────────────────────────────────────────

export interface TLSConfig {
  minVersion: "1.3";
  cipherSuites: string[];
  certificatePinning: boolean;
  mTLS: boolean;
  ocspStapling: boolean;
}

// ── Crypto Subsystem ───────────────────────────────────────────

export class CryptoSubsystem {
  private keys = new Map<string, CryptoKey>();
  private sealedObjects = new Map<string, TPMSealedObject>();
  private luksConfig: LUKS2Config;
  private tlsConfig: TLSConfig;
  private rotationPolicyDays = 90;
  private _tpmAvailable: boolean;

  constructor(tpmAvailable = true) {
    this._tpmAvailable = tpmAvailable;

    // Initialize LUKS2 configuration
    this.luksConfig = {
      version: "2",
      cipher: "aes-xts-plain64",
      keySize: 512,
      hashSpec: "sha256",
      kdf: { type: "argon2id", memory: 1048576, time: 4, cpus: 4 },
      keySlots: [
        { id: 0, type: "luks2", state: "active", keyMaterialHash: "passphrase-slot", priority: "normal" },
        ...(tpmAvailable ? [{ id: 1, type: "tpm2" as const, state: "active" as const, keyMaterialHash: "tpm-sealed-slot", priority: "prefer" as const }] : []),
      ],
      segments: [{ id: 0, type: "crypt", offset: "16777216", size: "dynamic", ivTweak: "0", encryption: "aes-xts-plain64" }],
    };

    // TLS 1.3 configuration
    this.tlsConfig = {
      minVersion: "1.3",
      cipherSuites: [
        "TLS_AES_256_GCM_SHA384",
        "TLS_CHACHA20_POLY1305_SHA256",
        "TLS_AES_128_GCM_SHA256",
      ],
      certificatePinning: true,
      mTLS: true,
      ocspStapling: true,
    };

    // Create key hierarchy
    this.createKeyHierarchy();
  }

  // ── Key Hierarchy ────────────────────────────────────────────

  private createKeyHierarchy(): void {
    // Master Key (sealed to TPM)
    const masterKey = this.createKey("Master Key", "master", "aes-256-xts", {
      sealToTPM: this._tpmAvailable,
      pcrs: ["PCR0", "PCR1", "PCR4", "PCR8", "PCR9", "PCR10"],
      expiresInDays: 365,
    });

    // Volume Keys (derived from master)
    this.createKey("Root Volume Key", "volume", "aes-256-xts", {
      parentKeyId: masterKey.id, expiresInDays: 180,
    });
    this.createKey("Data Volume Key", "volume", "aes-256-xts", {
      parentKeyId: masterKey.id, expiresInDays: 180,
    });
    this.createKey("Swap Volume Key", "volume", "aes-256-xts", {
      parentKeyId: masterKey.id, expiresInDays: 180,
    });

    // Transport Keys
    this.createKey("Cloud Sync Transport Key", "transport", "aes-256-gcm", {
      parentKeyId: masterKey.id, expiresInDays: 90,
    });
    this.createKey("mTLS Client Key", "transport", "ed25519", {
      parentKeyId: masterKey.id, expiresInDays: 90,
    });

    // Signing Keys
    this.createKey("Receipt Signing Key", "signing", "ed25519", {
      parentKeyId: masterKey.id, expiresInDays: 365,
    });

    // Session Keys (ephemeral)
    this.createKey("Current Session Key", "session", "chacha20-poly1305", {
      parentKeyId: masterKey.id, expiresInDays: 1,
    });
  }

  // ── Key Management ───────────────────────────────────────────

  createKey(name: string, purpose: KeyPurpose, algorithm: KeyAlgorithm, opts?: {
    parentKeyId?: string;
    sealToTPM?: boolean;
    pcrs?: string[];
    expiresInDays?: number;
  }): CryptoKey {
    const key: CryptoKey = {
      id: `key-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name, purpose, algorithm,
      state: "active",
      createdAt: Date.now(),
      rotatedAt: null,
      expiresAt: Date.now() + (opts?.expiresInDays ?? this.rotationPolicyDays) * 86400000,
      sealedToTPM: opts?.sealToTPM ?? false,
      sealedToPCRs: opts?.pcrs ?? [],
      parentKeyId: opts?.parentKeyId ?? null,
      derivationPath: opts?.parentKeyId ? `${opts.parentKeyId}/${purpose}` : "root",
      rotationCount: 0,
    };
    this.keys.set(key.id, key);

    if (key.sealedToTPM) {
      this.sealToTPM(key.id, key.sealedToPCRs);
    }
    return key;
  }

  rotateKey(keyId: string): CryptoKey | null {
    const old = this.keys.get(keyId);
    if (!old) return null;

    old.state = "rotated";
    old.rotatedAt = Date.now();

    const newKey = this.createKey(
      old.name, old.purpose, old.algorithm,
      {
        parentKeyId: old.parentKeyId ?? undefined,
        sealToTPM: old.sealedToTPM,
        pcrs: old.sealedToPCRs,
        expiresInDays: this.rotationPolicyDays,
      }
    );
    newKey.rotationCount = old.rotationCount + 1;
    return newKey;
  }

  destroyKey(keyId: string): boolean {
    const key = this.keys.get(keyId);
    if (!key) return false;
    key.state = "destroyed";
    return true;
  }

  // ── TPM Sealing ──────────────────────────────────────────────

  sealToTPM(keyId: string, pcrPolicy: string[]): TPMSealedObject | null {
    if (!this._tpmAvailable) return null;
    const sealed: TPMSealedObject = {
      id: `tpm-seal-${keyId}`,
      keyId, pcrPolicy,
      authPolicy: "tpm2-policy-pcr",
      sealedAt: Date.now(),
      unsealed: false,
      unsealAttempts: 0,
      lastUnsealAt: null,
    };
    this.sealedObjects.set(sealed.id, sealed);
    return sealed;
  }

  unseal(sealedId: string, currentPCRs: Record<string, string>): { success: boolean; reason: string } {
    const sealed = this.sealedObjects.get(sealedId);
    if (!sealed) return { success: false, reason: "Sealed object not found" };

    sealed.unsealAttempts++;

    // Verify PCR policy (simulation — check all required PCRs are present)
    const pcrMatch = sealed.pcrPolicy.every(pcr => pcr in currentPCRs);
    if (!pcrMatch) {
      return { success: false, reason: "PCR policy mismatch — boot chain may have been modified" };
    }

    sealed.unsealed = true;
    sealed.lastUnsealAt = Date.now();
    return { success: true, reason: "Key unsealed successfully" };
  }

  // ── Key Rotation Check ───────────────────────────────────────

  getKeysNeedingRotation(): CryptoKey[] {
    const now = Date.now();
    return Array.from(this.keys.values()).filter(k =>
      k.state === "active" && now > k.expiresAt - 7 * 86400000 // 7 days before expiry
    );
  }

  // ── Queries ──────────────────────────────────────────────────

  getKey(id: string): CryptoKey | undefined { return this.keys.get(id); }
  getLUKSConfig(): LUKS2Config { return this.luksConfig; }
  getTLSConfig(): TLSConfig { return this.tlsConfig; }
  isTPMAvailable(): boolean { return this._tpmAvailable; }

  getStats() {
    const byPurpose: Record<string, number> = {};
    const byState: Record<string, number> = {};
    for (const k of this.keys.values()) {
      byPurpose[k.purpose] = (byPurpose[k.purpose] ?? 0) + 1;
      byState[k.state] = (byState[k.state] ?? 0) + 1;
    }
    return {
      totalKeys: this.keys.size,
      byPurpose, byState,
      sealedObjects: this.sealedObjects.size,
      tpmAvailable: this._tpmAvailable,
      keysNeedingRotation: this.getKeysNeedingRotation().length,
      fdeEnabled: true,
      fdeAlgorithm: this.luksConfig.cipher,
      tlsVersion: this.tlsConfig.minVersion,
    };
  }
}
