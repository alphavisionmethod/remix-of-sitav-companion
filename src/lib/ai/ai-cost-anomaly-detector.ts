// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Cost Anomaly Detector
// Extends CostAnomaly from compute-governance/margin-protection.ts
// with capability-level anomaly detection rules.
// ═══════════════════════════════════════════════════════════════

export type AICostAnomalyType =
  | "per-capability-spike"
  | "per-provider-spike"
  | "fallback-induced-cost"
  | "advisor-boardroom-runaway"
  | "budget-bypass-risk"
  | "noisy-retry-loop";

export type AlertSeverity = "info" | "warning" | "critical";
export type AnomalyMitigation = "alert-only" | "model-downgrade" | "pause-capability" | "pause-autonomy" | "block-and-escalate";

export interface AICostAnomalyRule {
  ruleId: string;
  anomalyType: AICostAnomalyType;
  description: string;
  threshold: string;
  detectionWindow: string;
  mitigation: AnomalyMitigation;
  alertSeverity: AlertSeverity;
}

export const AI_COST_ANOMALY_RULES: readonly AICostAnomalyRule[] = [
  { ruleId: "AICA-001", anomalyType: "per-capability-spike", description: "Single capability cost exceeds 3x rolling 7-day average", threshold: "3x_7d_avg", detectionWindow: "1h", mitigation: "alert-only", alertSeverity: "warning" },
  { ruleId: "AICA-002", anomalyType: "per-capability-spike", description: "Single capability cost exceeds 5x rolling 7-day average", threshold: "5x_7d_avg", detectionWindow: "1h", mitigation: "model-downgrade", alertSeverity: "critical" },
  { ruleId: "AICA-003", anomalyType: "per-provider-spike", description: "Provider cost exceeds 2x daily expected", threshold: "2x_daily_expected", detectionWindow: "4h", mitigation: "alert-only", alertSeverity: "warning" },
  { ruleId: "AICA-004", anomalyType: "fallback-induced-cost", description: "Fallback chain producing >50% cost increase over primary", threshold: "50%_primary_cost", detectionWindow: "1h", mitigation: "alert-only", alertSeverity: "warning" },
  { ruleId: "AICA-005", anomalyType: "fallback-induced-cost", description: "Fallback chain producing >200% cost increase over primary", threshold: "200%_primary_cost", detectionWindow: "1h", mitigation: "pause-capability", alertSeverity: "critical" },
  { ruleId: "AICA-006", anomalyType: "advisor-boardroom-runaway", description: "Advisor/boardroom invocations exceed 10x normal rate", threshold: "10x_normal_rate", detectionWindow: "30m", mitigation: "pause-autonomy", alertSeverity: "critical" },
  { ruleId: "AICA-007", anomalyType: "budget-bypass-risk", description: "Invocations detected without budget gate check", threshold: "any_unbudgeted", detectionWindow: "continuous", mitigation: "block-and-escalate", alertSeverity: "critical" },
  { ruleId: "AICA-008", anomalyType: "noisy-retry-loop", description: "More than 5 retries for same capability within 5 minutes", threshold: "5_retries_5m", detectionWindow: "5m", mitigation: "pause-capability", alertSeverity: "warning" },
] as const;

export function getAnomalyRulesByType(anomalyType: AICostAnomalyType): AICostAnomalyRule[] {
  return AI_COST_ANOMALY_RULES.filter((r) => r.anomalyType === anomalyType);
}

export function getCriticalAnomalyRules(): AICostAnomalyRule[] {
  return AI_COST_ANOMALY_RULES.filter((r) => r.alertSeverity === "critical");
}