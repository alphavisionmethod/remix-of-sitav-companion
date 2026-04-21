// ═══════════════════════════════════════════════════════════════
// SITA OS — Boardroom Outcome Scoring
// Quality model tying recommendations to outcomes.
// References boardroom_outcome_records and followthrough_dispatches.
// ═══════════════════════════════════════════════════════════════

export interface BoardroomQualityDimension {
  dimensionId: string;
  name: string;
  weight: number;
  description: string;
  scoringMethod: string;
}

export const BOARDROOM_QUALITY_DIMENSIONS: readonly BoardroomQualityDimension[] = [
  { dimensionId: "evidence-quality", name: "Evidence Quality", weight: 0.20, description: "Quality and completeness of evidence supporting the recommendation", scoringMethod: "evidence-grade-weighted-average" },
  { dimensionId: "approval-outcome", name: "Approval Outcome", weight: 0.15, description: "Whether the recommendation was approved, rejected, or deferred", scoringMethod: "binary-with-context" },
  { dimensionId: "execution-success", name: "Execution Success", weight: 0.25, description: "Whether the approved action executed successfully", scoringMethod: "completion-rate" },
  { dimensionId: "reversibility", name: "Reversibility", weight: 0.10, description: "Whether the action was reversible and if rollback was needed", scoringMethod: "rollback-penalty" },
  { dimensionId: "downstream-impact", name: "Downstream Impact", weight: 0.20, description: "Measurable impact on business, financial, or operational metrics", scoringMethod: "metric-delta" },
  { dimensionId: "confidence-calibration", name: "Confidence Calibration", weight: 0.10, description: "How well the stated confidence matched the actual outcome", scoringMethod: "brier-score-proxy" },
];

export interface RecommendationOutcome {
  recommendationId: string;
  evidenceGrade: string;
  wasApproved: boolean;
  wasExecuted: boolean;
  executionSucceeded: boolean;
  wasReversed: boolean;
  rollbackNeeded: boolean;
  statedConfidence: number;
  actualOutcomePositive: boolean;
  downstreamMetricDelta: number;
}

export function scoreBoardroomOutcome(outcome: RecommendationOutcome): number {
  const gradeScores: Record<string, number> = { A: 100, B: 80, C: 60, D: 40, F: 10 };
  const evidenceScore = gradeScores[outcome.evidenceGrade] ?? 50;

  const approvalScore = outcome.wasApproved ? 100 : 30;

  let executionScore = 0;
  if (!outcome.wasExecuted) executionScore = 50;
  else if (outcome.executionSucceeded) executionScore = 100;
  else executionScore = 10;

  let reversibilityScore = 100;
  if (outcome.rollbackNeeded) reversibilityScore = outcome.wasReversed ? 40 : 10;

  const downstreamScore = Math.min(100, Math.max(0, 50 + outcome.downstreamMetricDelta * 50));

  const brierProxy = 1 - Math.abs(outcome.statedConfidence - (outcome.actualOutcomePositive ? 1 : 0));
  const calibrationScore = brierProxy * 100;

  const totalScore =
    evidenceScore * 0.20 +
    approvalScore * 0.15 +
    executionScore * 0.25 +
    reversibilityScore * 0.10 +
    downstreamScore * 0.20 +
    calibrationScore * 0.10;

  return Math.round(Math.min(100, Math.max(0, totalScore)));
}