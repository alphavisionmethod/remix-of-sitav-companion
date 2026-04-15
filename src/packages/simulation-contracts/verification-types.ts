// ═══════════════════════════════════════════════════════════════
// SITA OS — Simulation Verification Types
// Result validation, predicted vs actual, confidence metrics.
// ═══════════════════════════════════════════════════════════════

export interface SimulationVerification {
  verification_id: string;
  simulation_id: string;
  simulation_type: string;
  predicted_outcomes: PredictedOutcome[];
  actual_outcomes: ActualOutcome[];
  accuracy_score: number;
  calibration_score: number;
  verified_at: string;
}

export interface PredictedOutcome {
  outcome_id: string;
  metric: string;
  predicted_value: number;
  confidence: number;
  confidence_interval: [number, number];
  predicted_at: string;
}

export interface ActualOutcome {
  outcome_id: string;
  metric: string;
  actual_value: number;
  measured_at: string;
  measurement_source: string;
}

export interface PredictedVsActual {
  metric: string;
  predicted: number;
  actual: number;
  error: number;
  error_percent: number;
  within_confidence_interval: boolean;
  direction_correct: boolean;
}

export interface SimulationConfidenceMetrics {
  simulation_type: string;
  total_simulations: number;
  avg_accuracy: number;
  avg_calibration: number;
  direction_accuracy: number;
  within_ci_rate: number;
  best_performing_scenarios: string[];
  worst_performing_scenarios: string[];
  last_evaluated_at: string;
}

export interface SimulationCalibrationReport {
  report_id: string;
  period: string;
  simulation_types: string[];
  metrics: SimulationConfidenceMetrics[];
  overall_calibration: number;
  recommendations: string[];
  generated_at: string;
}
