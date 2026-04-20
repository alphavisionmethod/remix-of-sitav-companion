// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust Tier Policy
// Maps trust tiers to lifecycle restrictions and permission rules.
// ═══════════════════════════════════════════════════════════════

import type { TrustBadge } from "./trust";
import { permissionRiskLevel } from "./permissions";

export type TrustTier = "first_party" | "trusted" | "standard" | "restricted";

export interface TrustTierPolicy {
  tier: TrustTier;
  autoInstallAllowed: boolean;
  autoUpdateAllowed: boolean;
  removalPromptRequired: boolean;
  adminApprovalForInstall: boolean;
  sandboxOnly: boolean;
  permissionAutoGrant: "all" | "low_only" | "none";
  maxBackgroundProcesses: number;
  ipcAllowed: boolean;
  fileSystemAccess: "full" | "scoped" | "none";
}

const TIER_POLICIES: Record<TrustTier, TrustTierPolicy> = {
  first_party: {
    tier: "first_party",
    autoInstallAllowed: true,
    autoUpdateAllowed: true,
    removalPromptRequired: false,
    adminApprovalForInstall: false,
    sandboxOnly: false,
    permissionAutoGrant: "all",
    maxBackgroundProcesses: 5,
    ipcAllowed: true,
    fileSystemAccess: "full",
  },
  trusted: {
    tier: "trusted",
    autoInstallAllowed: false,
    autoUpdateAllowed: true,
    removalPromptRequired: false,
    adminApprovalForInstall: false,
    sandboxOnly: false,
    permissionAutoGrant: "low_only",
    maxBackgroundProcesses: 2,
    ipcAllowed: true,
    fileSystemAccess: "scoped",
  },
  standard: {
    tier: "standard",
    autoInstallAllowed: false,
    autoUpdateAllowed: false,
    removalPromptRequired: true,
    adminApprovalForInstall: false,
    sandboxOnly: false,
    permissionAutoGrant: "none",
    maxBackgroundProcesses: 1,
    ipcAllowed: false,
    fileSystemAccess: "scoped",
  },
  restricted: {
    tier: "restricted",
    autoInstallAllowed: false,
    autoUpdateAllowed: false,
    removalPromptRequired: true,
    adminApprovalForInstall: true,
    sandboxOnly: true,
    permissionAutoGrant: "none",
    maxBackgroundProcesses: 0,
    ipcAllowed: false,
    fileSystemAccess: "none",
  },
};

/** Get the canonical policy for a trust tier. */
export function getTrustTierPolicy(tier: TrustTier): TrustTierPolicy {
  return TIER_POLICIES[tier];
}

/** Map a TrustBadge to a TrustTier. */
export function badgeToTier(badge: TrustBadge): TrustTier {
  switch (badge) {
    case "internal": return "first_party";
    case "verified": return "trusted";
    case "trusted-domain": return "standard";
    case "community": return "standard";
    case "unverified": return "restricted";
    default: return "restricted";
  }
}

/** Check if a permission should be auto-granted for a given trust tier. */
export function shouldAutoGrantPermission(tier: TrustTier, permissionKey: string): boolean {
  const policy = TIER_POLICIES[tier];
  if (policy.permissionAutoGrant === "all") return true;
  if (policy.permissionAutoGrant === "none") return false;
  return permissionRiskLevel(permissionKey) === "low";
}

/** Check if install is allowed without admin approval. */
export function canInstallWithoutApproval(tier: TrustTier): boolean {
  return !TIER_POLICIES[tier].adminApprovalForInstall;
}

/** Export all policies for proof generation. */
export function getAllTrustTierPolicies(): Record<TrustTier, TrustTierPolicy> {
  return { ...TIER_POLICIES };
}