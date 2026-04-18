// ============================================================
// SITA OS — Confidence Engine
// Creates confidence envelopes and determines downgrade need
// ============================================================

import type { ConfidenceEnvelope, HallucinationRiskClass, StalenessState, ContradictionReport } from "./types";

interface ConfidenceInputs {
  baseScore: number; // 0-1 from domain assessment
  riskClass: HallucinationRiskClass;
  missingInputs: string[];
  staleness: StalenessState;
  contradictions: ContradictionReport;
  totalExpectedFields: number;
  totalPresentFields: number;
}

export function createConfidenceEnvelope(inputs: ConfidenceInputs): ConfidenceEnvelope {
  const { baseScore, riskClass, missingInputs, staleness, contradictions, totalExpectedFields, totalPresentFields } = inputs;

  let score = baseScore;
  const reasons: string[] = [];
  const staleInputs: string[] = [];
  const downgradedFields: string[] = [];

  // Penalize missing inputs
  if (missingInputs.length > 0) {
    const missingPenalty = Math.min(missingInputs.length * 0.08, 0.4);
    score -= missingPenalty;
    reasons.push(`${missingInputs.length} required input(s) missing`);
  }

  // Penalize stale data
  const staleSources = staleness.sources.filter(s => s.isStale);
  if (staleSources.length > 0) {
    const stalePenalty = Math.min(staleSources.length * 0.1, 0.3);
    score -= stalePenalty;
    staleSources.forEach(s => staleInputs.push(s.name));
    reasons.push(`${staleSources.length} data source(s) stale`);
  }

  // Penalize contradictions
  const materialContradictions = contradictions.contradictions.filter(c => c.severity === "material");
  if (materialContradictions.length > 0) {
    const contradictionPenalty = Math.min(materialContradictions.length * 0.15, 0.4);
    score -= contradictionPenalty;
    materialContradictions.forEach(c => downgradedFields.push(c.field));
    reasons.push(`${materialContradictions.length} material contradiction(s) detected`);
  }

  // Penalize incompleteness
  const completeness = totalExpectedFields > 0 ? totalPresentFields / totalExpectedFields : 1;
  if (completeness < 0.8) {
    score -= (1 - completeness) * 0.2;
    reasons.push(`Data completeness at ${Math.round(completeness * 100)}%`);
  }

  // Apply risk class floor — critical-truth demands higher minimum
  score = Math.max(score, 0);
  score = Math.min(score, 1);

  if (reasons.length === 0 && score >= 0.85) {
    reasons.push("All inputs present and fresh");
  }

  const isRefused = shouldRefuse(score, riskClass, missingInputs.length, materialContradictions.length);

  return {
    score: Math.round(score * 100) / 100,
    riskClass,
    reasons,
    missingInputs,
    staleInputs,
    downgradedFields,
    isRefused,
  };
}

function shouldRefuse(score: number, riskClass: HallucinationRiskClass, missingCount: number, materialContradictionCount: number): boolean {
  // Critical-truth domains refuse below 0.6 or with any material contradiction
  if (riskClass === "critical-truth") {
    return score < 0.6 || materialContradictionCount > 0 || missingCount > 2;
  }
  // High-risk refuses below 0.4 or with 2+ material contradictions
  if (riskClass === "high") {
    return score < 0.4 || materialContradictionCount >= 2;
  }
  // Medium-risk refuses below 0.25
  if (riskClass === "medium") {
    return score < 0.25;
  }
  // Low-risk never refuses
  return false;
}

export function shouldDowngrade(envelope: ConfidenceEnvelope): boolean {
  if (envelope.isRefused) return true;
  if (envelope.riskClass === "critical-truth" && envelope.score < 0.8) return true;
  if (envelope.riskClass === "high" && envelope.score < 0.65) return true;
  if (envelope.riskClass === "medium" && envelope.score < 0.5) return true;
  return false;
}

export function classifyRisk(domain: string, contentType: string): HallucinationRiskClass {
  const criticalCombos: Record<string, string[]> = {
    finance: ["balance", "price", "obligation", "calculation", "approval", "execution", "verification"],
    trust: ["policy", "approval", "execution", "receipt", "proof", "verification", "permission"],
  };

  const highCombos: Record<string, string[]> = {
    finance: ["recommendation", "projection", "guidance", "warning"],
    business: ["state", "status", "payment", "workflow"],
    concierge: ["booking", "calendar", "sensitive_document"],
  };

  if (criticalCombos[domain]?.includes(contentType)) return "critical-truth";
  if (highCombos[domain]?.includes(contentType)) return "high";
  if (["summary", "follow-up", "prioritization", "review"].includes(contentType)) return "medium";
  return "low";
}
