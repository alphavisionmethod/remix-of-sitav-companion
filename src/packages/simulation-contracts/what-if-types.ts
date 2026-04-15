// ═══════════════════════════════════════════════════════════════
// SITA OS — What-If Types (Production-Grade)
// Forecasting, tradeoff comparisons, multi-variable analysis,
// sensitivity analysis, Monte Carlo integration.
// ═══════════════════════════════════════════════════════════════

export type ForecastModel = "linear" | "exponential" | "polynomial" | "arima" | "monte_carlo" | "ensemble" | "ml_based";

export type TradeoffDimension = "cost" | "time" | "quality" | "risk" | "revenue" | "satisfaction" | "compliance" | "scalability";

// ── Scenario ──

export interface WhatIfScenario {
  scenario_id: string;
  name: string;
  description: string;
  domain: string;
  variables: WhatIfVariable[];
  constraints: WhatIfConstraint[];
  baseline: Record<string, number>;
  projections: WhatIfProjection[];
  sensitivity_analysis?: SensitivityAnalysis;
  monte_carlo_config?: MonteCarloConfig;
  created_by: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  shared_with: string[];
}

export interface WhatIfVariable {
  variable_id: string;
  name: string;
  description: string;
  current_value: number;
  proposed_value: number;
  min_value: number;
  max_value: number;
  step_size: number;
  unit: string;
  sensitivity: number;
  distribution?: "normal" | "uniform" | "triangular" | "beta" | "custom";
  distribution_params?: Record<string, number>;
  correlated_with?: CorrelatedVariable[];
}

export interface CorrelatedVariable {
  variable_id: string;
  correlation_coefficient: number;
  lag_periods: number;
}

export interface WhatIfConstraint {
  constraint_id: string;
  name: string;
  expression: string;
  type: "hard" | "soft";
  violation_penalty?: number;
}

// ── Projections ──

export interface WhatIfProjection {
  projection_id: string;
  time_horizon_days: number;
  forecast_model: ForecastModel;
  metrics: ProjectedMetric[];
  confidence: number;
  assumptions: WhatIfAssumption[];
  risks: ProjectionRisk[];
  scenario_narrative: string;
  model_accuracy_history: number;
}

export interface ProjectedMetric {
  metric_name: string;
  metric_description: string;
  baseline_value: number;
  projected_value: number;
  best_case_value: number;
  worst_case_value: number;
  delta_absolute: number;
  delta_percent: number;
  confidence_interval: [number, number];
  prediction_interval: [number, number];
  direction: "positive" | "negative" | "neutral";
  significance: "high" | "medium" | "low";
  time_series?: TimeSeriesPoint[];
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  lower_bound: number;
  upper_bound: number;
  confidence: number;
}

export interface WhatIfAssumption {
  assumption_id: string;
  description: string;
  confidence: number;
  sensitivity: number;
  source: string;
  validatable: boolean;
}

export interface ProjectionRisk {
  risk_id: string;
  description: string;
  probability: number;
  impact: number;
  mitigation?: string;
  triggers: string[];
}

// ── Sensitivity Analysis ──

export interface SensitivityAnalysis {
  analysis_id: string;
  method: "one_at_a_time" | "morris" | "sobol" | "correlation";
  results: SensitivityResult[];
  most_influential_variables: string[];
  interaction_effects: InteractionEffect[];
  tornado_data: TornadoEntry[];
}

export interface SensitivityResult {
  variable_id: string;
  variable_name: string;
  sensitivity_index: number;
  total_effect_index: number;
  direction: "positive" | "negative" | "nonlinear";
  elasticity: number;
  breakpoint_value?: number;
}

export interface InteractionEffect {
  variables: string[];
  interaction_strength: number;
  effect_type: "synergistic" | "antagonistic" | "independent";
}

export interface TornadoEntry {
  variable_name: string;
  low_impact: number;
  high_impact: number;
  base_impact: number;
  range: number;
}

// ── Monte Carlo ──

export interface MonteCarloConfig {
  iterations: number;
  seed?: number;
  convergence_threshold: number;
  max_time_seconds: number;
  output_percentiles: number[];
  correlation_matrix?: number[][];
}

export interface MonteCarloResult {
  result_id: string;
  iterations_run: number;
  converged: boolean;
  metrics: MonteCarloMetricResult[];
  execution_time_ms: number;
  seed_used: number;
}

export interface MonteCarloMetricResult {
  metric_name: string;
  mean: number;
  median: number;
  std_dev: number;
  percentiles: Record<string, number>;
  min: number;
  max: number;
  skewness: number;
  kurtosis: number;
  probability_positive: number;
  value_at_risk_95: number;
}

// ── Tradeoff Comparison ──

export interface TradeoffComparison {
  comparison_id: string;
  name: string;
  description: string;
  dimensions: TradeoffDimension[];
  dimension_weights: Record<TradeoffDimension, number>;
  options: TradeoffOption[];
  pareto_optimal: string[];
  recommended_option?: string;
  recommendation_rationale?: string;
  recommendation_confidence: number;
  sensitivity_to_weights: Record<string, number>;
  compared_at: string;
  compared_by: string;
}

export interface TradeoffOption {
  option_id: string;
  name: string;
  description: string;
  pros: TradeoffPro[];
  cons: TradeoffCon[];
  metrics: Record<string, number>;
  normalized_scores: Record<TradeoffDimension, number>;
  weighted_score: number;
  risk_score: number;
  cost_estimate_cents: number;
  time_estimate_hours: number;
  reversibility: "full" | "partial" | "irreversible";
  dependencies: string[];
  constraints_violated: string[];
  feasibility_score: number;
}

export interface TradeoffPro {
  description: string;
  dimension: TradeoffDimension;
  impact: number;
  confidence: number;
}

export interface TradeoffCon {
  description: string;
  dimension: TradeoffDimension;
  impact: number;
  mitigatable: boolean;
  mitigation?: string;
}

// ── Forecast ──

export interface ForecastResult {
  forecast_id: string;
  model: ForecastModel;
  domain: string;
  metric_name: string;
  horizon_days: number;
  predictions: ForecastPoint[];
  accuracy_estimate: number;
  model_diagnostics: ModelDiagnostics;
  generated_at: string;
}

export interface ForecastPoint {
  timestamp: string;
  value: number;
  lower_bound: number;
  upper_bound: number;
  confidence: number;
  anomaly_flag: boolean;
}

export interface ModelDiagnostics {
  r_squared: number;
  mape: number;
  rmse: number;
  mae: number;
  aic?: number;
  bic?: number;
  residual_normality: boolean;
  autocorrelation_clean: boolean;
}
