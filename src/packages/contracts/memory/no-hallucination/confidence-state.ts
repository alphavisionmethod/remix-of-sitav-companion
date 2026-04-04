// ═══════════════════════════════════════════════════════════════
// SITA OS — Memory: No-Hallucination: Confidence State
// ═══════════════════════════════════════════════════════════════

export type HallucinationRiskClass = "low" | "medium" | "high" | "critical-truth";
export type DowngradeLevel = "none" | "caveat" | "low-confidence" | "refuse";

export interface ConfidenceState {
  score: number; // 0-1
  riskClass: HallucinationRiskClass;
  reasons: string[];
  missingInputs: string[];
  staleInputs: string[];
  downgradedFields: string[];
  isRefused: boolean;
}
