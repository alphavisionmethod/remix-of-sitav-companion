// ═══════════════════════════════════════════════════════════════
// SITA OS — Security: Code Signing & Verification
// Ed25519/RSA-4096, boot chain verification, CRL, enforce modes
// ═══════════════════════════════════════════════════════════════

export type SignatureAlgorithm = "ed25519" | "rsa-4096" | "ecdsa-p256";
export type VerificationMode = "enforced" | "permissive" | "disabled";
export type VerificationResult = "valid" | "invalid" | "expired" | "revoked" | "unsigned" | "unknown-signer";

export interface SigningKey {
  id: string;
  name: string;
  algorithm: SignatureAlgorithm;
  publicKeyHash: string;
  issuer: string;
  validFrom: number;
  validUntil: number;
  revoked: boolean;
  purpose: "kernel" | "driver" | "application" | "initramfs" | "boot" | "ota";
}

export interface CodeSignature {
  binaryHash: string;
  signatureData: string;
  signerKeyId: string;
  algorithm: SignatureAlgorithm;
  signedAt: number;
  includesMetadata: boolean;
  chainDepth: number; // How many signers in the certificate chain
}

export interface VerificationRecord {
  id: string;
  binaryPath: string;
  signature: CodeSignature | null;
  result: VerificationResult;
  verifiedAt: number;
  keyUsed: string | null;
  chainValid: boolean;
  details: string;
}

// ── Boot Chain Verification ────────────────────────────────────

export interface BootChainStage {
  name: string;
  order: number;
  binaryHash: string;
  signatureValid: boolean;
  signerKeyId: string;
  pcrExtended: string[];
  verifiedAt: number;
}

export interface BootChainAttestation {
  id: string;
  stages: BootChainStage[];
  allValid: boolean;
  tpmPresent: boolean;
  secureBootEnabled: boolean;
  trustBaseline: "full" | "reduced" | "software-only";
  attestedAt: number;
}

// ── CRL (Certificate Revocation List) ──────────────────────────

export interface CRLEntry {
  keyId: string;
  revokedAt: number;
  reason: "compromised" | "superseded" | "cease-of-operation" | "affiliation-changed";
}

// ── Code Verification Service ──────────────────────────────────

export class CodeVerificationService {
  private trustedKeys = new Map<string, SigningKey>();
  private crl: CRLEntry[] = [];
  private verificationLog: VerificationRecord[] = [];
  private mode: VerificationMode = "enforced";
  private bootChain: BootChainAttestation | null = null;

  constructor() {
    // Register built-in trusted keys
    this.registerKey({
      id: "key-sita-kernel", name: "SITA OS Kernel Signing Key",
      algorithm: "ed25519", publicKeyHash: "sha256:sita-kernel-pub-001",
      issuer: "SITA OS Root CA", validFrom: Date.now() - 86400000, validUntil: Date.now() + 365 * 86400000,
      revoked: false, purpose: "kernel",
    });
    this.registerKey({
      id: "key-sita-app", name: "SITA OS Application Signing Key",
      algorithm: "ed25519", publicKeyHash: "sha256:sita-app-pub-001",
      issuer: "SITA OS Root CA", validFrom: Date.now() - 86400000, validUntil: Date.now() + 365 * 86400000,
      revoked: false, purpose: "application",
    });
    this.registerKey({
      id: "key-canonical", name: "Canonical UEFI CA",
      algorithm: "rsa-4096", publicKeyHash: "sha256:canonical-uefi-001",
      issuer: "Canonical Ltd", validFrom: Date.now() - 86400000, validUntil: Date.now() + 730 * 86400000,
      revoked: false, purpose: "boot",
    });
    this.registerKey({
      id: "key-sita-initramfs", name: "SITA OS Initramfs Signing Key",
      algorithm: "ed25519", publicKeyHash: "sha256:sita-initramfs-001",
      issuer: "SITA OS Root CA", validFrom: Date.now() - 86400000, validUntil: Date.now() + 365 * 86400000,
      revoked: false, purpose: "initramfs",
    });
    this.registerKey({
      id: "key-sita-driver", name: "SITA OS Driver Signing Key",
      algorithm: "ecdsa-p256", publicKeyHash: "sha256:sita-driver-001",
      issuer: "SITA OS Root CA", validFrom: Date.now() - 86400000, validUntil: Date.now() + 365 * 86400000,
      revoked: false, purpose: "driver",
    });
    this.registerKey({
      id: "key-sita-ota", name: "SITA OS OTA Signing Key",
      algorithm: "ed25519", publicKeyHash: "sha256:sita-ota-001",
      issuer: "SITA OS Root CA", validFrom: Date.now() - 86400000, validUntil: Date.now() + 365 * 86400000,
      revoked: false, purpose: "ota",
    });
  }

  // ── Key Management ───────────────────────────────────────────

  registerKey(key: SigningKey): void {
    this.trustedKeys.set(key.id, key);
  }

  revokeKey(keyId: string, reason: CRLEntry["reason"]): boolean {
    const key = this.trustedKeys.get(keyId);
    if (!key) return false;
    key.revoked = true;
    this.crl.push({ keyId, revokedAt: Date.now(), reason });
    return true;
  }

  // ── Verification ─────────────────────────────────────────────

  verify(binaryPath: string, signature: CodeSignature | null): VerificationRecord {
    const record: VerificationRecord = {
      id: `vr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      binaryPath,
      signature,
      result: "valid",
      verifiedAt: Date.now(),
      keyUsed: null,
      chainValid: false,
      details: "",
    };

    if (!signature) {
      record.result = "unsigned";
      record.details = this.mode === "enforced" ? "Unsigned binary — execution blocked" : "Unsigned binary — warning logged";
      this.verificationLog.push(record);
      return record;
    }

    // Check signer key
    const key = this.trustedKeys.get(signature.signerKeyId);
    if (!key) {
      record.result = "unknown-signer";
      record.details = `Unknown signing key: ${signature.signerKeyId}`;
      this.verificationLog.push(record);
      return record;
    }

    record.keyUsed = key.id;

    // Check CRL
    if (key.revoked || this.crl.some(c => c.keyId === key.id)) {
      record.result = "revoked";
      record.details = `Signing key ${key.name} has been revoked`;
      this.verificationLog.push(record);
      return record;
    }

    // Check expiry
    const now = Date.now();
    if (now < key.validFrom || now > key.validUntil) {
      record.result = "expired";
      record.details = `Signing key ${key.name} is outside validity period`;
      this.verificationLog.push(record);
      return record;
    }

    // Simulate signature verification (in production: actual crypto)
    record.result = "valid";
    record.chainValid = true;
    record.details = `Verified by ${key.name} (${key.algorithm})`;
    this.verificationLog.push(record);
    return record;
  }

  shouldAllowExecution(result: VerificationResult): boolean {
    if (this.mode === "disabled") return true;
    if (this.mode === "permissive") return true; // Log but allow
    // Enforced: only valid signatures pass
    return result === "valid";
  }

  // ── Boot Chain ───────────────────────────────────────────────

  constructBootChain(tpmPresent: boolean, secureBootEnabled: boolean): BootChainAttestation {
    const stages: BootChainStage[] = [
      { name: "UEFI Firmware", order: 0, binaryHash: "measured-pcr0", signatureValid: true, signerKeyId: "oem", pcrExtended: ["PCR0", "PCR1"], verifiedAt: Date.now() },
      { name: "Shim", order: 1, binaryHash: "measured-pcr4", signatureValid: secureBootEnabled, signerKeyId: "key-canonical", pcrExtended: ["PCR4"], verifiedAt: Date.now() },
      { name: "systemd-boot", order: 2, binaryHash: "measured-pcr4", signatureValid: secureBootEnabled, signerKeyId: "key-canonical", pcrExtended: ["PCR4"], verifiedAt: Date.now() },
      { name: "Linux Kernel", order: 3, binaryHash: "measured-pcr8", signatureValid: true, signerKeyId: "key-sita-kernel", pcrExtended: ["PCR8"], verifiedAt: Date.now() },
      { name: "Initramfs", order: 4, binaryHash: "measured-pcr9", signatureValid: true, signerKeyId: "key-sita-initramfs", pcrExtended: ["PCR9"], verifiedAt: Date.now() },
      { name: "dm-verity Root", order: 5, binaryHash: "measured-pcr10", signatureValid: true, signerKeyId: "key-sita-kernel", pcrExtended: ["PCR10"], verifiedAt: Date.now() },
      { name: "sita-runtime", order: 6, binaryHash: "runtime-hash", signatureValid: true, signerKeyId: "key-sita-kernel", pcrExtended: [], verifiedAt: Date.now() },
    ];

    const allValid = stages.every(s => s.signatureValid);
    let trustBaseline: BootChainAttestation["trustBaseline"] = "full";
    if (!tpmPresent) trustBaseline = "software-only";
    else if (!secureBootEnabled || !allValid) trustBaseline = "reduced";

    this.bootChain = {
      id: `boot-${Date.now()}`,
      stages,
      allValid,
      tpmPresent,
      secureBootEnabled,
      trustBaseline,
      attestedAt: Date.now(),
    };
    return this.bootChain;
  }

  getBootChain(): BootChainAttestation | null { return this.bootChain; }

  // ── Mode ─────────────────────────────────────────────────────

  setMode(mode: VerificationMode): void { this.mode = mode; }
  getMode(): VerificationMode { return this.mode; }

  // ── Queries ──────────────────────────────────────────────────

  getVerificationLog(): VerificationRecord[] { return [...this.verificationLog]; }
  getTrustedKeys(): SigningKey[] { return Array.from(this.trustedKeys.values()); }
  getCRL(): CRLEntry[] { return [...this.crl]; }

  getStats() {
    const byResult: Record<string, number> = {};
    for (const r of this.verificationLog) {
      byResult[r.result] = (byResult[r.result] ?? 0) + 1;
    }
    return {
      mode: this.mode,
      trustedKeys: this.trustedKeys.size,
      revokedKeys: this.crl.length,
      verificationsPerformed: this.verificationLog.length,
      byResult,
      bootChainValid: this.bootChain?.allValid ?? null,
      trustBaseline: this.bootChain?.trustBaseline ?? null,
    };
  }
}
