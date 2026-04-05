// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Margin Protection System
// Detects runaway cost, waste, and unprofitable behavior.
// Responds with intelligent downgrades, not punitive throttling.
// ═══════════════════════════════════════════════════════════════

export type AnomalyType =
  | "runaway-inference"
  | "low-value-high-cost"
  | "retry-storm"
  | "routing-spike"
  | "low-cache-efficiency"
  | "repeated-deep-no-value"
  | "unprofitable-tenant"
  | "autonomy-waste"
  | "prompt-loop"
  | "model-failure-drift"
  | "abuse-pattern";

export type MitigationAction =
  | "model-downgrade"
  | "compression-increase"
  | "async-mode"
  | "use-cached-summary"
  | "require-deep-approval"
  | "digest-mode"
  | "suggest-upgrade"
  | "throttle-premium"
  | "pause-autonomy"
  | "alert-operator"
  | "block-and-escalate";

export interface CostAnomaly {
  anomalyId: string;
  type: AnomalyType;
  severity: "info" | "warning" | "critical";
  tenantId: string;
  workspaceId?: string;
  agentId?: string;
  description: string;
  currentCostCents: number;
  expectedCostCents: number;
  deviationPct: number;
  detectedAt: string;
  suggestedMitigations: MitigationAction[];
  autoMitigationApplied?: MitigationAction;
  resolved: boolean;
  resolvedAt?: string;
}

export interface MarginSnapshot {
  snapshotId: string;
  tenantId: string;
  period: string;
  revenueCents: number;
  aiCostCents: number;
  infrastructureCostCents: number;
  grossMarginPct: number;
  marginTrend: "improving" | "stable" | "declining" | "critical";
  topCostDrivers: Array<{ source: string; costCents: number; pctOfTotal: number }>;
  wasteEstimateCents: number;
  anomalies: CostAnomaly[];
  timestamp: string;
}

export interface TenantEconomics {
  tenantId: string;
  planTier: string;
  mrr: number;
  totalAiCostCents: number;
  marginPct: number;
  cacheHitRate: number;
  avgCostClassDistribution: Record<string, number>;
  deepReasoningUsagePct: number;
  proactiveMonitoringCost: number;
  isHealthy: boolean;
  recommendations: string[];
}

// ── Anomaly Detection ───────────────────────────────────────

export function detectAnomalies(
  currentCostCents: number,
  expectedCostCents: number,
  windowMinutes: number,
  context: { tenantId: string; workspaceId?: string; agentId?: string; retryCount?: number; cacheHitRate?: number },
): CostAnomaly[] {
  const anomalies: CostAnomaly[] = [];
  const deviation = expectedCostCents > 0 ? ((currentCostCents - expectedCostCents) / expectedCostCents) * 100 : 0;
  const now = new Date().toISOString();

  // Runaway inference: >200% of expected
  if (deviation > 200) {
    anomalies.push({
      anomalyId: crypto.randomUUID(), type: "runaway-inference", severity: "critical",
      tenantId: context.tenantId, workspaceId: context.workspaceId, agentId: context.agentId,
      description: `Cost ${deviation.toFixed(0)}% above expected in ${windowMinutes}min window`,
      currentCostCents, expectedCostCents, deviationPct: deviation,
      detectedAt: now,
      suggestedMitigations: ["model-downgrade", "pause-autonomy", "alert-operator"],
      resolved: false,
    });
  } else if (deviation > 50) {
    anomalies.push({
      anomalyId: crypto.randomUUID(), type: "routing-spike", severity: "warning",
      tenantId: context.tenantId, workspaceId: context.workspaceId,
      description: `Cost ${deviation.toFixed(0)}% above expected`,
      currentCostCents, expectedCostCents, deviationPct: deviation,
      detectedAt: now,
      suggestedMitigations: ["compression-increase", "async-mode"],
      resolved: false,
    });
  }

  // Retry storm
  if (context.retryCount && context.retryCount > 5) {
    anomalies.push({
      anomalyId: crypto.randomUUID(), type: "retry-storm", severity: "warning",
      tenantId: context.tenantId, workspaceId: context.workspaceId,
      description: `${context.retryCount} retries detected — possible loop`,
      currentCostCents, expectedCostCents, deviationPct: deviation,
      detectedAt: now,
      suggestedMitigations: ["pause-autonomy", "require-deep-approval"],
      resolved: false,
    });
  }

  // Low cache efficiency
  if (context.cacheHitRate !== undefined && context.cacheHitRate < 0.1) {
    anomalies.push({
      anomalyId: crypto.randomUUID(), type: "low-cache-efficiency", severity: "info",
      tenantId: context.tenantId,
      description: `Cache hit rate only ${(context.cacheHitRate * 100).toFixed(0)}% — optimization available`,
      currentCostCents, expectedCostCents, deviationPct: deviation,
      detectedAt: now,
      suggestedMitigations: ["use-cached-summary", "digest-mode"],
      resolved: false,
    });
  }

  return anomalies;
}

// ── Margin Calculation ──────────────────────────────────────

export function calculateMargin(
  revenueCents: number,
  aiCostCents: number,
  infraCostCents: number,
): { grossMarginPct: number; trend: MarginSnapshot["marginTrend"] } {
  const totalCost = aiCostCents + infraCostCents;
  const grossMarginPct = revenueCents > 0 ? ((revenueCents - totalCost) / revenueCents) * 100 : 0;

  let trend: MarginSnapshot["marginTrend"] = "stable";
  if (grossMarginPct < 20) trend = "critical";
  else if (grossMarginPct < 40) trend = "declining";
  else if (grossMarginPct > 70) trend = "improving";

  return { grossMarginPct, trend };
}

// ── Auto-Mitigation ─────────────────────────────────────────

export function selectMitigation(anomaly: CostAnomaly): MitigationAction {
  switch (anomaly.type) {
    case "runaway-inference": return anomaly.severity === "critical" ? "pause-autonomy" : "model-downgrade";
    case "retry-storm": return "pause-autonomy";
    case "low-cache-efficiency": return "use-cached-summary";
    case "repeated-deep-no-value": return "require-deep-approval";
    case "unprofitable-tenant": return "suggest-upgrade";
    case "autonomy-waste": return "pause-autonomy";
    case "prompt-loop": return "block-and-escalate";
    default: return "alert-operator";
  }
}
