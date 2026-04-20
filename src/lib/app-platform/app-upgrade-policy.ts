// ═══════════════════════════════════════════════════════════════
// SITA OS — App Upgrade Policy
// Semver compatibility, data migration, and auto-update rules.
// ═══════════════════════════════════════════════════════════════

import type { TrustTier } from "./app-trust-tier-policy";

export type UpdateChannel = "stable" | "beta" | "nightly" | "internal";

export interface UpgradeCompatibility {
  compatible: boolean;
  requiresDataMigration: boolean;
  breakingChanges: boolean;
  reason: string;
}

export interface AutoUpdateRule {
  allowed: boolean;
  reason: string;
}

/** Parse a version string into [major, minor, patch]. Returns [0,0,0] on failure. */
function parseVersion(v: string): [number, number, number] {
  const parts = v.replace(/^v/, "").split(".").map(Number);
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

/** Check if upgrading from one version to another is compatible. */
export function canUpgrade(fromVersion: string, toVersion: string): UpgradeCompatibility {
  const [fMajor, fMinor] = parseVersion(fromVersion);
  const [tMajor, tMinor] = parseVersion(toVersion);

  if (tMajor < fMajor || (tMajor === fMajor && tMinor < fMinor)) {
    return { compatible: false, requiresDataMigration: false, breakingChanges: false, reason: "Downgrade not supported" };
  }

  if (tMajor === fMajor && tMinor === fMinor) {
    return { compatible: true, requiresDataMigration: false, breakingChanges: false, reason: "Patch update" };
  }

  if (tMajor === fMajor) {
    return { compatible: true, requiresDataMigration: false, breakingChanges: false, reason: "Minor update — backward compatible" };
  }

  // Major version change
  return {
    compatible: true,
    requiresDataMigration: true,
    breakingChanges: true,
    reason: `Major version upgrade (${fMajor} → ${tMajor}) — may contain breaking changes`,
  };
}

/** Check if a major version change requires data migration. */
export function requiresDataMigration(fromVersion: string, toVersion: string): boolean {
  const [fMajor] = parseVersion(fromVersion);
  const [tMajor] = parseVersion(toVersion);
  return tMajor > fMajor;
}

/** Determine if auto-update is allowed for the given trust tier and channel. */
export function isAutoUpdateAllowed(trustTier: TrustTier, channel: UpdateChannel): AutoUpdateRule {
  // First-party apps on stable channel always auto-update
  if (trustTier === "first_party" && channel === "stable") {
    return { allowed: true, reason: "First-party app on stable channel" };
  }
  if (trustTier === "first_party" && channel === "internal") {
    return { allowed: true, reason: "First-party app on internal channel" };
  }
  // Trusted apps on stable auto-update
  if (trustTier === "trusted" && channel === "stable") {
    return { allowed: true, reason: "Trusted app on stable channel" };
  }
  // Everything else requires manual confirmation
  if (channel === "nightly" || channel === "beta") {
    return { allowed: false, reason: `Manual update required for ${channel} channel` };
  }
  if (trustTier === "restricted") {
    return { allowed: false, reason: "Restricted apps require manual update approval" };
  }
  return { allowed: false, reason: "Manual update required for this trust/channel combination" };
}

/** Export the full upgrade rule matrix for proof artifacts. */
export function getUpgradeRuleMatrix(): Array<{ trustTier: TrustTier; channel: UpdateChannel; autoAllowed: boolean }> {
  const tiers: TrustTier[] = ["first_party", "trusted", "standard", "restricted"];
  const channels: UpdateChannel[] = ["stable", "beta", "nightly", "internal"];
  return tiers.flatMap(t => channels.map(c => ({ trustTier: t, channel: c, autoAllowed: isAutoUpdateAllowed(t, c).allowed })));
}