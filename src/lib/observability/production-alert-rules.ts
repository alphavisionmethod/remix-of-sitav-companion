// ═══════════════════════════════════════════════════════════════
// SITA OS — Production Monitoring Alert Rules
// Evaluates error rates, latency, saturation, restart loops
// against thresholds and emits structured alerts.
// ═══════════════════════════════════════════════════════════════

import { fromTable } from "@/lib/supabase-helpers";

// ── Types ────────────────────────────────────────────────────

export type AlertSeverity = "info" | "warning" | "critical" | "emergency";
export type AlertCategory = "error_rate" | "latency" | "saturation" | "restart_loop" | "staleness";

export interface AlertRule {
  readonly id: string;
  readonly name: string;
  readonly category: AlertCategory;
  readonly description: string;
  readonly evaluate: (snapshot: SystemSnapshot) => AlertEvaluation;
}

export interface AlertEvaluation {
  readonly ruleId: string;
  readonly triggered: boolean;
  readonly severity: AlertSeverity;
  readonly value: number;
  readonly threshold: number;
  readonly message: string;
  readonly evaluatedAt: string;
}

export interface SystemSnapshot {
  /** Total requests in the evaluation window */
  totalRequests: number;
  /** Failed requests (5xx + unhandled) in the window */
  failedRequests: number;
  /** p50 latency in ms */
  latencyP50Ms: number;
  /** p95 latency in ms */
  latencyP95Ms: number;
  /** p99 latency in ms */
  latencyP99Ms: number;
  /** Active DB connections (0-100 scale) */
  dbConnectionUtilization: number;
  /** JS heap usage in bytes */
  heapUsedBytes: number;
  /** Max JS heap in bytes */
  heapTotalBytes: number;
  /** Number of edge function cold starts in window */
  coldStarts: number;
  /** Number of edge function restarts in last 10 min */
  restartsLast10Min: number;
  /** Seconds since last successful health-check response */
  secondsSinceLastHealthOk: number;
  /** Queue depth (pending jobs/messages) */
  queueDepth: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

// ── Thresholds ───────────────────────────────────────────────

const THRESHOLDS = {
  errorRateWarning: 0.01,     // 1%
  errorRateCritical: 0.05,    // 5%
  errorRateEmergency: 0.15,   // 15%

  latencyP95Warning: 2000,    // 2s
  latencyP95Critical: 5000,   // 5s
  latencyP99Critical: 10000,  // 10s

  dbUtilWarning: 70,          // 70%
  dbUtilCritical: 90,         // 90%

  heapWarning: 0.75,          // 75% of total
  heapCritical: 0.90,         // 90% of total

  restartLoopThreshold: 3,    // 3+ restarts in 10 min
  restartLoopCritical: 5,     // 5+ restarts

  stalenessWarning: 120,      // 2 min since last health OK
  stalenessCritical: 300,     // 5 min

  queueWarning: 100,
  queueCritical: 500,
} as const;

// ── Rule Definitions ─────────────────────────────────────────

function now(): string {
  return new Date().toISOString();
}

export const ALERT_RULES: readonly AlertRule[] = [
  // ── Error Rate Rules ───────────────────────────────────────
  {
    id: "err-rate-warning",
    name: "Error Rate Warning (>1%)",
    category: "error_rate",
    description: "Server error rate exceeds 1% of total requests",
    evaluate: (s) => {
      const rate = s.totalRequests > 0 ? s.failedRequests / s.totalRequests : 0;
      return {
        ruleId: "err-rate-warning",
        triggered: rate >= THRESHOLDS.errorRateWarning && rate < THRESHOLDS.errorRateCritical,
        severity: "warning",
        value: Math.round(rate * 10000) / 100,
        threshold: THRESHOLDS.errorRateWarning * 100,
        message: `Error rate ${(rate * 100).toFixed(2)}% exceeds ${THRESHOLDS.errorRateWarning * 100}% warning threshold`,
        evaluatedAt: now(),
      };
    },
  },
  {
    id: "err-rate-critical",
    name: "Error Rate Critical (>5%)",
    category: "error_rate",
    description: "Server error rate exceeds 5% — service degradation likely",
    evaluate: (s) => {
      const rate = s.totalRequests > 0 ? s.failedRequests / s.totalRequests : 0;
      return {
        ruleId: "err-rate-critical",
        triggered: rate >= THRESHOLDS.errorRateCritical && rate < THRESHOLDS.errorRateEmergency,
        severity: "critical",
        value: Math.round(rate * 10000) / 100,
        threshold: THRESHOLDS.errorRateCritical * 100,
        message: `Error rate ${(rate * 100).toFixed(2)}% exceeds ${THRESHOLDS.errorRateCritical * 100}% critical threshold`,
        evaluatedAt: now(),
      };
    },
  },
  {
    id: "err-rate-emergency",
    name: "Error Rate Emergency (>15%)",
    category: "error_rate",
    description: "Server error rate exceeds 15% — major incident",
    evaluate: (s) => {
      const rate = s.totalRequests > 0 ? s.failedRequests / s.totalRequests : 0;
      return {
        ruleId: "err-rate-emergency",
        triggered: rate >= THRESHOLDS.errorRateEmergency,
        severity: "emergency",
        value: Math.round(rate * 10000) / 100,
        threshold: THRESHOLDS.errorRateEmergency * 100,
        message: `EMERGENCY: Error rate ${(rate * 100).toFixed(2)}% exceeds ${THRESHOLDS.errorRateEmergency * 100}%`,
        evaluatedAt: now(),
      };
    },
  },

  // ── Latency Rules ──────────────────────────────────────────
  {
    id: "latency-p95-warning",
    name: "P95 Latency Warning (>2s)",
    category: "latency",
    description: "P95 response latency exceeds 2 seconds",
    evaluate: (s) => ({
      ruleId: "latency-p95-warning",
      triggered: s.latencyP95Ms >= THRESHOLDS.latencyP95Warning && s.latencyP95Ms < THRESHOLDS.latencyP95Critical,
      severity: "warning",
      value: s.latencyP95Ms,
      threshold: THRESHOLDS.latencyP95Warning,
      message: `P95 latency ${s.latencyP95Ms}ms exceeds ${THRESHOLDS.latencyP95Warning}ms warning threshold`,
      evaluatedAt: now(),
    }),
  },
  {
    id: "latency-p95-critical",
    name: "P95 Latency Critical (>5s)",
    category: "latency",
    description: "P95 response latency exceeds 5 seconds — user experience impacted",
    evaluate: (s) => ({
      ruleId: "latency-p95-critical",
      triggered: s.latencyP95Ms >= THRESHOLDS.latencyP95Critical,
      severity: "critical",
      value: s.latencyP95Ms,
      threshold: THRESHOLDS.latencyP95Critical,
      message: `P95 latency ${s.latencyP95Ms}ms exceeds ${THRESHOLDS.latencyP95Critical}ms critical threshold`,
      evaluatedAt: now(),
    }),
  },
  {
    id: "latency-p99-critical",
    name: "P99 Latency Critical (>10s)",
    category: "latency",
    description: "P99 tail latency exceeds 10 seconds",
    evaluate: (s) => ({
      ruleId: "latency-p99-critical",
      triggered: s.latencyP99Ms >= THRESHOLDS.latencyP99Critical,
      severity: "critical",
      value: s.latencyP99Ms,
      threshold: THRESHOLDS.latencyP99Critical,
      message: `P99 latency ${s.latencyP99Ms}ms exceeds ${THRESHOLDS.latencyP99Critical}ms`,
      evaluatedAt: now(),
    }),
  },

  // ── Saturation Rules ───────────────────────────────────────
  {
    id: "db-util-warning",
    name: "DB Connection Saturation Warning (>70%)",
    category: "saturation",
    description: "Database connection pool utilization exceeds 70%",
    evaluate: (s) => ({
      ruleId: "db-util-warning",
      triggered: s.dbConnectionUtilization >= THRESHOLDS.dbUtilWarning && s.dbConnectionUtilization < THRESHOLDS.dbUtilCritical,
      severity: "warning",
      value: s.dbConnectionUtilization,
      threshold: THRESHOLDS.dbUtilWarning,
      message: `DB connection utilization ${s.dbConnectionUtilization}% exceeds ${THRESHOLDS.dbUtilWarning}% warning threshold`,
      evaluatedAt: now(),
    }),
  },
  {
    id: "db-util-critical",
    name: "DB Connection Saturation Critical (>90%)",
    category: "saturation",
    description: "Database connection pool near exhaustion",
    evaluate: (s) => ({
      ruleId: "db-util-critical",
      triggered: s.dbConnectionUtilization >= THRESHOLDS.dbUtilCritical,
      severity: "critical",
      value: s.dbConnectionUtilization,
      threshold: THRESHOLDS.dbUtilCritical,
      message: `CRITICAL: DB connection utilization ${s.dbConnectionUtilization}% exceeds ${THRESHOLDS.dbUtilCritical}%`,
      evaluatedAt: now(),
    }),
  },
  {
    id: "heap-warning",
    name: "Heap Memory Warning (>75%)",
    category: "saturation",
    description: "JavaScript heap usage exceeds 75% of available memory",
    evaluate: (s) => {
      const ratio = s.heapTotalBytes > 0 ? s.heapUsedBytes / s.heapTotalBytes : 0;
      return {
        ruleId: "heap-warning",
        triggered: ratio >= THRESHOLDS.heapWarning && ratio < THRESHOLDS.heapCritical,
        severity: "warning",
        value: Math.round(ratio * 100),
        threshold: THRESHOLDS.heapWarning * 100,
        message: `Heap usage ${Math.round(ratio * 100)}% exceeds ${THRESHOLDS.heapWarning * 100}% warning threshold`,
        evaluatedAt: now(),
      };
    },
  },
  {
    id: "heap-critical",
    name: "Heap Memory Critical (>90%)",
    category: "saturation",
    description: "JavaScript heap near OOM — GC pressure likely",
    evaluate: (s) => {
      const ratio = s.heapTotalBytes > 0 ? s.heapUsedBytes / s.heapTotalBytes : 0;
      return {
        ruleId: "heap-critical",
        triggered: ratio >= THRESHOLDS.heapCritical,
        severity: "critical",
        value: Math.round(ratio * 100),
        threshold: THRESHOLDS.heapCritical * 100,
        message: `CRITICAL: Heap usage ${Math.round(ratio * 100)}% exceeds ${THRESHOLDS.heapCritical * 100}%`,
        evaluatedAt: now(),
      };
    },
  },
  {
    id: "queue-warning",
    name: "Queue Depth Warning (>100)",
    category: "saturation",
    description: "Pending job queue exceeds 100 items",
    evaluate: (s) => ({
      ruleId: "queue-warning",
      triggered: s.queueDepth >= THRESHOLDS.queueWarning && s.queueDepth < THRESHOLDS.queueCritical,
      severity: "warning",
      value: s.queueDepth,
      threshold: THRESHOLDS.queueWarning,
      message: `Queue depth ${s.queueDepth} exceeds ${THRESHOLDS.queueWarning} warning threshold`,
      evaluatedAt: now(),
    }),
  },
  {
    id: "queue-critical",
    name: "Queue Depth Critical (>500)",
    category: "saturation",
    description: "Pending job queue exceeds 500 — processing stalled",
    evaluate: (s) => ({
      ruleId: "queue-critical",
      triggered: s.queueDepth >= THRESHOLDS.queueCritical,
      severity: "critical",
      value: s.queueDepth,
      threshold: THRESHOLDS.queueCritical,
      message: `CRITICAL: Queue depth ${s.queueDepth} exceeds ${THRESHOLDS.queueCritical}`,
      evaluatedAt: now(),
    }),
  },

  // ── Restart Loop Rules ─────────────────────────────────────
  {
    id: "restart-loop-warning",
    name: "Restart Loop Warning (≥3 in 10min)",
    category: "restart_loop",
    description: "Edge function restarted 3+ times in 10 minutes — possible crash loop",
    evaluate: (s) => ({
      ruleId: "restart-loop-warning",
      triggered: s.restartsLast10Min >= THRESHOLDS.restartLoopThreshold && s.restartsLast10Min < THRESHOLDS.restartLoopCritical,
      severity: "warning",
      value: s.restartsLast10Min,
      threshold: THRESHOLDS.restartLoopThreshold,
      message: `${s.restartsLast10Min} restarts in 10min exceeds ${THRESHOLDS.restartLoopThreshold} warning threshold`,
      evaluatedAt: now(),
    }),
  },
  {
    id: "restart-loop-critical",
    name: "Restart Loop Critical (≥5 in 10min)",
    category: "restart_loop",
    description: "Edge function in crash loop — 5+ restarts in 10 minutes",
    evaluate: (s) => ({
      ruleId: "restart-loop-critical",
      triggered: s.restartsLast10Min >= THRESHOLDS.restartLoopCritical,
      severity: "critical",
      value: s.restartsLast10Min,
      threshold: THRESHOLDS.restartLoopCritical,
      message: `CRITICAL: ${s.restartsLast10Min} restarts in 10min — crash loop detected`,
      evaluatedAt: now(),
    }),
  },

  // ── Staleness Rules ────────────────────────────────────────
  {
    id: "health-stale-warning",
    name: "Health Check Stale (>2min)",
    category: "staleness",
    description: "No successful health-check response in 2+ minutes",
    evaluate: (s) => ({
      ruleId: "health-stale-warning",
      triggered: s.secondsSinceLastHealthOk >= THRESHOLDS.stalenessWarning && s.secondsSinceLastHealthOk < THRESHOLDS.stalenessCritical,
      severity: "warning",
      value: s.secondsSinceLastHealthOk,
      threshold: THRESHOLDS.stalenessWarning,
      message: `No health OK in ${s.secondsSinceLastHealthOk}s (warning: >${THRESHOLDS.stalenessWarning}s)`,
      evaluatedAt: now(),
    }),
  },
  {
    id: "health-stale-critical",
    name: "Health Check Stale (>5min)",
    category: "staleness",
    description: "No successful health-check response in 5+ minutes — monitoring blind spot",
    evaluate: (s) => ({
      ruleId: "health-stale-critical",
      triggered: s.secondsSinceLastHealthOk >= THRESHOLDS.stalenessCritical,
      severity: "critical",
      value: s.secondsSinceLastHealthOk,
      threshold: THRESHOLDS.stalenessCritical,
      message: `CRITICAL: No health OK in ${s.secondsSinceLastHealthOk}s — possible outage`,
      evaluatedAt: now(),
    }),
  },
];

// ── Evaluation Engine ────────────────────────────────────────

export interface AlertReport {
  readonly snapshot: SystemSnapshot;
  readonly evaluations: AlertEvaluation[];
  readonly triggered: AlertEvaluation[];
  readonly highestSeverity: AlertSeverity | null;
  readonly evaluatedAt: string;
}

const SEVERITY_RANK: Record<AlertSeverity, number> = {
  info: 0,
  warning: 1,
  critical: 2,
  emergency: 3,
};

/**
 * Evaluate all alert rules against a system snapshot.
 * Returns a report with all evaluations and triggered alerts.
 */
export function evaluateAlertRules(snapshot: SystemSnapshot): AlertReport {
  const evaluations = ALERT_RULES.map((rule) => rule.evaluate(snapshot));
  const triggered = evaluations.filter((e) => e.triggered);
  const highestSeverity = triggered.length > 0
    ? triggered.reduce<AlertSeverity>((max, e) =>
        SEVERITY_RANK[e.severity] > SEVERITY_RANK[max] ? e.severity : max,
      "info")
    : null;

  return {
    snapshot,
    evaluations,
    triggered,
    highestSeverity,
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Persist triggered alerts to the alerts table (fire-and-forget).
 */
export async function persistTriggeredAlerts(report: AlertReport): Promise<void> {
  if (report.triggered.length === 0) return;

  const rows = report.triggered.map((alert) => ({
    source: "monitoring" as const,
    severity: alert.severity === "emergency" ? "critical" : alert.severity,
    subsystem: alert.ruleId,
    title: alert.message,
    description: `Rule ${alert.ruleId} triggered: value=${alert.value}, threshold=${alert.threshold}`,
    fingerprint: `monitor:${alert.ruleId}`,
    metadata: {
      rule_id: alert.ruleId,
      value: alert.value,
      threshold: alert.threshold,
      category: ALERT_RULES.find((r) => r.id === alert.ruleId)?.category,
    },
  }));

  try {
    await fromTable("alerts").insert(rows);
  } catch {
    // Non-blocking — alerts persist best-effort
  }
}

/**
 * Build a SystemSnapshot from available runtime signals.
 * Used by the monitoring loop to feed evaluateAlertRules().
 */
export function buildSnapshotFromMetrics(metrics: {
  totalRequests?: number;
  failedRequests?: number;
  latencyP50Ms?: number;
  latencyP95Ms?: number;
  latencyP99Ms?: number;
  dbConnectionUtilization?: number;
  heapUsedBytes?: number;
  heapTotalBytes?: number;
  coldStarts?: number;
  restartsLast10Min?: number;
  secondsSinceLastHealthOk?: number;
  queueDepth?: number;
  windowSeconds?: number;
}): SystemSnapshot {
  return {
    totalRequests: metrics.totalRequests ?? 0,
    failedRequests: metrics.failedRequests ?? 0,
    latencyP50Ms: metrics.latencyP50Ms ?? 0,
    latencyP95Ms: metrics.latencyP95Ms ?? 0,
    latencyP99Ms: metrics.latencyP99Ms ?? 0,
    dbConnectionUtilization: metrics.dbConnectionUtilization ?? 0,
    heapUsedBytes: metrics.heapUsedBytes ?? 0,
    heapTotalBytes: metrics.heapTotalBytes ?? 1,
    coldStarts: metrics.coldStarts ?? 0,
    restartsLast10Min: metrics.restartsLast10Min ?? 0,
    secondsSinceLastHealthOk: metrics.secondsSinceLastHealthOk ?? 0,
    queueDepth: metrics.queueDepth ?? 0,
    windowSeconds: metrics.windowSeconds ?? 60,
  };
}

/** Export thresholds for test assertions */
export { THRESHOLDS };