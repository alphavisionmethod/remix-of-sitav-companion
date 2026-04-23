// ═══════════════════════════════════════════════════════════════
// SITA OS — Production Alert Rules Test Suite
// Simulates failure scenarios and verifies alert rules trigger
// at correct thresholds with correct severity.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  evaluateAlertRules,
  buildSnapshotFromMetrics,
  ALERT_RULES,
  THRESHOLDS,
  type SystemSnapshot,
  type AlertReport,
} from "@/lib/observability/production-alert-rules";

function makeHealthy(): SystemSnapshot {
  return buildSnapshotFromMetrics({
    totalRequests: 1000,
    failedRequests: 2,
    latencyP50Ms: 100,
    latencyP95Ms: 500,
    latencyP99Ms: 1200,
    dbConnectionUtilization: 30,
    heapUsedBytes: 40_000_000,
    heapTotalBytes: 100_000_000,
    coldStarts: 1,
    restartsLast10Min: 0,
    secondsSinceLastHealthOk: 10,
    queueDepth: 5,
    windowSeconds: 60,
  });
}

describe("Production Alert Rules", () => {
  it("has 16 rules across all categories", () => {
    expect(ALERT_RULES.length).toBe(16);
    const categories = new Set(ALERT_RULES.map(r => r.category));
    expect(categories).toContain("error_rate");
    expect(categories).toContain("latency");
    expect(categories).toContain("saturation");
    expect(categories).toContain("restart_loop");
    expect(categories).toContain("staleness");
  });

  it("healthy snapshot triggers zero alerts", () => {
    const report = evaluateAlertRules(makeHealthy());
    expect(report.triggered).toHaveLength(0);
    expect(report.highestSeverity).toBeNull();
  });

  // ── Error Rate Simulations ─────────────────────────────────

  it("triggers warning at 2% error rate", () => {
    const snapshot = buildSnapshotFromMetrics({ totalRequests: 1000, failedRequests: 20 });
    const report = evaluateAlertRules(snapshot);
    const hit = report.triggered.find(e => e.ruleId === "err-rate-warning");
    expect(hit).toBeDefined();
    expect(hit!.severity).toBe("warning");
  });

  it("triggers critical at 7% error rate", () => {
    const snapshot = buildSnapshotFromMetrics({ totalRequests: 1000, failedRequests: 70 });
    const report = evaluateAlertRules(snapshot);
    const hit = report.triggered.find(e => e.ruleId === "err-rate-critical");
    expect(hit).toBeDefined();
    expect(hit!.severity).toBe("critical");
  });

  it("triggers emergency at 20% error rate", () => {
    const snapshot = buildSnapshotFromMetrics({ totalRequests: 1000, failedRequests: 200 });
    const report = evaluateAlertRules(snapshot);
    const hit = report.triggered.find(e => e.ruleId === "err-rate-emergency");
    expect(hit).toBeDefined();
    expect(hit!.severity).toBe("emergency");
    expect(report.highestSeverity).toBe("emergency");
  });

  it("does NOT trigger error alert at 0.5% error rate", () => {
    const snapshot = buildSnapshotFromMetrics({ totalRequests: 1000, failedRequests: 5 });
    const report = evaluateAlertRules(snapshot);
    const errorAlerts = report.triggered.filter(e => e.ruleId.startsWith("err-rate"));
    expect(errorAlerts).toHaveLength(0);
  });

  // ── Latency Simulations ────────────────────────────────────

  it("triggers p95 warning at 3000ms", () => {
    const snapshot = buildSnapshotFromMetrics({ latencyP95Ms: 3000 });
    const report = evaluateAlertRules(snapshot);
    const hit = report.triggered.find(e => e.ruleId === "latency-p95-warning");
    expect(hit).toBeDefined();
    expect(hit!.severity).toBe("warning");
  });

  it("triggers p95 critical at 6000ms", () => {
    const snapshot = buildSnapshotFromMetrics({ latencyP95Ms: 6000 });
    const report = evaluateAlertRules(snapshot);
    const hit = report.triggered.find(e => e.ruleId === "latency-p95-critical");
    expect(hit).toBeDefined();
    expect(hit!.severity).toBe("critical");
  });

  it("triggers p99 critical at 12000ms", () => {
    const snapshot = buildSnapshotFromMetrics({ latencyP99Ms: 12000 });
    const report = evaluateAlertRules(snapshot);
    const hit = report.triggered.find(e => e.ruleId === "latency-p99-critical");
    expect(hit).toBeDefined();
  });

  // ── Saturation Simulations ─────────────────────────────────

  it("triggers DB saturation warning at 75%", () => {
    const snapshot = buildSnapshotFromMetrics({ dbConnectionUtilization: 75 });
    const report = evaluateAlertRules(snapshot);
    const hit = report.triggered.find(e => e.ruleId === "db-util-warning");
    expect(hit).toBeDefined();
  });

  it("triggers DB saturation critical at 95%", () => {
    const snapshot = buildSnapshotFromMetrics({ dbConnectionUtilization: 95 });
    const report = evaluateAlertRules(snapshot);
    const hit = report.triggered.find(e => e.ruleId === "db-util-critical");
    expect(hit).toBeDefined();
    expect(hit!.severity).toBe("critical");
  });

  it("triggers heap warning at 80%", () => {
    const snapshot = buildSnapshotFromMetrics({ heapUsedBytes: 80_000_000, heapTotalBytes: 100_000_000 });
    const report = evaluateAlertRules(snapshot);
    const hit = report.triggered.find(e => e.ruleId === "heap-warning");
    expect(hit).toBeDefined();
  });

  it("triggers heap critical at 95%", () => {
    const snapshot = buildSnapshotFromMetrics({ heapUsedBytes: 95_000_000, heapTotalBytes: 100_000_000 });
    const report = evaluateAlertRules(snapshot);
    const hit = report.triggered.find(e => e.ruleId === "heap-critical");
    expect(hit).toBeDefined();
    expect(hit!.severity).toBe("critical");
  });

  it("triggers queue warning at 150 depth", () => {
    const snapshot = buildSnapshotFromMetrics({ queueDepth: 150 });
    const report = evaluateAlertRules(snapshot);
    const hit = report.triggered.find(e => e.ruleId === "queue-warning");
    expect(hit).toBeDefined();
  });

  it("triggers queue critical at 600 depth", () => {
    const snapshot = buildSnapshotFromMetrics({ queueDepth: 600 });
    const report = evaluateAlertRules(snapshot);
    const hit = report.triggered.find(e => e.ruleId === "queue-critical");
    expect(hit).toBeDefined();
  });

  // ── Restart Loop Simulations ───────────────────────────────

  it("triggers restart loop warning at 3 restarts", () => {
    const snapshot = buildSnapshotFromMetrics({ restartsLast10Min: 3 });
    const report = evaluateAlertRules(snapshot);
    const hit = report.triggered.find(e => e.ruleId === "restart-loop-warning");
    expect(hit).toBeDefined();
    expect(hit!.severity).toBe("warning");
  });

  it("triggers restart loop critical at 6 restarts", () => {
    const snapshot = buildSnapshotFromMetrics({ restartsLast10Min: 6 });
    const report = evaluateAlertRules(snapshot);
    const hit = report.triggered.find(e => e.ruleId === "restart-loop-critical");
    expect(hit).toBeDefined();
    expect(hit!.severity).toBe("critical");
  });

  // ── Staleness Simulations ──────────────────────────────────

  it("triggers staleness warning at 180s", () => {
    const snapshot = buildSnapshotFromMetrics({ secondsSinceLastHealthOk: 180 });
    const report = evaluateAlertRules(snapshot);
    const hit = report.triggered.find(e => e.ruleId === "health-stale-warning");
    expect(hit).toBeDefined();
  });

  it("triggers staleness critical at 400s", () => {
    const snapshot = buildSnapshotFromMetrics({ secondsSinceLastHealthOk: 400 });
    const report = evaluateAlertRules(snapshot);
    const hit = report.triggered.find(e => e.ruleId === "health-stale-critical");
    expect(hit).toBeDefined();
    expect(hit!.severity).toBe("critical");
  });

  // ── Multi-Failure Cascade ──────────────────────────────────

  it("cascade scenario triggers multiple alerts with correct highest severity", () => {
    const snapshot = buildSnapshotFromMetrics({
      totalRequests: 1000,
      failedRequests: 200,       // 20% → emergency
      latencyP95Ms: 6000,        // → critical
      dbConnectionUtilization: 95, // → critical
      restartsLast10Min: 6,      // → critical
      secondsSinceLastHealthOk: 400, // → critical
    });
    const report = evaluateAlertRules(snapshot);
    expect(report.triggered.length).toBeGreaterThanOrEqual(5);
    expect(report.highestSeverity).toBe("emergency");
  });

  // ── Report Structure ───────────────────────────────────────

  it("report contains all 16 evaluations regardless of trigger state", () => {
    const report = evaluateAlertRules(makeHealthy());
    expect(report.evaluations).toHaveLength(16);
    expect(report.evaluatedAt).toBeTruthy();
    expect(report.snapshot).toBeDefined();
  });

  it("each evaluation has required fields", () => {
    const report = evaluateAlertRules(makeHealthy());
    for (const eval_ of report.evaluations) {
      expect(eval_.ruleId).toBeTruthy();
      expect(typeof eval_.triggered).toBe("boolean");
      expect(typeof eval_.value).toBe("number");
      expect(typeof eval_.threshold).toBe("number");
      expect(eval_.message).toBeTruthy();
      expect(eval_.evaluatedAt).toBeTruthy();
    }
  });
});