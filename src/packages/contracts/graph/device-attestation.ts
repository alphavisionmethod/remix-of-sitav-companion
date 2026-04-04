// ═══════════════════════════════════════════════════════════════
// SITA OS — Graph Contracts: Device Attestation
// Trusted device / secure signing
// ═══════════════════════════════════════════════════════════════

export type DeviceTrustLevel = "untrusted" | "basic" | "verified" | "hardware-attested";

export interface DeviceAttestation {
  deviceId: string;
  userId: string;
  trustLevel: DeviceTrustLevel;
  attestedAt: string;
  expiresAt: string;
  fingerprint: string;
  capabilities: string[];
  lastSeenAt: string;
  platform: string;
  isRevoked: boolean;
}
