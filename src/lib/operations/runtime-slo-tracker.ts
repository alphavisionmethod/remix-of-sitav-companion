// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime SLO/Latency/Cost Instrumentation
//
// Continuously tracks:
//   - Edge function latency percentiles (p50/p95/p99)
//   - SLO compliance per capability
//   - Cost-per-active-user derived from AI usage ledger
//   - Drift alerts when baselines are exceeded
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

// ── Types ──────────────────────────────────────────────────────

export interface SloDefinition {
  capability: string;
  displayName: string;
  latencyP95TargetMs: number;
  latencyP99TargetMs: number;
  errorRateTargetPct: number;
  availabilityTargetPct: number;
  costPerUserCentsTarget: number;
}

export interface SloSnapshot {
  capability: string;
  windowStart: string;
  windowEnd: string;
  latencyP50Ms: number;
  latencyP95Ms: number;
  latencyP99Ms: number;
  errorRatePct: number;
  totalInvocations: number;
  successCount: number;
  failureCount: number;
  estimatedCostUsd: number;
  activeUsers: number;
  costPerActiveUserCents: number;
  sloStatus: "healthy" | "warning" | "breached";
  breachedMetrics: string[];
}

export interface DriftAlert {
  id: string;
  capability: string;
  metric: string;
  baseline: number;
  current: number;
  driftPct: number;
  severity: "warning" | "critical";
  detectedAt: string;
  acknowledged: boolean;
}

// ── SLO Definitions (canonical baselines) ──────────────────────

export const SLO_DEFINITIONS: readonly SloDefinition[] = [
  { capability: "advisor-chat", displayName: "Advisor Chat", latencyP95TargetMs: 3000, latencyP99TargetMs: 8000, errorRateTargetPct: 2, availabilityTargetPct: 99.5, costPerUserCentsTarget: 50 },
  { capability: "brain-core", displayName: "Brain Core Orchestration", latencyP95TargetMs: 5000, latencyP99TargetMs: 12000, errorRateTargetPct: 1, availabilityTargetPct: 99.9, costPerUserCentsTarget: 100 },
  { capability: "workflow-execute", displayName: "Workflow Execution", latencyP95TargetMs: 2000, latencyP99TargetMs: 5000, errorRateTargetPct: 0.5, availabilityTargetPct: 99.9, costPerUserCentsTarget: 20 },
  { capability: "connector-proxy", displayName: "Connector Proxy", latencyP95TargetMs: 1500, latencyP99TargetMs: 4000, errorRateTargetPct: 2, availabilityTargetPct: 99, costPerUserCentsTarget: 10 },
  { capability: "event-processor", displayName: "Event Processor", latencyP95TargetMs: 500, latencyP99TargetMs: 1500, errorRateTargetPct: 0.1, availabilityTargetPct: 99.99, costPerUserCentsTarget: 5 },
  { capability: "admin-api", displayName: "Admin API", latencyP95TargetMs: 1000, latencyP99TargetMs: 3000, errorRateTargetPct: 0.5, availabilityTargetPct: 99.9, costPerUserCentsTarget: 15 },
  { capability: "webhook-ingest", displayName: "Webhook Ingestion", latencyP95TargetMs: 800, latencyP99TargetMs: 2000, errorRateTargetPct: 0.1, availabilityTargetPct: 99.99, costPerUserCentsTarget: 3 },
  { capability: "ai-gateway", displayName: "AI Gateway", latencyP95TargetMs: 4000, latencyP99TargetMs: 10000, errorRateTargetPct: 3, availabilityTargetPct: 99, costPerUserCentsTarget: 200 },
] as const;

// ── Drift thresholds ───────────────────────────────────────────

const DRIFT_WARNING_PCT = 20;   // 20% above baseline → warning
const DRIFT_CRITICAL_PCT = 50;  // 50% above baseline → critical

// ── Compute percentile from sorted array ───────────────────────

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

// ── Fetch SLO snapshot for a capability ────────────────────────

export async function fetchSloSnapshot(
  capability: string,
  windowMinutes: number = 60,
): Promise<SloSnapshot | null> {
  const windowEnd = new Date();
  const windowStart = new Date(windowEnd.getTime() - windowMinutes * 60_000);

  const { data: invocations, error } = await supabase
    .from("ai_invocations")
    .select("latency_ms, status, estimated_cost_usd, user_id")
    .eq("capability_key", capability)
    .gte("created_at", windowStart.toISOString())
    .lte("created_at", windowEnd.toISOString())
    .order("created_at", { ascending: true });

  if (error || !invocations || invocations.length === 0) return null;

  const latencies = invocations
    .map(i => i.latency_ms)
    .filter((v): v is number => v !== null)
    .sort((a, b) => a - b);

  const successCount = invocations.filter(i => i.status === "success").length;
  const failureCount = invocations.filter(i => i.status !== "success").length;
  const totalCost = invocations.reduce((s, i) => s + (i.estimated_cost_usd ?? 0), 0);
  const activeUsers = new Set(invocations.map(i => i.user_id)).size;
  const costPerUser = activeUsers > 0 ? Math.round((totalCost * 100) / activeUsers) : 0;

  const slo = SLO_DEFINITIONS.find(s => s.capability === capability);
  const breached: string[] = [];

  const p95 = percentile(latencies, 95);
  const p99 = percentile(latencies, 99);
  const errorRate = invocations.length > 0 ? (failureCount / invocations.length) * 100 : 0;

  if (slo) {
    if (p95 > slo.latencyP95TargetMs) breached.push("latency_p95");
    if (p99 > slo.latencyP99TargetMs) breached.push("latency_p99");
    if (errorRate > slo.errorRateTargetPct) breached.push("error_rate");
    if (costPerUser > slo.costPerUserCentsTarget) breached.push("cost_per_user");
  }

  return {
    capability,
    windowStart: windowStart.toISOString(),
    windowEnd: windowEnd.toISOString(),
    latencyP50Ms: percentile(latencies, 50),
    latencyP95Ms: p95,
    latencyP99Ms: p99,
    errorRatePct: Math.round(errorRate * 100) / 100,
    totalInvocations: invocations.length,
    successCount,
    failureCount,
    estimatedCostUsd: Math.round(totalCost * 10000) / 10000,
    activeUsers,
    costPerActiveUserCents: costPerUser,
    sloStatus: breached.length === 0 ? "healthy" : breached.length <= 1 ? "warning" : "breached",
    breachedMetrics: breached,
  };
}

// ── Fetch all SLO snapshots ────────────────────────────────────

export async function fetchAllSloSnapshots(windowMinutes = 60): Promise<SloSnapshot[]> {
  const results: SloSnapshot[] = [];
  for (const slo of SLO_DEFINITIONS) {
    const snap = await fetchSloSnapshot(slo.capability, windowMinutes);
    if (snap) results.push(snap);
  }
  return results;
}

// ── Drift detection ────────────────────────────────────────────

export function detectDrift(
  current: SloSnapshot,
  baseline: SloSnapshot,
): DriftAlert[] {
  const alerts: DriftAlert[] = [];
  const now = new Date().toISOString();

  const check = (metric: string, baseVal: number, curVal: number) => {
    if (baseVal <= 0) return;
    const drift = ((curVal - baseVal) / baseVal) * 100;
    if (drift >= DRIFT_CRITICAL_PCT) {
      alerts.push({
        id: `drift-${current.capability}-${metric}-${Date.now()}`,
        capability: current.capability,
        metric,
        baseline: baseVal,
        current: curVal,
        driftPct: Math.round(drift),
        severity: "critical",
        detectedAt: now,
        acknowledged: false,
      });
    } else if (drift >= DRIFT_WARNING_PCT) {
      alerts.push({
        id: `drift-${current.capability}-${metric}-${Date.now()}`,
        capability: current.capability,
        metric,
        baseline: baseVal,
        current: curVal,
        driftPct: Math.round(drift),
        severity: "warning",
        detectedAt: now,
        acknowledged: false,
      });
    }
  };

  check("latency_p95", baseline.latencyP95Ms, current.latencyP95Ms);
  check("latency_p99", baseline.latencyP99Ms, current.latencyP99Ms);
  check("error_rate", baseline.errorRatePct, current.errorRatePct);
  check("cost_per_user", baseline.costPerActiveUserCents, current.costPerActiveUserCents);

  return alerts;
}

// ── Performance report generator ───────────────────────────────

export interface PerformanceReport {
  generatedAt: string;
  windowMinutes: number;
  snapshots: SloSnapshot[];
  overallHealth: "healthy" | "degraded" | "critical";
  totalInvocations: number;
  totalCostUsd: number;
  totalActiveUsers: number;
  globalCostPerUserCents: number;
  breachedSlos: string[];
  driftAlerts: DriftAlert[];
}

export async function generatePerformanceReport(
  windowMinutes = 60,
  baselines?: SloSnapshot[],
): Promise<PerformanceReport> {
  const snapshots = await fetchAllSloSnapshots(windowMinutes);
  const breached = snapshots.filter(s => s.sloStatus === "breached").map(s => s.capability);
  const totalInvocations = snapshots.reduce((s, snap) => s + snap.totalInvocations, 0);
  const totalCost = snapshots.reduce((s, snap) => s + snap.estimatedCostUsd, 0);
  const allUsers = new Set(snapshots.flatMap(s => [s.capability])); // unique capabilities as proxy
  const totalActiveUsers = snapshots.reduce((max, s) => Math.max(max, s.activeUsers), 0);
  const globalCostPerUser = totalActiveUsers > 0 ? Math.round((totalCost * 100) / totalActiveUsers) : 0;

  const driftAlerts: DriftAlert[] = [];
  if (baselines) {
    for (const snap of snapshots) {
      const baseline = baselines.find(b => b.capability === snap.capability);
      if (baseline) {
        driftAlerts.push(...detectDrift(snap, baseline));
      }
    }
  }

  const hasCritical = breached.length > 0 || driftAlerts.some(a => a.severity === "critical");
  const hasWarning = snapshots.some(s => s.sloStatus === "warning") || driftAlerts.some(a => a.severity === "warning");

  return {
    generatedAt: new Date().toISOString(),
    windowMinutes,
    snapshots,
    overallHealth: hasCritical ? "critical" : hasWarning ? "degraded" : "healthy",
    totalInvocations,
    totalCostUsd: Math.round(totalCost * 10000) / 10000,
    totalActiveUsers,
    globalCostPerUserCents: globalCostPerUser,
    breachedSlos: breached,
    driftAlerts,
  };
}