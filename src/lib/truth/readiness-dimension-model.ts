// ═══════════════════════════════════════════════════════════════
// SITA OS — Readiness Dimension Model
// 5-dimension readiness model with per-subsystem scoring
// ═══════════════════════════════════════════════════════════════

import type {
  ReadinessDimension,
  ReadinessVerdict,
  DimensionScore,
  SubsystemScoreboard,
} from "./readiness-claim-contract";

export interface DimensionDefinition {
  readonly dimension: ReadinessDimension;
  readonly label: string;
  readonly description: string;
  readonly measures: readonly string[];
}

export const READINESS_DIMENSIONS: readonly DimensionDefinition[] = [
  {
    dimension: "structural",
    label: "Structural",
    description: "Files exist, types compile, routes registered, tables created",
    measures: ["file-presence", "type-compilation", "route-registration", "table-creation", "schema-validity"],
  },
  {
    dimension: "behavioral",
    label: "Behavioral",
    description: "Runtime proof exists — receipts, nightly runs, E2E validation",
    measures: ["receipt-emission", "nightly-run-pass", "e2e-validation", "integration-proof", "streak-health"],
  },
  {
    dimension: "distribution",
    label: "Distribution",
    description: "Can be packaged, signed, delivered to end users",
    measures: ["build-pipeline", "code-signing", "store-readiness", "notarization", "artifact-presence"],
  },
  {
    dimension: "operational",
    label: "Operational",
    description: "Runbooks, kill-switches, support diagnostics, DR drills proven",
    measures: ["runbook-coverage", "kill-switch-wiring", "support-bundles", "dr-drill-execution", "incident-readiness"],
  },
  {
    dimension: "trust",
    label: "Trust",
    description: "RLS policies, encryption, claim honesty, evidence grading",
    measures: ["rls-enforcement", "encryption-at-rest", "claim-honesty", "evidence-grading", "audit-trail"],
  },
] as const;

export const SCORED_SUBSYSTEMS = [
  "ai-runtime",
  "advisor-boardroom",
  "connector-oauth",
  "app-platform",
  "admin-operator",
  "frontend-ux",
  "mobile-distribution",
  "security-trust",
] as const;

export type ScoredSubsystem = (typeof SCORED_SUBSYSTEMS)[number];

/** Derive a verdict from a numeric 0–100 score */
export function verdictFromScore(score: number, dimension: ReadinessDimension): ReadinessVerdict {
  if (score >= 95) return "READY";
  if (score >= 80) return "CONDITIONALLY_READY";
  if (dimension === "structural" && score >= 70) return "STRUCTURALLY_READY_ONLY";
  if (dimension === "behavioral" && score >= 60) return "BEHAVIORALLY_PARTIAL";
  if (dimension === "distribution" && score < 50) return "DISTRIBUTION_BLOCKED";
  if (dimension === "operational" && score < 60) return "OPERATIONALLY_DEFERRED";
  if (dimension === "trust" && score < 70) return "TRUST_GAP_OPEN";
  return "DEFERRED";
}

/** Roll up dimension scores to an overall subsystem verdict */
export function rollUpVerdict(dimensions: readonly DimensionScore[]): ReadinessVerdict {
  if (dimensions.length === 0) return "DEFERRED";

  const hasBlocked = dimensions.some(d => d.verdict === "DISTRIBUTION_BLOCKED");
  if (hasBlocked) return "DISTRIBUTION_BLOCKED";

  const hasTrustGap = dimensions.some(d => d.verdict === "TRUST_GAP_OPEN");
  if (hasTrustGap) return "TRUST_GAP_OPEN";

  const allReady = dimensions.every(d => d.verdict === "READY");
  if (allReady) return "READY";

  const hasDeferred = dimensions.some(d =>
    d.verdict === "DEFERRED" || d.verdict === "OPERATIONALLY_DEFERRED"
  );
  if (hasDeferred) return "CONDITIONALLY_READY";

  return "CONDITIONALLY_READY";
}

/** Build a scoreboard entry for a subsystem */
export function buildSubsystemScoreboard(
  subsystem: string,
  dimensionScores: readonly DimensionScore[],
): SubsystemScoreboard {
  return {
    subsystem,
    dimensions: dimensionScores,
    overallVerdict: rollUpVerdict(dimensionScores),
    lastEvaluated: new Date().toISOString(),
  };
}