// ═══════════════════════════════════════════════════════════════
// SITA OS — Confidence Model V2
// Multi-factor calibrated confidence with penalties, caps,
// risk-adjustment, and per-advisor reliability tracking
// ═══════════════════════════════════════════════════════════════

import type { EvidenceBundle, AdvisorSpecializationContract } from "./types";

// ── Multi-Factor Confidence Breakdown ─────────────────────

export interface ConfidenceFactors {
  evidenceSufficiency: number;     // 0-1: how much required evidence is present
  dataFreshness: number;           // 0-1: recency of data sources
  policyCertainty: number;         // 0-1: is policy state known and unambiguous
  simulationConfidence: number;    // 0-1: if simulation ran, how confident in result
  modelCertainty: number;          // 0-1: LLM-reported uncertainty (if available)
  contradictionPenalty: number;    // 0-1: penalty for detected contradictions (1 = no contradictions)
  noveltyPenalty: number;          // 0-1: penalty for unprecedented scenarios (1 = familiar)
  staleContextPenalty: number;     // 0-1: penalty for stale data (1 = all fresh)
  missingDataPenalty: number;      // 0-1: penalty for missing required inputs (1 = none missing)
  acceptanceHistoryBias: number;   // 0-1: how often this advisor's recs at this confidence are accepted
}

export interface CalibratedConfidence {
  // Final scores
  rawScore: number;
  adjustedScore: number;
  cappedScore: number;
  displayScore: number;

  // Factor breakdown
  factors: ConfidenceFactors;

  // Caps applied
  capsApplied: ConfidenceCap[];

  // Explanation
  limitingFactor: string;
  explanation: string;

  // Reliability
  advisorReliabilityAtThisLevel: number; // historical accuracy at this confidence level
  shouldAbstain: boolean;
  shouldAskClarification: boolean;
  clarificationNeeded: string[];
}

// ── Confidence Caps ───────────────────────────────────────

export type CapReason =
  | "evidence-insufficient"
  | "data-stale"
  | "policy-ambiguous"
  | "no-simulation"
  | "active-contradiction"
  | "novel-scenario"
  | "missing-critical-input"
  | "advisor-uncalibrated"
  | "trust-domain-restriction";

export interface ConfidenceCap {
  maxScore: number;
  reason: CapReason;
  description: string;
}

// ── Confidence Cap Rules ──────────────────────────────────

const CONFIDENCE_CAP_RULES: { condition: (f: ConfidenceFactors, spec?: AdvisorSpecializationContract) => boolean; cap: ConfidenceCap }[] = [
  {
    condition: (f) => f.evidenceSufficiency < 0.3,
    cap: { maxScore: 0.35, reason: "evidence-insufficient", description: "Less than 30% of required evidence is present" },
  },
  {
    condition: (f) => f.dataFreshness < 0.3,
    cap: { maxScore: 0.40, reason: "data-stale", description: "Most data sources are stale or critical" },
  },
  {
    condition: (f) => f.policyCertainty < 0.5,
    cap: { maxScore: 0.55, reason: "policy-ambiguous", description: "Policy state is ambiguous or unknown" },
  },
  {
    condition: (f, spec) => spec?.simulationPolicy === "required-for-action" && f.simulationConfidence === 0,
    cap: { maxScore: 0.45, reason: "no-simulation", description: "Simulation required but not run" },
  },
  {
    condition: (f) => f.contradictionPenalty < 0.5,
    cap: { maxScore: 0.50, reason: "active-contradiction", description: "Material contradictions detected in data" },
  },
  {
    condition: (f) => f.noveltyPenalty < 0.3,
    cap: { maxScore: 0.45, reason: "novel-scenario", description: "Unprecedented scenario with no historical pattern" },
  },
  {
    condition: (f) => f.missingDataPenalty < 0.4,
    cap: { maxScore: 0.40, reason: "missing-critical-input", description: "Critical inputs are missing" },
  },
];

// ── Compute Calibrated Confidence ─────────────────────────

export function computeCalibratedConfidence(
  factors: ConfidenceFactors,
  spec?: AdvisorSpecializationContract,
  advisorReliability: number = 0.5,
): CalibratedConfidence {
  // Step 1: Weighted raw score
  const weights = {
    evidenceSufficiency: 0.25,
    dataFreshness: 0.15,
    policyCertainty: 0.10,
    simulationConfidence: 0.10,
    modelCertainty: 0.10,
    contradictionPenalty: 0.10,
    noveltyPenalty: 0.05,
    staleContextPenalty: 0.05,
    missingDataPenalty: 0.05,
    acceptanceHistoryBias: 0.05,
  };

  const rawScore = Object.entries(weights).reduce(
    (sum, [key, weight]) => sum + (factors[key as keyof ConfidenceFactors] || 0) * weight,
    0,
  );

  // Step 2: Risk-adjusted score (trust-critical domains get penalized more)
  let adjustedScore = rawScore;
  if (spec?.trustSensitivity === "critical" || spec?.trustSensitivity === "veto-capable") {
    adjustedScore *= 0.9; // 10% trust penalty for critical domains
  }

  // Step 3: Apply confidence caps
  const capsApplied: ConfidenceCap[] = [];
  let cappedScore = adjustedScore;
  for (const rule of CONFIDENCE_CAP_RULES) {
    if (rule.condition(factors, spec)) {
      capsApplied.push(rule.cap);
      cappedScore = Math.min(cappedScore, rule.cap.maxScore);
    }
  }

  // Step 4: Apply advisor-specific floor (never report below floor unless abstaining)
  const floor = spec?.confidenceFloor || 0.3;

  // Step 5: Determine abstention and clarification
  const shouldAbstain = cappedScore < floor;
  const clarificationNeeded: string[] = [];

  if (factors.missingDataPenalty < 0.5) {
    clarificationNeeded.push("Critical data inputs are missing — please provide them");
  }
  if (factors.contradictionPenalty < 0.5) {
    clarificationNeeded.push("Contradictory data detected — please clarify which source is correct");
  }
  if (factors.policyCertainty < 0.3) {
    clarificationNeeded.push("Policy state is unclear — unable to determine constraints");
  }

  const shouldAskClarification = clarificationNeeded.length > 0 && cappedScore < 0.6;

  // Step 6: Find limiting factor
  const factorEntries = Object.entries(factors) as [keyof ConfidenceFactors, number][];
  const limitingEntry = factorEntries.reduce((min, curr) => curr[1] < min[1] ? curr : min);

  const displayScore = shouldAbstain ? 0 : Math.round(cappedScore * 100) / 100;

  return {
    rawScore: Math.round(rawScore * 100) / 100,
    adjustedScore: Math.round(adjustedScore * 100) / 100,
    cappedScore: Math.round(cappedScore * 100) / 100,
    displayScore,
    factors,
    capsApplied,
    limitingFactor: limitingEntry[0],
    explanation: capsApplied.length > 0
      ? `Confidence capped at ${Math.round(cappedScore * 100)}% due to: ${capsApplied.map(c => c.description).join("; ")}`
      : `Confidence is ${Math.round(cappedScore * 100)}% — limiting factor: ${limitingEntry[0]}`,
    advisorReliabilityAtThisLevel: advisorReliability,
    shouldAbstain,
    shouldAskClarification,
    clarificationNeeded,
  };
}

// ── Evidence Sufficiency Score ─────────────────────────────

export function computeEvidenceSufficiency(
  evidence: EvidenceBundle,
  requiredContext: string[],
  presentContext: string[],
): number {
  if (requiredContext.length === 0) return 1.0;

  const contextCoverage = presentContext.filter(c => requiredContext.includes(c)).length / requiredContext.length;
  const sourceCoverage = Math.min(evidence.totalSources / Math.max(requiredContext.length, 1), 1.0);
  const freshnessScore = evidence.overallFreshness === "fresh" ? 1.0
    : evidence.overallFreshness === "aging" ? 0.7
    : evidence.overallFreshness === "stale" ? 0.4
    : 0.15;

  const gapPenalty = Math.max(0, 1 - evidence.gapsDetected.length * 0.15);

  return Math.round((contextCoverage * 0.4 + sourceCoverage * 0.25 + freshnessScore * 0.25 + gapPenalty * 0.1) * 100) / 100;
}

// ── Per-Advisor Reliability Tracker ───────────────────────

export interface AdvisorReliabilityRecord {
  advisorId: string;
  confidenceBucket: string; // "0.0-0.2" | "0.2-0.4" | etc.
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number; // correctPredictions / totalPredictions
  calibrationError: number; // |accuracy - midpoint of bucket|
  lastUpdated: string;
}

export function computeReliabilityForBucket(
  advisorId: string,
  bucket: string,
  outcomes: { predictedConfidence: number; wasCorrect: boolean }[],
): AdvisorReliabilityRecord {
  const total = outcomes.length;
  const correct = outcomes.filter(o => o.wasCorrect).length;
  const accuracy = total > 0 ? correct / total : 0;
  const bucketMidpoint = parseBucketMidpoint(bucket);
  const calibrationError = Math.abs(accuracy - bucketMidpoint);

  return {
    advisorId,
    confidenceBucket: bucket,
    totalPredictions: total,
    correctPredictions: correct,
    accuracy: Math.round(accuracy * 100) / 100,
    calibrationError: Math.round(calibrationError * 100) / 100,
    lastUpdated: new Date().toISOString(),
  };
}

function parseBucketMidpoint(bucket: string): number {
  const parts = bucket.split("-").map(Number);
  return parts.length === 2 ? (parts[0] + parts[1]) / 2 : 0.5;
}
