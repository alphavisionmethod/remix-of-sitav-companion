// ═══════════════════════════════════════════════════════════════
// SITA OS — Device Attestation Service
// Device trust enrollment, boot integrity verification,
// remote attestation, device revocation, trust-state binding
// ═══════════════════════════════════════════════════════════════

import type { DeviceTrustLevel } from "@/packages/contracts/graph/device-attestation";

// ── Types ──────────────────────────────────────────────────────

export interface DeviceEnrollment {
  deviceId: string;
  userId: string;
  displayName: string;
  platform: DevicePlatform;
  enrolledAt: string;
  trustLevel: DeviceTrustLevel;
  fingerprint: string;
  capabilities: DeviceCapability[];
  attestationChain: AttestationRecord[];
  isRevoked: boolean;
  revokedAt: string | null;
  revokedBy: string | null;
  revokeReason: string | null;
  lastSeenAt: string;
  lastAttestationAt: string | null;
  metadata: Record<string, unknown>;
}

export type DevicePlatform = "linux" | "android" | "ios" | "macos" | "windows" | "web" | "unknown";

export type DeviceCapability =
  | "biometric"
  | "tpm"
  | "secure-enclave"
  | "hardware-keystore"
  | "secure-boot"
  | "root-detection"
  | "screen-lock"
  | "push-notification"
  | "local-auth";

export interface AttestationRecord {
  id: string;
  deviceId: string;
  timestamp: string;
  type: AttestationType;
  result: "passed" | "failed" | "degraded" | "skipped";
  trustLevelBefore: DeviceTrustLevel;
  trustLevelAfter: DeviceTrustLevel;
  evidence: Record<string, unknown>;
  expiresAt: string;
}

export type AttestationType =
  | "boot-integrity"
  | "app-integrity"
  | "key-attestation"
  | "biometric-verification"
  | "remote-challenge"
  | "periodic-health"
  | "policy-compliance";

export interface AttestationChallenge {
  challengeId: string;
  deviceId: string;
  nonce: string;
  issuedAt: string;
  expiresAt: string;
  expectedCapabilities: DeviceCapability[];
}

export interface AttestationPolicy {
  id: string;
  name: string;
  requiredCapabilities: DeviceCapability[];
  minTrustLevel: DeviceTrustLevel;
  attestationInterval: number; // seconds
  maxAttestationAge: number; // seconds
  requireSecureBoot: boolean;
  requireBiometric: boolean;
  allowDegradedMode: boolean;
}

export interface DeviceAttestationMetrics {
  totalDevices: number;
  activeDevices: number;
  revokedDevices: number;
  byTrustLevel: Record<DeviceTrustLevel, number>;
  byPlatform: Record<string, number>;
  attestationsPassed: number;
  attestationsFailed: number;
  averageAttestationAge: number;
}

// ── Trust Level Hierarchy ──────────────────────────────────────

const TRUST_LEVEL_ORDER: Record<DeviceTrustLevel, number> = {
  untrusted: 0,
  basic: 1,
  verified: 2,
  "hardware-attested": 3,
};

function compareTrustLevel(a: DeviceTrustLevel, b: DeviceTrustLevel): number {
  return TRUST_LEVEL_ORDER[a] - TRUST_LEVEL_ORDER[b];
}

// ── Service ────────────────────────────────────────────────────

export class DeviceAttestationService {
  private devices: Map<string, DeviceEnrollment> = new Map();
  private challenges: Map<string, AttestationChallenge> = new Map();
  private policies: Map<string, AttestationPolicy> = new Map();
  private listeners: Array<(event: { type: string; device: DeviceEnrollment }) => void> = [];
  private challengeCounter = 0;
  private attestationCounter = 0;

  constructor() {
    this.registerDefaultPolicies();
  }

  // ── Enrollment ─────────────────────────────────────────────

  enrollDevice(params: {
    deviceId: string;
    userId: string;
    displayName: string;
    platform: DevicePlatform;
    capabilities: DeviceCapability[];
    fingerprint: string;
    metadata?: Record<string, unknown>;
  }): DeviceEnrollment {
    if (this.devices.has(params.deviceId)) {
      throw new Error(`Device ${params.deviceId} already enrolled`);
    }

    const trustLevel = this.computeInitialTrustLevel(params.capabilities);

    const enrollment: DeviceEnrollment = {
      deviceId: params.deviceId,
      userId: params.userId,
      displayName: params.displayName,
      platform: params.platform,
      enrolledAt: new Date().toISOString(),
      trustLevel,
      fingerprint: params.fingerprint,
      capabilities: params.capabilities,
      attestationChain: [],
      isRevoked: false,
      revokedAt: null,
      revokedBy: null,
      revokeReason: null,
      lastSeenAt: new Date().toISOString(),
      lastAttestationAt: null,
      metadata: params.metadata ?? {},
    };

    this.devices.set(params.deviceId, enrollment);
    this.emit("enrolled", enrollment);
    return enrollment;
  }

  // ── Attestation Flow ───────────────────────────────────────

  issueChallenge(deviceId: string): AttestationChallenge {
    const device = this.getDeviceOrThrow(deviceId);

    const challenge: AttestationChallenge = {
      challengeId: `atch-${++this.challengeCounter}-${Date.now()}`,
      deviceId,
      nonce: this.generateNonce(),
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 300_000).toISOString(),
      expectedCapabilities: device.capabilities,
    };

    this.challenges.set(challenge.challengeId, challenge);
    return challenge;
  }

  verifyAttestation(params: {
    challengeId: string;
    deviceId: string;
    type: AttestationType;
    evidence: Record<string, unknown>;
  }): AttestationRecord {
    const challenge = this.challenges.get(params.challengeId);
    if (!challenge) throw new Error("Invalid or expired challenge");
    if (challenge.deviceId !== params.deviceId) throw new Error("Challenge/device mismatch");
    if (new Date(challenge.expiresAt) < new Date()) throw new Error("Challenge expired");

    const device = this.getDeviceOrThrow(params.deviceId);
    const previousLevel = device.trustLevel;
    const result = this.evaluateAttestationEvidence(params.type, params.evidence, device);

    const newTrustLevel = result === "passed"
      ? this.upgradeTrustLevel(device)
      : result === "degraded"
        ? this.degradeTrustLevel(device)
        : this.downgradeTrustLevel(device);

    const record: AttestationRecord = {
      id: `atr-${++this.attestationCounter}-${Date.now()}`,
      deviceId: params.deviceId,
      timestamp: new Date().toISOString(),
      type: params.type,
      result,
      trustLevelBefore: previousLevel,
      trustLevelAfter: newTrustLevel,
      evidence: params.evidence,
      expiresAt: new Date(Date.now() + 86400_000).toISOString(),
    };

    device.trustLevel = newTrustLevel;
    device.attestationChain.push(record);
    device.lastAttestationAt = record.timestamp;
    device.lastSeenAt = record.timestamp;

    this.challenges.delete(params.challengeId);
    this.emit(result === "passed" ? "attestation-passed" : "attestation-failed", device);

    return record;
  }

  // ── Revocation ─────────────────────────────────────────────

  revokeDevice(deviceId: string, revokedBy: string, reason: string): void {
    const device = this.getDeviceOrThrow(deviceId);
    device.isRevoked = true;
    device.revokedAt = new Date().toISOString();
    device.revokedBy = revokedBy;
    device.revokeReason = reason;
    device.trustLevel = "untrusted";
    this.emit("revoked", device);
  }

  reinstateDevice(deviceId: string): void {
    const device = this.getDeviceOrThrow(deviceId);
    if (!device.isRevoked) return;
    device.isRevoked = false;
    device.revokedAt = null;
    device.revokedBy = null;
    device.revokeReason = null;
    device.trustLevel = "basic";
    this.emit("reinstated", device);
  }

  // ── Policy ─────────────────────────────────────────────────

  registerPolicy(policy: AttestationPolicy): void {
    this.policies.set(policy.id, policy);
  }

  evaluateDevicePolicy(deviceId: string, policyId: string): { compliant: boolean; violations: string[] } {
    const device = this.getDeviceOrThrow(deviceId);
    const policy = this.policies.get(policyId);
    if (!policy) return { compliant: false, violations: ["Policy not found"] };

    const violations: string[] = [];

    if (device.isRevoked) violations.push("Device is revoked");
    if (compareTrustLevel(device.trustLevel, policy.minTrustLevel) < 0) {
      violations.push(`Trust level ${device.trustLevel} below required ${policy.minTrustLevel}`);
    }
    for (const cap of policy.requiredCapabilities) {
      if (!device.capabilities.includes(cap)) violations.push(`Missing capability: ${cap}`);
    }
    if (policy.requireSecureBoot && !device.capabilities.includes("secure-boot")) {
      violations.push("Secure boot required but not available");
    }
    if (policy.requireBiometric && !device.capabilities.includes("biometric")) {
      violations.push("Biometric required but not available");
    }
    if (device.lastAttestationAt) {
      const age = (Date.now() - new Date(device.lastAttestationAt).getTime()) / 1000;
      if (age > policy.maxAttestationAge) violations.push("Attestation expired");
    } else {
      violations.push("No attestation on record");
    }

    return { compliant: violations.length === 0, violations };
  }

  // ── Queries ────────────────────────────────────────────────

  getDevice(deviceId: string): DeviceEnrollment | null {
    return this.devices.get(deviceId) ?? null;
  }

  getDevicesByUser(userId: string): DeviceEnrollment[] {
    return Array.from(this.devices.values()).filter((d) => d.userId === userId);
  }

  getActiveDevices(): DeviceEnrollment[] {
    return Array.from(this.devices.values()).filter((d) => !d.isRevoked);
  }

  getMetrics(): DeviceAttestationMetrics {
    const devices = Array.from(this.devices.values());
    const byTrust: Record<DeviceTrustLevel, number> = { untrusted: 0, basic: 0, verified: 0, "hardware-attested": 0 };
    const byPlatform: Record<string, number> = {};
    let passed = 0;
    let failed = 0;
    let totalAge = 0;
    let ageCount = 0;

    for (const d of devices) {
      byTrust[d.trustLevel]++;
      byPlatform[d.platform] = (byPlatform[d.platform] ?? 0) + 1;
      for (const a of d.attestationChain) {
        if (a.result === "passed") passed++;
        else failed++;
      }
      if (d.lastAttestationAt) {
        totalAge += Date.now() - new Date(d.lastAttestationAt).getTime();
        ageCount++;
      }
    }

    return {
      totalDevices: devices.length,
      activeDevices: devices.filter((d) => !d.isRevoked).length,
      revokedDevices: devices.filter((d) => d.isRevoked).length,
      byTrustLevel: byTrust,
      byPlatform,
      attestationsPassed: passed,
      attestationsFailed: failed,
      averageAttestationAge: ageCount > 0 ? totalAge / ageCount / 1000 : 0,
    };
  }

  // ── Subscriptions ──────────────────────────────────────────

  onDeviceEvent(listener: (event: { type: string; device: DeviceEnrollment }) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter((l) => l !== listener); };
  }

  // ── Internal ───────────────────────────────────────────────

  private getDeviceOrThrow(deviceId: string): DeviceEnrollment {
    const d = this.devices.get(deviceId);
    if (!d) throw new Error(`Device not found: ${deviceId}`);
    return d;
  }

  private computeInitialTrustLevel(caps: DeviceCapability[]): DeviceTrustLevel {
    if (caps.includes("tpm") || caps.includes("secure-enclave")) return "verified";
    if (caps.includes("biometric") || caps.includes("screen-lock")) return "basic";
    return "untrusted";
  }

  private upgradeTrustLevel(device: DeviceEnrollment): DeviceTrustLevel {
    const hasHardware = device.capabilities.some((c) => ["tpm", "secure-enclave", "hardware-keystore"].includes(c));
    if (hasHardware && device.attestationChain.filter((a) => a.result === "passed").length >= 3) {
      return "hardware-attested";
    }
    if (device.trustLevel === "untrusted") return "basic";
    if (device.trustLevel === "basic") return "verified";
    return device.trustLevel;
  }

  private degradeTrustLevel(device: DeviceEnrollment): DeviceTrustLevel {
    if (device.trustLevel === "hardware-attested") return "verified";
    if (device.trustLevel === "verified") return "basic";
    return device.trustLevel;
  }

  private downgradeTrustLevel(device: DeviceEnrollment): DeviceTrustLevel {
    return "untrusted";
  }

  private evaluateAttestationEvidence(
    type: AttestationType,
    evidence: Record<string, unknown>,
    _device: DeviceEnrollment,
  ): "passed" | "failed" | "degraded" {
    // Structural evaluation — real implementation would verify cryptographic proofs
    if (!evidence || Object.keys(evidence).length === 0) return "failed";

    switch (type) {
      case "boot-integrity":
        return evidence.bootChainValid === true ? "passed" : "failed";
      case "app-integrity":
        return evidence.signatureValid === true ? "passed" : "degraded";
      case "key-attestation":
        return evidence.keyChainValid === true && evidence.certificateValid === true ? "passed" : "failed";
      case "biometric-verification":
        return evidence.biometricMatched === true ? "passed" : "failed";
      case "remote-challenge":
        return evidence.nonceValid === true && evidence.responseTimely === true ? "passed" : "failed";
      case "periodic-health":
        return evidence.healthScore !== undefined && (evidence.healthScore as number) > 0.7 ? "passed" : "degraded";
      case "policy-compliance":
        return evidence.compliant === true ? "passed" : "degraded";
      default:
        return "failed";
    }
  }

  private generateNonce(): string {
    const arr = new Uint8Array(32);
    if (typeof crypto !== "undefined") crypto.getRandomValues(arr);
    return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  private emit(type: string, device: DeviceEnrollment): void {
    for (const l of this.listeners) {
      try { l({ type, device }); } catch { /* isolation */ }
    }
  }

  private registerDefaultPolicies(): void {
    this.registerPolicy({
      id: "standard",
      name: "Standard Device Policy",
      requiredCapabilities: ["screen-lock"],
      minTrustLevel: "basic",
      attestationInterval: 86400,
      maxAttestationAge: 172800,
      requireSecureBoot: false,
      requireBiometric: false,
      allowDegradedMode: true,
    });
    this.registerPolicy({
      id: "high-security",
      name: "High Security Policy",
      requiredCapabilities: ["biometric", "screen-lock", "secure-enclave"],
      minTrustLevel: "verified",
      attestationInterval: 3600,
      maxAttestationAge: 7200,
      requireSecureBoot: true,
      requireBiometric: true,
      allowDegradedMode: false,
    });
    this.registerPolicy({
      id: "authority-device",
      name: "Authority Device Policy",
      requiredCapabilities: ["biometric", "tpm", "secure-boot", "hardware-keystore"],
      minTrustLevel: "hardware-attested",
      attestationInterval: 1800,
      maxAttestationAge: 3600,
      requireSecureBoot: true,
      requireBiometric: true,
      allowDegradedMode: false,
    });
  }
}

export function createDeviceAttestationService(): DeviceAttestationService {
  return new DeviceAttestationService();
}
