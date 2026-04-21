// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisory Interpretation Policy
// Formal rules for advisory-heavy states and green-with-caveats
// ═══════════════════════════════════════════════════════════════

import type { ReadinessDimension, ReadinessVerdict, ContradictionSeverity } from "./readiness-claim-contract";

export interface AdvisoryThreshold {
  readonly maxAdvisories: number;
  readonly effect: "no-impact" | "caveat" | "conditional" | "downgrade";
  readonly resultingVerdict?: ReadinessVerdict;
  readonly description: string;
}

export interface DimensionDowngradeTrigger {
  readonly dimension: ReadinessDimension;
  readonly trigger: string;
  readonly condition: string;
  readonly resultingVerdict: ReadinessVerdict;
}

export interface ContradictionDowngradeRule {
  readonly minSeverity: ContradictionSeverity;
  readonly minOpenCount: number;
  readonly effect: "caveat" | "force-conditional" | "force-blocked";
  readonly description: string;
}

/** Advisory count thresholds — applied to aggregate WARN-tier count */
export const ADVISORY_THRESHOLDS: readonly AdvisoryThreshold[] = [
  { maxAdvisories: 500, effect: "no-impact", description: "Healthy advisory range. No impact on verdicts." },
  { maxAdvisories: 2000, effect: "caveat", description: "Advisory burden is notable. Add caveat to release summary." },
  { maxAdvisories: 5000, effect: "conditional", resultingVerdict: "CONDITIONALLY_READY", description: "Advisory burden is significant. Release is conditional on advisory review." },
  { maxAdvisories: Infinity, effect: "downgrade", resultingVerdict: "OPERATIONALLY_DEFERRED", description: "Advisory burden is excessive. Release should be deferred until advisory count is reduced." },
] as const;

/** Dimension-specific downgrade triggers */
export const DIMENSION_DOWNGRADE_TRIGGERS: readonly DimensionDowngradeTrigger[] = [
  { dimension: "distribution", trigger: "notarization-pending", condition: "Apple notarization not completed", resultingVerdict: "DISTRIBUTION_BLOCKED" },
  { dimension: "distribution", trigger: "mobile-archived", condition: "Mobile native distribution archived", resultingVerdict: "DISTRIBUTION_BLOCKED" },
  { dimension: "trust", trigger: "encryption-pending", condition: "OAuth token encryption at rest not enforced", resultingVerdict: "TRUST_GAP_OPEN" },
  { dimension: "trust", trigger: "rls-gap", condition: "Table exists without RLS policy", resultingVerdict: "TRUST_GAP_OPEN" },
  { dimension: "behavioral", trigger: "no-e2e-boot", condition: "E2E boot validation has not executed", resultingVerdict: "BEHAVIORALLY_PARTIAL" },
  { dimension: "behavioral", trigger: "nightly-failure", condition: "Most recent nightly run failed", resultingVerdict: "BEHAVIORALLY_PARTIAL" },
  { dimension: "structural", trigger: "duplicate-families", condition: ">10 duplicate component families", resultingVerdict: "CONDITIONALLY_READY" },
  { dimension: "operational", trigger: "high-advisory-count", condition: ">2000 advisory warnings", resultingVerdict: "CONDITIONALLY_READY" },
] as const;

/** Contradiction-forced claim downgrade rules */
export const CONTRADICTION_DOWNGRADE_RULES: readonly ContradictionDowngradeRule[] = [
  { minSeverity: "critical", minOpenCount: 1, effect: "force-blocked", description: "Any open critical contradiction blocks release." },
  { minSeverity: "high", minOpenCount: 1, effect: "force-conditional", description: "Any open high-severity contradiction forces CONDITIONALLY_READY." },
  { minSeverity: "medium", minOpenCount: 3, effect: "caveat", description: "3+ open medium contradictions add release caveat." },
  { minSeverity: "low", minOpenCount: 5, effect: "caveat", description: "5+ open low contradictions add release caveat." },
] as const;

/** Evaluate advisory count against thresholds */
export function evaluateAdvisoryBurden(advisoryCount: number): AdvisoryThreshold {
  for (const t of ADVISORY_THRESHOLDS) {
    if (advisoryCount <= t.maxAdvisories) return t;
  }
  return ADVISORY_THRESHOLDS[ADVISORY_THRESHOLDS.length - 1];
}

/** Check if any dimension triggers apply */
export function getActiveTriggers(
  activeConditions: readonly string[],
): readonly DimensionDowngradeTrigger[] {
  return DIMENSION_DOWNGRADE_TRIGGERS.filter(t =>
    activeConditions.includes(t.trigger),
  );
}