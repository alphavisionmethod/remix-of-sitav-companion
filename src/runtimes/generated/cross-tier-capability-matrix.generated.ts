// ═══════════════════════════════════════════════════════════════
// AUTO-GENERATED — DO NOT EDIT BY HAND.
// Source: src/runtimes/feature-runtime-tier-registry.ts
// Generator: scripts/architecture/checks/check-cross-tier-capability-matrix.ts
//
// This file re-exports a static, type-safe snapshot of the cross-tier
// capability matrix so admin dashboards, audits, and offline tools
// can render it without re-deriving the rules. The runtime path
// remains `enumerateFeatureCoverage()` from the registry.
// ═══════════════════════════════════════════════════════════════

import { enumerateFeatureCoverage } from "../feature-runtime-tier-registry";
import type { RuntimeTier, TierAvailability } from "../runtime-tier-model";

export interface CrossTierCapabilityRow {
  featureId: string;
  name: string;
  ownerDomain: string;
  byTier: Record<RuntimeTier, TierAvailability>;
  launchHonesty: "honest" | "needs-disclosure" | "drift-risk";
}

/** Materialized view of the cross-tier capability matrix. */
export const CROSS_TIER_CAPABILITY_MATRIX: readonly CrossTierCapabilityRow[] =
  enumerateFeatureCoverage() as readonly CrossTierCapabilityRow[];

/** Single helper used by admin boards: list features whose tier
 *  status equals `status` on `tier`. */
export function listMatrixCells(
  tier: RuntimeTier,
  status: TierAvailability,
): CrossTierCapabilityRow[] {
  return CROSS_TIER_CAPABILITY_MATRIX.filter((r) => r.byTier[tier] === status);
}
