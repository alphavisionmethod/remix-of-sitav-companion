// ═══════════════════════════════════════════════════════════════
// SITA OS — Device Trust Registry
// Trust policy per device class — queryable layer over existing trust models
// References: device-identity.ts, trust-boundary-model.ts
// ═══════════════════════════════════════════════════════════════

import type { DeviceTrustLevel } from "@/packages/contracts/graph/device-attestation";
import type { DeviceFormFactor } from "./device-identity-registry";

// ── Types ────────────────────────────────────────────────────

export type DataAccessTier = "full" | "read-only" | "cached-only" | "none";
export type SyncPermission = "full-sync" | "pull-only" | "push-only" | "no-sync";

export interface TrustPolicyEntry {
  trustLevel: DeviceTrustLevel;
  allowedOperations: string[];
  blockedOperations: string[];
  dataAccessTier: DataAccessTier;
  syncPermission: SyncPermission;
  maxOfflineDurationHours: number;
  requiresReauthAfterHours: number;
  canHoldEncryptionKeys: boolean;
  canPerformFinancialOps: boolean;
  canAccessAdminPlane: boolean;
  canEmitProofReceipts: boolean;
}

export interface DeviceClassTrustProfile {
  formFactor: DeviceFormFactor;
  defaultTrustLevel: DeviceTrustLevel;
  maxAchievableTrust: DeviceTrustLevel;
  trustEscalationPath: DeviceTrustLevel[];
  policies: Record<DeviceTrustLevel, TrustPolicyEntry>;
}

// ── Registry ─────────────────────────────────────────────────

const SHARED_POLICIES: Record<DeviceTrustLevel, TrustPolicyEntry> = {
  untrusted: {
    trustLevel: "untrusted",
    allowedOperations: ["read-public", "view-dashboard"],
    blockedOperations: ["write", "delete", "admin", "financial", "sync", "proof-emit"],
    dataAccessTier: "cached-only",
    syncPermission: "no-sync",
    maxOfflineDurationHours: 0,
    requiresReauthAfterHours: 1,
    canHoldEncryptionKeys: false,
    canPerformFinancialOps: false,
    canAccessAdminPlane: false,
    canEmitProofReceipts: false,
  },
  basic: {
    trustLevel: "basic",
    allowedOperations: ["read", "write-own", "view-dashboard", "search"],
    blockedOperations: ["delete-others", "admin", "bulk-export"],
    dataAccessTier: "read-only",
    syncPermission: "pull-only",
    maxOfflineDurationHours: 4,
    requiresReauthAfterHours: 8,
    canHoldEncryptionKeys: false,
    canPerformFinancialOps: false,
    canAccessAdminPlane: false,
    canEmitProofReceipts: false,
  },
  verified: {
    trustLevel: "verified",
    allowedOperations: ["read", "write", "delete-own", "sync", "export", "financial-read"],
    blockedOperations: ["admin-write", "bulk-delete", "key-management"],
    dataAccessTier: "full",
    syncPermission: "full-sync",
    maxOfflineDurationHours: 24,
    requiresReauthAfterHours: 24,
    canHoldEncryptionKeys: true,
    canPerformFinancialOps: true,
    canAccessAdminPlane: false,
    canEmitProofReceipts: true,
  },
  "hardware-attested": {
    trustLevel: "hardware-attested",
    allowedOperations: ["read", "write", "delete", "admin", "sync", "export", "financial", "key-management", "proof-emit"],
    blockedOperations: [],
    dataAccessTier: "full",
    syncPermission: "full-sync",
    maxOfflineDurationHours: 72,
    requiresReauthAfterHours: 48,
    canHoldEncryptionKeys: true,
    canPerformFinancialOps: true,
    canAccessAdminPlane: true,
    canEmitProofReceipts: true,
  },
};

export const DEVICE_TRUST_REGISTRY: Record<DeviceFormFactor, DeviceClassTrustProfile> = {
  "desktop-workstation": {
    formFactor: "desktop-workstation",
    defaultTrustLevel: "basic",
    maxAchievableTrust: "hardware-attested",
    trustEscalationPath: ["untrusted", "basic", "verified", "hardware-attested"],
    policies: SHARED_POLICIES,
  },
  laptop: {
    formFactor: "laptop",
    defaultTrustLevel: "basic",
    maxAchievableTrust: "hardware-attested",
    trustEscalationPath: ["untrusted", "basic", "verified", "hardware-attested"],
    policies: SHARED_POLICIES,
  },
  tablet: {
    formFactor: "tablet",
    defaultTrustLevel: "basic",
    maxAchievableTrust: "verified",
    trustEscalationPath: ["untrusted", "basic", "verified"],
    policies: SHARED_POLICIES,
  },
  smartphone: {
    formFactor: "smartphone",
    defaultTrustLevel: "basic",
    maxAchievableTrust: "verified",
    trustEscalationPath: ["untrusted", "basic", "verified"],
    policies: SHARED_POLICIES,
  },
  "server-appliance": {
    formFactor: "server-appliance",
    defaultTrustLevel: "verified",
    maxAchievableTrust: "hardware-attested",
    trustEscalationPath: ["untrusted", "basic", "verified", "hardware-attested"],
    policies: SHARED_POLICIES,
  },
  kiosk: {
    formFactor: "kiosk",
    defaultTrustLevel: "untrusted",
    maxAchievableTrust: "basic",
    trustEscalationPath: ["untrusted", "basic"],
    policies: SHARED_POLICIES,
  },
  embedded: {
    formFactor: "embedded",
    defaultTrustLevel: "untrusted",
    maxAchievableTrust: "verified",
    trustEscalationPath: ["untrusted", "basic", "verified"],
    policies: SHARED_POLICIES,
  },
  unknown: {
    formFactor: "unknown",
    defaultTrustLevel: "untrusted",
    maxAchievableTrust: "basic",
    trustEscalationPath: ["untrusted", "basic"],
    policies: SHARED_POLICIES,
  },
};

// ── Queries ──────────────────────────────────────────────────

export function getTrustProfile(formFactor: DeviceFormFactor): DeviceClassTrustProfile {
  return DEVICE_TRUST_REGISTRY[formFactor];
}

export function getTrustPolicy(formFactor: DeviceFormFactor, trustLevel: DeviceTrustLevel): TrustPolicyEntry {
  return DEVICE_TRUST_REGISTRY[formFactor].policies[trustLevel];
}

export function canPerformOperation(formFactor: DeviceFormFactor, trustLevel: DeviceTrustLevel, operation: string): boolean {
  const policy = getTrustPolicy(formFactor, trustLevel);
  if (policy.blockedOperations.includes(operation)) return false;
  return policy.allowedOperations.includes(operation);
}

export function getMaxAchievableTrust(formFactor: DeviceFormFactor): DeviceTrustLevel {
  return DEVICE_TRUST_REGISTRY[formFactor].maxAchievableTrust;
}
