// ═══════════════════════════════════════════════════════════════
// SITA OS — SLO Tracking
// Service Level Objective definitions, tracking, and error budgets
// ═══════════════════════════════════════════════════════════════

export interface SLODefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly service: string;
  readonly metric: string;
  readonly target: number; // e.g., 0.99 = 99%
  readonly windowDays: number;
  readonly type: "availability" | "latency" | "error_rate" | "throughput";
  readonly thresholdValue?: number; // e.g., 500 for "p95 < 500ms"
}

export interface SLOStatus {
  readonly slo: SLODefinition;
  readonly currentValue: number;
  readonly isMet: boolean;
  readonly errorBudgetTotal: number;
  readonly errorBudgetRemaining: number;
  readonly errorBudgetPercent: number;
  readonly burnRate: number; // 1.0 = normal, >1 = burning fast
  readonly trend: "improving" | "stable" | "degrading";
  readonly lastUpdated: number;
}

// ── Canonical SLO Definitions ──────────────────────────────

export const SITA_SLOS: SLODefinition[] = [
  {
    id: "api-availability",
    name: "API Availability",
    description: "Edge functions return 2xx/4xx (non-5xx) responses",
    service: "edge-functions",
    metric: "availability",
    target: 0.995,
    windowDays: 30,
    type: "availability",
  },
  {
    id: "api-latency-p95",
    name: "API Latency (p95)",
    description: "95th percentile API response time under threshold",
    service: "edge-functions",
    metric: "latency_p95",
    target: 0.95,
    windowDays: 30,
    type: "latency",
    thresholdValue: 2000, // 2s
  },
  {
    id: "db-query-latency",
    name: "Database Query Latency (p95)",
    description: "95th percentile DB query time under 500ms",
    service: "supabase-postgres",
    metric: "query_latency_p95",
    target: 0.95,
    windowDays: 30,
    type: "latency",
    thresholdValue: 500,
  },
  {
    id: "auth-availability",
    name: "Auth System Availability",
    description: "Authentication endpoints available",
    service: "supabase-auth",
    metric: "availability",
    target: 0.999,
    windowDays: 30,
    type: "availability",
  },
  {
    id: "ai-gateway-availability",
    name: "AI Gateway Availability",
    description: "AI completions requests succeed",
    service: "lovable-ai-gateway",
    metric: "availability",
    target: 0.98,
    windowDays: 30,
    type: "availability",
  },
  {
    id: "ai-latency-p95",
    name: "AI Response Latency (p95)",
    description: "95th percentile AI response time under 10s",
    service: "lovable-ai-gateway",
    metric: "latency_p95",
    target: 0.90,
    windowDays: 30,
    type: "latency",
    thresholdValue: 10_000,
  },
  {
    id: "frontend-lcp",
    name: "Frontend LCP",
    description: "Largest Contentful Paint under 2.5s",
    service: "sita-frontend",
    metric: "lcp",
    target: 0.90,
    windowDays: 7,
    type: "latency",
    thresholdValue: 2500,
  },
  {
    id: "frontend-cls",
    name: "Frontend CLS",
    description: "Cumulative Layout Shift under 0.1",
    service: "sita-frontend",
    metric: "cls",
    target: 0.90,
    windowDays: 7,
    type: "latency",
    thresholdValue: 0.1,
  },
  {
    id: "push-delivery",
    name: "Push Notification Delivery",
    description: "Push notifications delivered successfully",
    service: "push-dispatch",
    metric: "delivery_rate",
    target: 0.95,
    windowDays: 30,
    type: "availability",
  },
  {
    id: "error-rate",
    name: "Client Error Rate",
    description: "Unhandled JS errors per session under threshold",
    service: "sita-frontend",
    metric: "error_rate",
    target: 0.99,
    windowDays: 7,
    type: "error_rate",
  },
];

// ── SLO Computation ────────────────────────────────────────

export function computeErrorBudget(target: number, windowDays: number): number {
  // Total allowed bad minutes in the window
  const totalMinutes = windowDays * 24 * 60;
  return totalMinutes * (1 - target);
}

export function computeSLOStatus(
  slo: SLODefinition,
  goodEvents: number,
  totalEvents: number,
  previousValue?: number,
): SLOStatus {
  const currentValue = totalEvents > 0 ? goodEvents / totalEvents : 1;
  const isMet = currentValue >= slo.target;
  const errorBudgetTotal = 1 - slo.target;
  const errorBudgetConsumed = Math.max(0, slo.target - currentValue);
  const errorBudgetRemaining = Math.max(0, errorBudgetTotal - errorBudgetConsumed);
  const errorBudgetPercent = errorBudgetTotal > 0 ? (errorBudgetRemaining / errorBudgetTotal) * 100 : 100;

  // Burn rate: how fast are we consuming error budget
  const burnRate = errorBudgetTotal > 0 ? errorBudgetConsumed / errorBudgetTotal : 0;

  // Trend
  let trend: SLOStatus["trend"] = "stable";
  if (previousValue !== undefined) {
    if (currentValue > previousValue + 0.001) trend = "improving";
    else if (currentValue < previousValue - 0.001) trend = "degrading";
  }

  return {
    slo,
    currentValue,
    isMet,
    errorBudgetTotal,
    errorBudgetRemaining,
    errorBudgetPercent,
    burnRate,
    trend,
    lastUpdated: Date.now(),
  };
}

// ── Alerting thresholds ────────────────────────────────────

export type AlertSeverity = "info" | "warning" | "critical";

export function getErrorBudgetAlertSeverity(percentRemaining: number): AlertSeverity | null {
  if (percentRemaining <= 0) return "critical";
  if (percentRemaining <= 25) return "critical";
  if (percentRemaining <= 50) return "warning";
  if (percentRemaining <= 75) return "info";
  return null;
}
