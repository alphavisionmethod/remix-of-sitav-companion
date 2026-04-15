// ═══════════════════════════════════════════════════════════════
// SITA OS — Simulation Verification Types (Production-Grade)
// Result validation, predicted vs actual, confidence metrics,
// calibration, model selection, continuous improvement.
// ═══════════════════════════════════════════════════════════════

export type VerificationStatus = "pending" | "in_progress" | "verified" | "failed" | "inconclusive" | "expired";

export type CalibrationGrade = "excellent" | "good" | "fair" | "poor" | "uncalibrated";

// ── Verification ──

export interface SimulationVerification {
  verification_id: string;
  simulation_id: string;
  simulation_type: string;
  simulation_model: string;
  verification_status: VerificationStatus;
  predicted_outcomes: PredictedOutcome[];
  actual_outcomes: ActualOutcome[];
  comparisons: PredictedVsActual[];
  accuracy_score: number;
  calibration_score: number;
  calibration_grade: CalibrationGrade;
  direction_accuracy: number;
  magnitude_accuracy: number;
  timing_accuracy: number;
  bias_detected: boolean;
  bias_direction?: "optimistic" | "pessimistic";
  bias_magnitude?: number;
  sample_size: number;
  statistical_significance: boolean;
  p_value?: number;
  verified_at: string;
  verified_by: string;
  verification_method: "automated" | "manual" | "hybrid";
  notes?: string;
}

export interface PredictedOutcome {
  outcome_id: string;
  metric: string;
  metric_description: string;
  predicted_value: number;
  confidence: number;
  confidence_interval: [number, number];
  prediction_interval: [number, number];
  predicted_at: string;
  model_version: string;
  input_hash: string;
}

export interface ActualOutcome {
  outcome_id: string;
  metric: string;
  actual_value: number;
  measured_at: string;
  measurement_source: string;
  measurement_confidence: number;
  measurement_method: string;
  data_quality: "high" | "medium" | "low";
}

// ── Comparison ──

export interface PredictedVsActual {
  metric: string;
  predicted: number;
  actual: number;
  error: number;
  error_percent: number;
  absolute_error: number;
  squared_error: number;
  within_confidence_interval: boolean;
  within_prediction_interval: boolean;
  direction_correct: boolean;
  magnitude_accuracy: number;
  lag_days?: number;
  explanation?: string;
}

// ── Confidence Metrics ──

export interface SimulationConfidenceMetrics {
  simulation_type: string;
  model_version: string;
  total_simulations: number;
  total_verified: number;
  avg_accuracy: number;
  median_accuracy: number;
  std_dev_accuracy: number;
  avg_calibration: number;
  calibration_grade: CalibrationGrade;
  direction_accuracy: number;
  within_ci_rate: number;
  within_pi_rate: number;
  bias: number;
  bias_direction: "optimistic" | "pessimistic" | "neutral";
  mape: number;
  rmse: number;
  mae: number;
  best_performing_scenarios: string[];
  worst_performing_scenarios: string[];
  performance_by_horizon: Record<string, number>;
  performance_by_category: Record<string, number>;
  improvement_trend: "improving" | "stable" | "degrading";
  improvement_rate: number;
  last_evaluated_at: string;
}

// ── Calibration Report ──

export interface SimulationCalibrationReport {
  report_id: string;
  period: string;
  simulation_types: string[];
  metrics: SimulationConfidenceMetrics[];
  overall_calibration: number;
  overall_grade: CalibrationGrade;
  calibration_curve: CalibrationPoint[];
  reliability_diagram: ReliabilityBin[];
  sharpness_score: number;
  resolution_score: number;
  overconfidence_detected: boolean;
  underconfidence_detected: boolean;
  recommendations: CalibrationRecommendation[];
  model_selection_advice: ModelSelectionAdvice[];
  generated_at: string;
}

export interface CalibrationPoint {
  predicted_probability: number;
  observed_frequency: number;
  sample_count: number;
  deviation: number;
}

export interface ReliabilityBin {
  bin_start: number;
  bin_end: number;
  predicted_avg: number;
  observed_avg: number;
  count: number;
  gap: number;
}

export interface CalibrationRecommendation {
  recommendation_id: string;
  category: "bias_correction" | "confidence_adjustment" | "model_switch" | "data_improvement" | "feature_engineering";
  description: string;
  expected_improvement: number;
  effort: "low" | "medium" | "high";
  priority: number;
  auto_applicable: boolean;
}

export interface ModelSelectionAdvice {
  scenario_type: string;
  current_model: string;
  recommended_model: string;
  expected_accuracy_improvement: number;
  expected_cost_change: number;
  rationale: string;
}

// ── Continuous Improvement ──

export interface SimulationImprovementTracker {
  tracker_id: string;
  simulation_type: string;
  baseline_accuracy: number;
  current_accuracy: number;
  target_accuracy: number;
  improvements_applied: ImprovementEntry[];
  experiments_running: ExperimentEntry[];
  next_review_at: string;
}

export interface ImprovementEntry {
  improvement_id: string;
  description: string;
  applied_at: string;
  accuracy_before: number;
  accuracy_after: number;
  impact: number;
}

export interface ExperimentEntry {
  experiment_id: string;
  hypothesis: string;
  model_variant: string;
  started_at: string;
  sample_size: number;
  preliminary_result?: number;
  status: "running" | "completed" | "abandoned";
}
