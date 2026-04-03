// ═══════════════════════════════════════════════════════════════
// SITA OS — Entitlements Package
// ═══════════════════════════════════════════════════════════════

export type EntitlementTier = "free" | "starter" | "professional" | "enterprise" | "sovereign";

export interface Entitlement {
  id: string;
  feature: string;
  tier: EntitlementTier;
  limit?: number;
  used?: number;
  unlimited: boolean;
}

export interface EntitlementPlan {
  tier: EntitlementTier;
  name: string;
  entitlements: Entitlement[];
  price: number;
  billingCycle: "monthly" | "annual";
}

const TIER_ORDER: EntitlementTier[] = ["free", "starter", "professional", "enterprise", "sovereign"];

export const tierIncludes = (userTier: EntitlementTier, requiredTier: EntitlementTier): boolean =>
  TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(requiredTier);

export const checkEntitlement = (entitlements: Entitlement[], feature: string): { allowed: boolean; remaining?: number } => {
  const ent = entitlements.find(e => e.feature === feature);
  if (!ent) return { allowed: false };
  if (ent.unlimited) return { allowed: true };
  if (ent.limit !== undefined && ent.used !== undefined) {
    return { allowed: ent.used < ent.limit, remaining: ent.limit - ent.used };
  }
  return { allowed: true };
};

export const DEFAULT_PLANS: EntitlementPlan[] = [
  { tier: "free", name: "Free", price: 0, billingCycle: "monthly", entitlements: [] },
  { tier: "starter", name: "Starter", price: 29, billingCycle: "monthly", entitlements: [] },
  { tier: "professional", name: "Professional", price: 99, billingCycle: "monthly", entitlements: [] },
  { tier: "enterprise", name: "Enterprise", price: 299, billingCycle: "monthly", entitlements: [] },
  { tier: "sovereign", name: "Sovereign", price: 999, billingCycle: "monthly", entitlements: [] },
];

// ── Usage Metering ──────────────────────────────────────────

export interface UsageMeter {
  readonly featureId: string;
  readonly userId: string;
  readonly current: number;
  readonly limit: number;
  readonly resetAt: number;
  readonly period: "hourly" | "daily" | "monthly";
}

export type OveragePolicy = "block" | "warn" | "charge";

export interface MeteredEntitlementCheck {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly metered: boolean;
  readonly overagePolicy: OveragePolicy;
  readonly usagePercent: number;
}

export const checkMeteredEntitlement = (meter: UsageMeter, policy: OveragePolicy): MeteredEntitlementCheck => {
  const remaining = meter.limit - meter.current;
  const usagePercent = meter.limit > 0 ? (meter.current / meter.limit) * 100 : 0;
  const allowed = policy === "block" ? remaining > 0 : true;
  return { allowed, remaining: Math.max(0, remaining), metered: true, overagePolicy: policy, usagePercent };
};

// ── Billing Events ──────────────────────────────────────────

export type BillingEventType = "subscription-start" | "subscription-renew" | "subscription-cancel" | "overage-charge" | "tier-upgrade" | "tier-downgrade";

export interface BillingEvent {
  readonly id: string;
  readonly userId: string;
  readonly type: BillingEventType;
  readonly amount: number;
  readonly currency: string;
  readonly tier: EntitlementTier;
  readonly timestamp: number;
  readonly metadata?: Record<string, unknown>;
}
