// ═══════════════════════════════════════════════════════════════
// SITA OS — Recovery Metrics Model (Wave 21)
// Time-to-recovery metric computation from execution receipts.
// ═══════════════════════════════════════════════════════════════

import type { RecoveryReceipt } from "./recovery-execution-engine";

export interface RecoveryTimingMetrics {
  readonly executionId: string;
  readonly runbookRef: string;
  readonly source: "drill" | "live";
  readonly triageMs: number;
  readonly firstRemediationMs: number;
  readonly partialRecoveryMs: number | null;
  readonly fullRecoveryMs: number | null;
  readonly closureMs: number;
  readonly totalSteps: number;
  readonly successfulSteps: number;
  readonly failedSteps: number;
  readonly skippedSteps: number;
}

export function computeMetrics(receipt: RecoveryReceipt, source: "drill" | "live" = "live"): RecoveryTimingMetrics {
  const steps = receipt.steps;
  const firstStep = steps[0];
  const firstSuccess = steps.find((s) => s.status === "success");
  const totalMs = steps.reduce((sum, s) => sum + s.durationMs, 0);

  return {
    executionId: receipt.executionId,
    runbookRef: receipt.runbookRef,
    source,
    triageMs: firstStep?.durationMs ?? 0,
    firstRemediationMs: firstSuccess ? steps.slice(0, steps.indexOf(firstSuccess) + 1).reduce((s, st) => s + st.durationMs, 0) : totalMs,
    partialRecoveryMs: receipt.overallStatus !== "failed" ? steps.filter((s) => s.status === "success").reduce((s, st) => s + st.durationMs, 0) : null,
    fullRecoveryMs: receipt.overallStatus === "success" ? totalMs : null,
    closureMs: totalMs,
    totalSteps: steps.length,
    successfulSteps: steps.filter((s) => s.status === "success").length,
    failedSteps: steps.filter((s) => s.status === "failed").length,
    skippedSteps: steps.filter((s) => s.status === "skipped").length,
  };
}

export interface RecoveryMetricsSummary {
  readonly totalRecoveries: number;
  readonly avgTriageMs: number;
  readonly avgFullRecoveryMs: number | null;
  readonly successRate: number;
  readonly drillCount: number;
  readonly liveCount: number;
}

export function summarizeMetrics(metrics: readonly RecoveryTimingMetrics[]): RecoveryMetricsSummary {
  if (metrics.length === 0) {
    return { totalRecoveries: 0, avgTriageMs: 0, avgFullRecoveryMs: null, successRate: 0, drillCount: 0, liveCount: 0 };
  }
  const avgTriage = metrics.reduce((s, m) => s + m.triageMs, 0) / metrics.length;
  const fullRecoveries = metrics.filter((m) => m.fullRecoveryMs !== null);
  const avgFull = fullRecoveries.length > 0
    ? fullRecoveries.reduce((s, m) => s + (m.fullRecoveryMs ?? 0), 0) / fullRecoveries.length
    : null;
  const successRate = fullRecoveries.length / metrics.length;

  return {
    totalRecoveries: metrics.length,
    avgTriageMs: Math.round(avgTriage),
    avgFullRecoveryMs: avgFull !== null ? Math.round(avgFull) : null,
    successRate: Math.round(successRate * 100) / 100,
    drillCount: metrics.filter((m) => m.source === "drill").length,
    liveCount: metrics.filter((m) => m.source === "live").length,
  };
}