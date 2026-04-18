// ═══════════════════════════════════════════════════════════════
// SITA OS — Device Attestation Map
// Per-device-class attestation requirements
// References: device-attestation-service.ts
// ═══════════════════════════════════════════════════════════════

import type { DeviceFormFactor } from "./device-identity-registry";

// ── Types ────────────────────────────────────────────────────

export type AttestationType =
  | "boot-integrity" | "app-integrity" | "biometric-challenge"
  | "remote-challenge" | "tpm-attestation" | "secure-boot"
  | "code-signing" | "certificate-pinning";

export type AttestationRequirement = "required" | "optional" | "unavailable";

export interface AttestationEntry {
  type: AttestationType;
  requirement: AttestationRequirement;
  verificationIntervalHours: number;
  failureBehavior: "block" | "degrade" | "warn" | "log-only";
  description: string;
}

export interface DeviceAttestationProfile {
  formFactor: DeviceFormFactor;
  attestations: AttestationEntry[];
  minimumAttestationsRequired: number;
  reattestOnNetworkChange: boolean;
  reattestOnAppUpdate: boolean;
}

// ── Map ──────────────────────────────────────────────────────

export const DEVICE_ATTESTATION_MAP: Record<DeviceFormFactor, DeviceAttestationProfile> = {
  "desktop-workstation": {
    formFactor: "desktop-workstation",
    attestations: [
      { type: "boot-integrity", requirement: "optional", verificationIntervalHours: 24, failureBehavior: "degrade", description: "Verify secure boot chain" },
      { type: "tpm-attestation", requirement: "optional", verificationIntervalHours: 24, failureBehavior: "degrade", description: "TPM 2.0 platform attestation" },
      { type: "app-integrity", requirement: "required", verificationIntervalHours: 12, failureBehavior: "block", description: "Verify app binary integrity" },
      { type: "biometric-challenge", requirement: "optional", verificationIntervalHours: 8, failureBehavior: "warn", description: "Biometric step-up auth" },
      { type: "remote-challenge", requirement: "required", verificationIntervalHours: 24, failureBehavior: "degrade", description: "Server-issued nonce challenge" },
      { type: "code-signing", requirement: "required", verificationIntervalHours: 168, failureBehavior: "block", description: "Verify code signature validity" },
    ],
    minimumAttestationsRequired: 2,
    reattestOnNetworkChange: true,
    reattestOnAppUpdate: true,
  },
  laptop: {
    formFactor: "laptop",
    attestations: [
      { type: "boot-integrity", requirement: "optional", verificationIntervalHours: 24, failureBehavior: "degrade", description: "Verify secure boot chain" },
      { type: "tpm-attestation", requirement: "optional", verificationIntervalHours: 24, failureBehavior: "degrade", description: "TPM platform attestation" },
      { type: "app-integrity", requirement: "required", verificationIntervalHours: 12, failureBehavior: "block", description: "Verify app binary integrity" },
      { type: "biometric-challenge", requirement: "optional", verificationIntervalHours: 8, failureBehavior: "warn", description: "Biometric step-up auth" },
      { type: "remote-challenge", requirement: "required", verificationIntervalHours: 24, failureBehavior: "degrade", description: "Server-issued nonce challenge" },
      { type: "code-signing", requirement: "required", verificationIntervalHours: 168, failureBehavior: "block", description: "Verify code signature validity" },
    ],
    minimumAttestationsRequired: 2,
    reattestOnNetworkChange: true,
    reattestOnAppUpdate: true,
  },
  tablet: {
    formFactor: "tablet",
    attestations: [
      { type: "app-integrity", requirement: "required", verificationIntervalHours: 12, failureBehavior: "block", description: "Verify app integrity" },
      { type: "biometric-challenge", requirement: "optional", verificationIntervalHours: 4, failureBehavior: "warn", description: "Face/Touch ID challenge" },
      { type: "remote-challenge", requirement: "required", verificationIntervalHours: 12, failureBehavior: "degrade", description: "Server nonce challenge" },
      { type: "certificate-pinning", requirement: "required", verificationIntervalHours: 0, failureBehavior: "block", description: "TLS certificate pinning" },
    ],
    minimumAttestationsRequired: 2,
    reattestOnNetworkChange: true,
    reattestOnAppUpdate: true,
  },
  smartphone: {
    formFactor: "smartphone",
    attestations: [
      { type: "app-integrity", requirement: "required", verificationIntervalHours: 12, failureBehavior: "block", description: "Verify app integrity" },
      { type: "biometric-challenge", requirement: "optional", verificationIntervalHours: 4, failureBehavior: "warn", description: "Face/Touch ID challenge" },
      { type: "remote-challenge", requirement: "required", verificationIntervalHours: 12, failureBehavior: "degrade", description: "Server nonce challenge" },
      { type: "secure-boot", requirement: "unavailable", verificationIntervalHours: 0, failureBehavior: "log-only", description: "N/A on mobile" },
      { type: "certificate-pinning", requirement: "required", verificationIntervalHours: 0, failureBehavior: "block", description: "TLS certificate pinning" },
    ],
    minimumAttestationsRequired: 2,
    reattestOnNetworkChange: true,
    reattestOnAppUpdate: true,
  },
  "server-appliance": {
    formFactor: "server-appliance",
    attestations: [
      { type: "boot-integrity", requirement: "required", verificationIntervalHours: 1, failureBehavior: "block", description: "Measured boot verification" },
      { type: "tpm-attestation", requirement: "required", verificationIntervalHours: 1, failureBehavior: "block", description: "TPM remote attestation" },
      { type: "app-integrity", requirement: "required", verificationIntervalHours: 1, failureBehavior: "block", description: "Binary hash verification" },
      { type: "remote-challenge", requirement: "required", verificationIntervalHours: 1, failureBehavior: "block", description: "Continuous challenge-response" },
      { type: "code-signing", requirement: "required", verificationIntervalHours: 24, failureBehavior: "block", description: "Signed binary verification" },
    ],
    minimumAttestationsRequired: 4,
    reattestOnNetworkChange: true,
    reattestOnAppUpdate: true,
  },
  kiosk: {
    formFactor: "kiosk",
    attestations: [
      { type: "app-integrity", requirement: "required", verificationIntervalHours: 6, failureBehavior: "block", description: "Verify kiosk app integrity" },
      { type: "remote-challenge", requirement: "required", verificationIntervalHours: 6, failureBehavior: "degrade", description: "Server nonce challenge" },
    ],
    minimumAttestationsRequired: 1,
    reattestOnNetworkChange: true,
    reattestOnAppUpdate: true,
  },
  embedded: {
    formFactor: "embedded",
    attestations: [
      { type: "app-integrity", requirement: "required", verificationIntervalHours: 24, failureBehavior: "block", description: "Firmware integrity check" },
      { type: "remote-challenge", requirement: "optional", verificationIntervalHours: 24, failureBehavior: "degrade", description: "Server challenge" },
    ],
    minimumAttestationsRequired: 1,
    reattestOnNetworkChange: false,
    reattestOnAppUpdate: true,
  },
  unknown: {
    formFactor: "unknown",
    attestations: [
      { type: "remote-challenge", requirement: "required", verificationIntervalHours: 1, failureBehavior: "block", description: "Mandatory server challenge" },
    ],
    minimumAttestationsRequired: 1,
    reattestOnNetworkChange: true,
    reattestOnAppUpdate: true,
  },
};

// ── Queries ──────────────────────────────────────────────────

export function getAttestationProfile(formFactor: DeviceFormFactor): DeviceAttestationProfile {
  return DEVICE_ATTESTATION_MAP[formFactor];
}

export function getRequiredAttestations(formFactor: DeviceFormFactor): AttestationEntry[] {
  return DEVICE_ATTESTATION_MAP[formFactor].attestations.filter(a => a.requirement === "required");
}

export function isAttestationAvailable(formFactor: DeviceFormFactor, type: AttestationType): boolean {
  const entry = DEVICE_ATTESTATION_MAP[formFactor].attestations.find(a => a.type === type);
  return entry !== undefined && entry.requirement !== "unavailable";
}
