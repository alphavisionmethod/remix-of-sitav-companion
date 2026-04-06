// ═══════════════════════════════════════════════════════════════
// SITA OS — Observability Tests
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Anomaly Detection ─────────────────────────────────────

describe("anomaly-detection", () => {
  it("detects statistical anomalies", async () => {
    const { detectAnomaly, mean, standardDeviation, zScore } = await import("@/lib/observability/anomaly-detection");

    const values = [100, 102, 98, 101, 99, 103, 97, 100, 102, 98, 101, 99];
    const anomaly = detectAnomaly("test", 200, values, { sensitivityThreshold: 2.5, minSamples: 10, windowMs: 60000 });

    expect(anomaly).not.toBeNull();
    expect(anomaly!.isAnomaly).toBe(true);
    expect(anomaly!.direction).toBe("above");
    expect(anomaly!.severity).toBeDefined();
  });

  it("returns null when within normal range", async () => {
    const { detectAnomaly } = await import("@/lib/observability/anomaly-detection");
    const values = [100, 102, 98, 101, 99, 103, 97, 100, 102, 98];
    const result = detectAnomaly("test", 101, values);
    expect(result).toBeNull();
  });

  it("returns null with insufficient samples", async () => {
    const { detectAnomaly } = await import("@/lib/observability/anomaly-detection");
    const result = detectAnomaly("test", 200, [100, 101, 102]);
    expect(result).toBeNull();
  });

  it("computes mean correctly", async () => {
    const { mean } = await import("@/lib/observability/anomaly-detection");
    expect(mean([10, 20, 30])).toBe(20);
    expect(mean([])).toBe(0);
  });

  it("computes standard deviation", async () => {
    const { standardDeviation } = await import("@/lib/observability/anomaly-detection");
    expect(standardDeviation([10, 10, 10])).toBe(0);
    expect(standardDeviation([1, 5, 9])).toBeGreaterThan(0);
    expect(standardDeviation([])).toBe(0);
  });

  it("computes z-score", async () => {
    const { zScore } = await import("@/lib/observability/anomaly-detection");
    expect(zScore(100, 100, 10)).toBe(0);
    expect(zScore(120, 100, 10)).toBe(2);
    expect(zScore(80, 100, 10)).toBe(-2);
    expect(zScore(100, 100, 0)).toBe(0);
  });

  it("EWMA tracking works", async () => {
    const { initEWMA, updateEWMA, detectEWMAAnomaly } = await import("@/lib/observability/anomaly-detection");
    let state = initEWMA();
    for (let i = 0; i < 20; i++) {
      state = updateEWMA(state, 100 + Math.random() * 5);
    }
    expect(state.count).toBe(20);
    expect(state.average).toBeGreaterThan(95);
    expect(state.average).toBeLessThan(110);

    // Normal value — no anomaly
    const normal = detectEWMAAnomaly("test", state, 102);
    expect(normal).toBeNull();

    // Extreme value — anomaly
    const extreme = detectEWMAAnomaly("test", state, 500);
    expect(extreme).not.toBeNull();
    expect(extreme!.isAnomaly).toBe(true);
  });

  it("detects trends", async () => {
    const { detectTrend } = await import("@/lib/observability/anomaly-detection");

    const upTrend = detectTrend([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
    expect(upTrend.direction).toBe("up");
    expect(upTrend.confidence).toBeGreaterThan(0.9);

    const downTrend = detectTrend([100, 90, 80, 70, 60, 50, 40, 30, 20, 10]);
    expect(downTrend.direction).toBe("down");

    const flat = detectTrend([50, 50, 50, 50, 50]);
    expect(flat.direction).toBe("flat");
  });
});

// ── SLO Tracking ──────────────────────────────────────────

describe("slo-tracking", () => {
  it("computes SLO status correctly", async () => {
    const { computeSLOStatus, SITA_SLOS } = await import("@/lib/observability/slo-tracking");

    const slo = SITA_SLOS[0]; // API Availability
    const status = computeSLOStatus(slo, 998, 1000);

    expect(status.currentValue).toBeCloseTo(0.998);
    expect(status.isMet).toBe(true);
    expect(status.errorBudgetPercent).toBeGreaterThan(0);
  });

  it("detects SLO violation", async () => {
    const { computeSLOStatus, SITA_SLOS } = await import("@/lib/observability/slo-tracking");

    const slo = SITA_SLOS[0]; // target: 0.995
    const status = computeSLOStatus(slo, 990, 1000);

    expect(status.currentValue).toBeCloseTo(0.99);
    expect(status.isMet).toBe(false);
  });

  it("computes error budget", async () => {
    const { computeErrorBudget } = await import("@/lib/observability/slo-tracking");
    const budget = computeErrorBudget(0.99, 30);
    // 30 days * 24h * 60m = 43200 min. 1% = 432 minutes
    expect(budget).toBeCloseTo(432);
  });

  it("has canonical SLO definitions", async () => {
    const { SITA_SLOS } = await import("@/lib/observability/slo-tracking");
    expect(SITA_SLOS.length).toBeGreaterThanOrEqual(10);
    for (const slo of SITA_SLOS) {
      expect(slo.id).toBeTruthy();
      expect(slo.name).toBeTruthy();
      expect(slo.target).toBeGreaterThan(0);
      expect(slo.target).toBeLessThanOrEqual(1);
    }
  });

  it("classifies error budget alerts", async () => {
    const { getErrorBudgetAlertSeverity } = await import("@/lib/observability/slo-tracking");
    expect(getErrorBudgetAlertSeverity(100)).toBeNull();
    expect(getErrorBudgetAlertSeverity(80)).toBeNull();
    expect(getErrorBudgetAlertSeverity(70)).toBe("info");
    expect(getErrorBudgetAlertSeverity(40)).toBe("warning");
    expect(getErrorBudgetAlertSeverity(20)).toBe("critical");
    expect(getErrorBudgetAlertSeverity(0)).toBe("critical");
  });

  it("detects trend changes", async () => {
    const { computeSLOStatus, SITA_SLOS } = await import("@/lib/observability/slo-tracking");
    const slo = SITA_SLOS[0];
    const status = computeSLOStatus(slo, 999, 1000, 0.990);
    expect(status.trend).toBe("improving");
  });
});

// ── Health Index ──────────────────────────────────────────

describe("health-index", () => {
  it("computes composite health index", async () => {
    const { computeHealthIndex, type SubsystemHealth } = await import("@/lib/observability/health-index");

    const subsystems: SubsystemHealth[] = [
      { name: "database", score: 100, status: "healthy", lastChecked: Date.now() },
      { name: "auth", score: 100, status: "healthy", lastChecked: Date.now() },
      { name: "edge-functions", score: 80, status: "degraded", lastChecked: Date.now() },
      { name: "ai-gateway", score: 100, status: "healthy", lastChecked: Date.now() },
      { name: "storage", score: 100, status: "healthy", lastChecked: Date.now() },
      { name: "frontend", score: 90, status: "healthy", lastChecked: Date.now() },
    ];

    const index = computeHealthIndex(subsystems, [], []);
    expect(index.overallScore).toBeGreaterThan(60);
    expect(index.grade).toBeDefined();
    expect(["A", "B", "C", "D", "F"]).toContain(index.grade);
  });

  it("grades scores correctly", async () => {
    const { scoreToGrade } = await import("@/lib/observability/health-index");
    expect(scoreToGrade(97)).toBe("A");
    expect(scoreToGrade(90)).toBe("B");
    expect(scoreToGrade(75)).toBe("C");
    expect(scoreToGrade(55)).toBe("D");
    expect(scoreToGrade(30)).toBe("F");
  });

  it("checks performance budgets", async () => {
    const { checkPerformanceBudgets } = await import("@/lib/observability/health-index");

    const noViolations = checkPerformanceBudgets({ lcp: 1000, cls: 0.05, inp: 100 });
    expect(noViolations).toHaveLength(0);

    const violations = checkPerformanceBudgets({ lcp: 5000, cls: 0.5, inp: 600 });
    expect(violations.length).toBeGreaterThan(0);
    expect(violations.some(v => v.budget.metric === "lcp")).toBe(true);
  });

  it("classifies errors correctly", async () => {
    const { classifyError } = await import("@/lib/observability/health-index");

    expect(classifyError(new Error("Network error")).category).toBe("network");
    expect(classifyError(new Error("401 Unauthorized")).category).toBe("auth");
    expect(classifyError(new Error("403 Forbidden")).category).toBe("permission");
    expect(classifyError(new Error("422 Validation failed")).category).toBe("validation");
    expect(classifyError(new Error("Request timed out")).category).toBe("timeout");
    expect(classifyError(new Error("429 Too Many Requests")).category).toBe("rate_limit");
    expect(classifyError(new Error("500 Internal Server Error")).category).toBe("server");
    expect(classifyError(new Error("Something random")).category).toBe("unknown");
  });

  it("error classification returns proper user messages", async () => {
    const { classifyError } = await import("@/lib/observability/health-index");

    const networkErr = classifyError(new Error("fetch failed"));
    expect(networkErr.retryable).toBe(true);
    expect(networkErr.userMessage).toBeTruthy();

    const authErr = classifyError(new Error("JWT expired"));
    expect(authErr.retryable).toBe(false);
    expect(authErr.severity).toBe("high");
  });
});

// ── Distributed Tracing ────────────────────────────────────

describe("distributed-tracing", () => {
  it("generates valid trace and span IDs", async () => {
    const { generateTraceId, generateSpanId } = await import("@/lib/observability/distributed-tracing");
    const traceId = generateTraceId();
    const spanId = generateSpanId();
    expect(traceId).toHaveLength(32);
    expect(spanId).toHaveLength(16);
    expect(/^[0-9a-f]+$/.test(traceId)).toBe(true);
    expect(/^[0-9a-f]+$/.test(spanId)).toBe(true);
  });

  it("serializes/deserializes W3C traceparent", async () => {
    const { toTraceparent, parseTraceparent } = await import("@/lib/observability/distributed-tracing");

    const ctx = { traceId: "a".repeat(32), spanId: "b".repeat(16), sampled: true };
    const header = toTraceparent(ctx);
    expect(header).toBe(`00-${"a".repeat(32)}-${"b".repeat(16)}-01`);

    const parsed = parseTraceparent(header);
    expect(parsed).toEqual(ctx);
  });

  it("returns null for invalid traceparent", async () => {
    const { parseTraceparent } = await import("@/lib/observability/distributed-tracing");
    expect(parseTraceparent("invalid")).toBeNull();
    expect(parseTraceparent("01-abc-def-00")).toBeNull();
  });

  it("creates and ends spans", async () => {
    const { tracer } = await import("@/lib/observability/distributed-tracing");
    const span = tracer.startTrace("test-operation", "test-service");
    expect(span.traceId).toBeTruthy();
    expect(span.spanId).toBeTruthy();
    expect(span.operation).toBe("test-operation");

    tracer.addEvent(span, "test-event", { key: "value" });
    expect(span.events).toHaveLength(1);

    tracer.endSpan(span, "ok");
    expect(span.duration).not.toBeNull();
    expect(span.status).toBe("ok");
  });

  it("propagates trace context in headers", async () => {
    const { tracer } = await import("@/lib/observability/distributed-tracing");
    tracer.startTrace("header-test");
    const headers = tracer.getTraceHeaders();
    expect(headers.traceparent).toBeDefined();
    expect(headers.traceparent).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-0[01]$/);
  });
});

// ── Telemetry Collector ────────────────────────────────────

describe("telemetry-collector", () => {
  it("records and retrieves events", async () => {
    const { telemetry } = await import("@/lib/observability/telemetry-collector");
    telemetry.record("custom", 42, "ms", { test: "true" });
    const events = telemetry.getRecentEvents(10);
    expect(events.length).toBeGreaterThan(0);
    const last = events[events.length - 1];
    expect(last.metric).toBe("custom");
    expect(last.value).toBe(42);
  });

  it("computes rolling window stats", async () => {
    const { createMetricWindow, addSample, getWindowStats } = await import("@/lib/observability/telemetry-collector");
    let window = createMetricWindow("custom");
    for (let i = 0; i < 20; i++) {
      window = addSample(window, 100 + i);
    }
    const stats = getWindowStats(window);
    expect(stats.count).toBe(20);
    expect(stats.min).toBe(100);
    expect(stats.max).toBe(119);
    expect(stats.avg).toBeGreaterThan(105);
    expect(stats.p50).toBeDefined();
    expect(stats.p95).toBeDefined();
  });

  it("supports listeners", async () => {
    const { telemetry } = await import("@/lib/observability/telemetry-collector");
    const received: any[] = [];
    const unsub = telemetry.subscribe((e) => received.push(e));
    telemetry.record("custom", 1, "count");
    expect(received.length).toBeGreaterThan(0);
    unsub();
    const beforeCount = received.length;
    telemetry.record("custom", 2, "count");
    expect(received.length).toBe(beforeCount);
  });

  it("flushes buffer", async () => {
    const { telemetry } = await import("@/lib/observability/telemetry-collector");
    telemetry.record("custom", 99, "ms");
    const flushed = telemetry.flush();
    expect(flushed).toBeDefined();
    expect(flushed!.length).toBeGreaterThan(0);
    // Buffer should be empty after flush
    const afterFlush = telemetry.flush();
    expect(afterFlush).toBeUndefined();
  });
});
