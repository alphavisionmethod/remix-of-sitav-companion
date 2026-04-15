// ═══════════════════════════════════════════════════════════════
// SITA OS — What-If Types
// Forecasting, tradeoff comparisons.
// ═══════════════════════════════════════════════════════════════

export interface WhatIfScenario {
  scenario_id: string;
  name: string;
  description: string;
  variables: WhatIfVariable[];
  baseline: Record<string, number>;
  projections: WhatIfProjection[];
  created_by: string;
  created_at: string;
}

export interface WhatIfVariable {
  variable_id: string;
  name: string;
  current_value: number;
  proposed_value: number;
  unit: string;
  sensitivity: number;
}

export interface WhatIfProjection {
  projection_id: string;
  time_horizon_days: number;
  metrics: ProjectedMetric[];
  confidence: number;
  assumptions: string[];
}

export interface ProjectedMetric {
  metric_name: string;
  baseline_value: number;
  projected_value: number;
  delta_percent: number;
  confidence_interval: [number, number];
  direction: "positive" | "negative" | "neutral";
}

export interface TradeoffComparison {
  comparison_id: string;
  options: TradeoffOption[];
  recommended_option?: string;
  recommendation_rationale?: string;
  compared_at: string;
}

export interface TradeoffOption {
  option_id: string;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  metrics: Record<string, number>;
  risk_score: number;
  cost_estimate_cents: number;
  time_estimate_hours: number;
  reversibility: "full" | "partial" | "irreversible";
}

export interface ForecastResult {
  forecast_id: string;
  model: string;
  horizon_days: number;
  predictions: ForecastPoint[];
  accuracy_estimate: number;
  generated_at: string;
}

export interface ForecastPoint {
  timestamp: string;
  value: number;
  lower_bound: number;
  upper_bound: number;
  confidence: number;
}
