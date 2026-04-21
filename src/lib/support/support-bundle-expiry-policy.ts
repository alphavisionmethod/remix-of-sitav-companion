// ═══════════════════════════════════════════════════════════════
// SITA OS — Support Bundle Expiry Policy
// TTL governance for every bundle class. No bundle persists
// indefinitely without explicit archival governance.
// ═══════════════════════════════════════════════════════════════

import type { BundleExpiryClass, BundleType, ExpiryPolicy } from "./support-bundle-contract";

const MS_HOUR = 3_600_000;
const MS_DAY = 86_400_000;

const EXPIRY_POLICIES: Record<BundleExpiryClass, ExpiryPolicy> = {
  customer: {
    expiryClass: "customer",
    ttlMs: MS_DAY,                // 24 hours
    renewableCount: 0,
    archiveAfterExpiry: false,
    purgeAfterArchiveDays: null,
  },
  operator: {
    expiryClass: "operator",
    ttlMs: 7 * MS_DAY,            // 7 days
    renewableCount: 2,
    archiveAfterExpiry: true,
    purgeAfterArchiveDays: 90,
  },
  escalation: {
    expiryClass: "escalation",
    ttlMs: 30 * MS_DAY,           // 30 days
    renewableCount: 1,
    archiveAfterExpiry: true,
    purgeAfterArchiveDays: 365,
  },
  archive: {
    expiryClass: "archive",
    ttlMs: 365 * MS_DAY,          // 1 year
    renewableCount: 0,
    archiveAfterExpiry: false,
    purgeAfterArchiveDays: 730,
  },
};

const BUNDLE_TYPE_CLASS: Record<BundleType, BundleExpiryClass> = {
  "runtime-crash": "operator",
  "auth-account": "operator",
  "onboarding": "operator",
  "app-lifecycle": "operator",
  "advisor-boardroom": "operator",
  "integration-provider": "operator",
  "workflow-failure": "operator",
  "payment-proof": "escalation",
  "support-escalation": "escalation",
  "admin-operator": "escalation",
  "os-recovery": "escalation",
  "environment": "customer",
  "system-wide": "operator",
};

/** Resolve expiry policy for a given bundle type. */
export function resolveExpiryPolicy(bundleType: BundleType): ExpiryPolicy {
  const cls = BUNDLE_TYPE_CLASS[bundleType];
  return EXPIRY_POLICIES[cls];
}

/** Compute expiry timestamp from creation + policy. */
export function computeExpiresAt(createdAt: string, policy: ExpiryPolicy): string {
  return new Date(new Date(createdAt).getTime() + policy.ttlMs).toISOString();
}

/** Check whether a bundle has expired. */
export function isBundleExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

/** All bundle types that have explicit expiry governance. */
export const GOVERNED_BUNDLE_TYPES: readonly BundleType[] = Object.keys(BUNDLE_TYPE_CLASS) as BundleType[];

export { EXPIRY_POLICIES, BUNDLE_TYPE_CLASS };