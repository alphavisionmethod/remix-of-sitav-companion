// ═══════════════════════════════════════════════════════════════
// SITA OS — Reuse Decision Engine (3.7)
// Decides when to reuse prior intelligence vs. rethinking.
// ═══════════════════════════════════════════════════════════════

import type { IntelligenceAsset, ReuseCandidate } from "./intelligence-reuse-engine";
import type { DifferentialAnalysis } from "./differential-reasoning-engine";

export type ReuseMode = "direct_reuse" | "adapted_reuse" | "reference_only" | "do_not_reuse";

export interface ReuseDecisionInput {
  taskDescription: string;
  taskDomain: string;
  candidates: ReuseCandidate[];
  differentialResult?: DifferentialAnalysis;
  minConfidence: number;
  stakes: "low" | "medium" | "high" | "critical";
}

export interface ReuseDecisionOutput {
  mode: ReuseMode;
  selectedAsset?: IntelligenceAsset;
  adaptationNeeded: string[];
  costEstimateCents: number;
  costIfFreshCents: number;
  savingsCents: number;
  qualityRisk: "none" | "low" | "medium" | "high";
  consistencyBenefit: "none" | "low" | "medium" | "high";
  reasoning: string;
}

export function decideReuse(input: ReuseDecisionInput): ReuseDecisionOutput {
  const { candidates, differentialResult, minConfidence, stakes } = input;

  // No candidates → fresh reasoning
  if (candidates.length === 0) {
    return noReuse("No candidate assets available");
  }

  // If differential reasoning says prior is invalid, don't reuse
  if (differentialResult && !differentialResult.priorReasoningValid) {
    // But if materiality is low, reference-only is OK
    if (differentialResult.totalMateriality < 30) {
      const best = candidates[0];
      return {
        mode: "reference_only",
        selectedAsset: best.asset,
        adaptationNeeded: differentialResult.invalidationTriggers,
        costEstimateCents: Math.round(differentialResult.estimatedCostIfPartial),
        costIfFreshCents: differentialResult.estimatedCostIfFull,
        savingsCents: differentialResult.estimatedCostIfFull - differentialResult.estimatedCostIfPartial,
        qualityRisk: "low",
        consistencyBenefit: "medium",
        reasoning: "Prior reasoning partially invalidated but materiality is low — using as reference",
      };
    }
    return noReuse("Prior reasoning invalidated by material changes");
  }

  // Sort candidates by composite score
  const sorted = [...candidates].sort((a, b) => b.compositeScore - a.compositeScore);
  const best = sorted[0];

  // Check if best candidate meets thresholds
  if (best.similarityScore < 0.6) return noReuse(`Best candidate similarity too low: ${(best.similarityScore * 100).toFixed(0)}%`);
  if (best.freshnessScore < 0.3) return noReuse("Best candidate is stale");
  if (best.asset.confidence < minConfidence) return noReuse("Best candidate confidence below threshold");

  // High-stakes require higher similarity
  if (stakes === "critical" && best.similarityScore < 0.85) {
    return {
      mode: "reference_only",
      selectedAsset: best.asset,
      adaptationNeeded: ["Critical stakes require verification"],
      costEstimateCents: Math.round(best.estimatedSavingsCents * 0.5),
      costIfFreshCents: best.estimatedSavingsCents,
      savingsCents: Math.round(best.estimatedSavingsCents * 0.5),
      qualityRisk: "medium",
      consistencyBenefit: "high",
      reasoning: "Critical stakes — using as reference only despite good similarity",
    };
  }

  // Direct reuse conditions
  if (best.similarityScore >= 0.9 && best.freshnessScore >= 0.8 && !best.adaptationRequired) {
    return {
      mode: "direct_reuse",
      selectedAsset: best.asset,
      adaptationNeeded: [],
      costEstimateCents: Math.round(best.estimatedSavingsCents * 0.05),
      costIfFreshCents: best.estimatedSavingsCents,
      savingsCents: Math.round(best.estimatedSavingsCents * 0.95),
      qualityRisk: "none",
      consistencyBenefit: "high",
      reasoning: "High similarity + fresh + no adaptation needed → direct reuse",
    };
  }

  // Adapted reuse
  if (best.similarityScore >= 0.7 && best.adaptationComplexity !== "significant") {
    const adaptCostFraction = best.adaptationComplexity === "trivial" ? 0.15 : 0.35;
    return {
      mode: "adapted_reuse",
      selectedAsset: best.asset,
      adaptationNeeded: ["Context adjustment", "Freshness verification"],
      costEstimateCents: Math.round(best.estimatedSavingsCents * adaptCostFraction),
      costIfFreshCents: best.estimatedSavingsCents,
      savingsCents: Math.round(best.estimatedSavingsCents * (1 - adaptCostFraction)),
      qualityRisk: "low",
      consistencyBenefit: "medium",
      reasoning: `Good similarity with ${best.adaptationComplexity} adaptation needed`,
    };
  }

  // Reference only
  return {
    mode: "reference_only",
    selectedAsset: best.asset,
    adaptationNeeded: ["Significant rework needed"],
    costEstimateCents: Math.round(best.estimatedSavingsCents * 0.7),
    costIfFreshCents: best.estimatedSavingsCents,
    savingsCents: Math.round(best.estimatedSavingsCents * 0.3),
    qualityRisk: "medium",
    consistencyBenefit: "low",
    reasoning: "Candidate is relevant but needs significant adaptation",
  };
}

function noReuse(reason: string): ReuseDecisionOutput {
  return {
    mode: "do_not_reuse",
    adaptationNeeded: [],
    costEstimateCents: 120,
    costIfFreshCents: 120,
    savingsCents: 0,
    qualityRisk: "none",
    consistencyBenefit: "none",
    reasoning: reason,
  };
}
