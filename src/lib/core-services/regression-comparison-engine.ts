// ═══════════════════════════════════════════════════════════════
// SITA OS — Regression Comparison Engine
// Captures baselines, detects metric regressions via statistical
// comparison, integrates with EventBus + ReceiptService
// ═══════════════════════════════════════════════════════════════

import type {
  RegressionBaseline,
  RegressionComparisonResult,
  RegressionReport,
  RegressionDimension,
  RegressionSeverity,
  RegressionVerdict,
  RegressionThresholds,
  BaselineMetricSnapshot,
} from "@/packages/contracts/runtime/regression-comparison-runtime";
import { DEFAULT_REGRESSION_THRESHOLDS } from "@/packages/contracts/runtime/regression-comparison-runtime";
import { mean, standardDeviation, zScore, detectTrend } from "@/lib/observability/anomaly-detection";
import { EventBus, createEventBus } from "./event-bus";
import { ReceiptService, createReceiptService } from "./receipt-service";

// ── Helpers ────────────────────────────────────────────────

function uid(): string {
  return `reg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function classifySeverity(
  deviationPct: number,
  z: number,
  thresholds: RegressionThresholds,
): RegressionSeverity {
  const absZ = Math.abs(z);
  const absPct = Math.abs(deviationPct);

  if (absPct >= thresholds.criticalPercent || absZ >= thresholds.zScoreThreshold * 1.6)
    return "critical";
  if (absPct >= thresholds.moderatePercent || absZ >= thresholds.zScoreThreshold * 1.2)
    return "moderate";
  if (absPct >= thresholds.minorPercent || absZ >= thresholds.zScoreThreshold)
    return "minor";
  return "none";
}

function deviationPercent(baseline: number, current: number): number {
  if (baseline === 0) return current === 0 ? 0 : 100;
  return ((current - baseline) / Math.abs(baseline)) * 100;
}

// ── Engine ─────────────────────────────────────────────────

export class RegressionComparisonEngine {
  private baselines = new Map<string, RegressionBaseline>();
  private thresholds: Record<RegressionDimension, RegressionThresholds>;
  private eventBus: EventBus;
  private receiptService: ReceiptService;

  constructor(opts?: {
    thresholds?: Partial<Record<RegressionDimension, RegressionThresholds>>;
    eventBus?: EventBus;
    receiptService?: ReceiptService;
  }) {
    this.thresholds = { ...DEFAULT_REGRESSION_THRESHOLDS, ...opts?.thresholds };
    this.eventBus = opts?.eventBus ?? createEventBus();
    this.receiptService = opts?.receiptService ?? createReceiptService();
  }

  // ── Baseline Management ──────────────────────────────────

  captureBaseline(
    domain: string,
    metrics: BaselineMetricSnapshot[],
    tag?: string,
  ): RegressionBaseline {
    const baseline: RegressionBaseline = {
      domain,
      capturedAt: new Date().toISOString(),
      version: uid(),
      metrics,
      tag,
    };
    this.baselines.set(domain, baseline);

    this.eventBus.publish(
      "regression.baseline.captured",
      { domain, metricCount: metrics.length, tag },
      { source: "RegressionComparisonEngine" },
    );

    return baseline;
  }

  getBaseline(domain: string): RegressionBaseline | undefined {
    return this.baselines.get(domain);
  }

  updateBaseline(domain: string, metrics: BaselineMetricSnapshot[], tag?: string): RegressionBaseline {
    return this.captureBaseline(domain, metrics, tag);
  }

  listDomains(): string[] {
    return Array.from(this.baselines.keys());
  }

  // ── Single-Domain Comparison ─────────────────────────────

  compare(
    domain: string,
    currentMetrics: Record<string, number>,
  ): RegressionReport {
    const baseline = this.baselines.get(domain);
    if (!baseline) {
      return this.emptyReport([domain], "No baseline captured — skipped");
    }

    const comparisons = baseline.metrics.map((bm) =>
      this.compareMetric(bm, currentMetrics[bm.name] ?? bm.value),
    );

    return this.buildReport([domain], comparisons);
  }

  // ── Cross-Domain Comparison ──────────────────────────────

  compareAll(
    currentMetricsByDomain?: Record<string, Record<string, number>>,
  ): RegressionReport {
    const domains = this.listDomains();
    if (domains.length === 0) {
      return this.emptyReport([], "No baselines captured — nothing to compare");
    }

    const allComparisons: RegressionComparisonResult[] = [];
    for (const domain of domains) {
      const baseline = this.baselines.get(domain)!;
      const currentMetrics = currentMetricsByDomain?.[domain] ?? {};
      for (const bm of baseline.metrics) {
        allComparisons.push(
          this.compareMetric(bm, currentMetrics[bm.name] ?? bm.value),
        );
      }
    }

    const report = this.buildReport(domains, allComparisons);

    // Emit events + receipt for regressions
    if (report.regressionsFound > 0) {
      this.eventBus.publish(
        "regression.detected",
        {
          domains,
          regressionsFound: report.regressionsFound,
          verdict: report.overallVerdict,
          summary: report.summary,
        },
        { source: "RegressionComparisonEngine" },
      );

      this.receiptService.createReceipt(
        report.id,
        "verification-proof",
        {
          regressionsFound: report.regressionsFound,
          verdict: report.overallVerdict,
          regressions: report.comparisons.filter(c => c.severity !== "none"),
        },
        { capabilityId: "regression-comparison" },
      );
    }

    return report;
  }

  // ── Per-Metric Comparison ────────────────────────────────

  private compareMetric(
    baseline: BaselineMetricSnapshot,
    currentValue: number,
  ): RegressionComparisonResult {
    const thresholds = this.thresholds[baseline.dimension];
    const devPct = deviationPercent(baseline.value, currentValue);
    const history = baseline.history.length >= 2 ? baseline.history : [baseline.value];
    const avg = mean(history);
    const stdDev = standardDeviation(history);
    const z = zScore(currentValue, avg, stdDev);
    const severity = classifySeverity(devPct, z, thresholds);

    // Determine direction: for latency/cost, "up" means degraded
    const higherIsBad = baseline.dimension === "latency" || baseline.dimension === "cost";
    const isUp = currentValue > baseline.value;
    let direction: RegressionComparisonResult["direction"] = "stable";
    if (Math.abs(devPct) >= thresholds.minorPercent) {
      if (higherIsBad) {
        direction = isUp ? "degraded" : "improved";
      } else {
        direction = isUp ? "improved" : "degraded";
      }
    }

    // Trend analysis on history
    const trend = baseline.history.length >= 5 ? detectTrend(baseline.history) : null;
    const trendNote = trend && trend.direction !== "flat"
      ? ` (trend: ${trend.direction}, R²=${trend.confidence.toFixed(2)})`
      : "";

    return {
      metricName: baseline.name,
      dimension: baseline.dimension,
      baselineValue: baseline.value,
      currentValue,
      deviationPercent: Math.round(devPct * 100) / 100,
      zScore: Math.round(z * 100) / 100,
      severity,
      direction,
      detail: severity === "none"
        ? `${baseline.name}: stable (${devPct.toFixed(1)}% deviation)${trendNote}`
        : `${baseline.name}: ${severity} ${direction} — ${Math.abs(devPct).toFixed(1)}% deviation, z=${Math.abs(z).toFixed(2)}${trendNote}`,
    };
  }

  // ── Report Builders ──────────────────────────────────────

  private buildReport(
    domains: string[],
    comparisons: RegressionComparisonResult[],
  ): RegressionReport {
    const regressions = comparisons.filter(c => c.severity !== "none" && c.direction === "degraded");
    const regressionsFound = regressions.length;

    let overallVerdict: RegressionVerdict = "clean";
    if (regressions.some(r => r.severity === "critical" || r.severity === "moderate")) {
      overallVerdict = "regressed";
    } else if (regressionsFound > 0) {
      overallVerdict = "warning";
    }

    const confidence = comparisons.length > 0
      ? Math.round(((comparisons.length - regressionsFound) / comparisons.length) * 100)
      : 100;

    const summary = regressionsFound === 0
      ? `All ${comparisons.length} metrics within baseline thresholds across ${domains.length} domain(s)`
      : `${regressionsFound} regression(s) detected across ${domains.length} domain(s): ${regressions.map(r => `${r.metricName} (${r.severity})`).join(", ")}`;

    return {
      id: uid(),
      domains,
      comparisons,
      regressionsFound,
      overallVerdict,
      confidence,
      generatedAt: new Date().toISOString(),
      summary,
    };
  }

  private emptyReport(domains: string[], summary: string): RegressionReport {
    return {
      id: uid(),
      domains,
      comparisons: [],
      regressionsFound: 0,
      overallVerdict: "clean",
      confidence: 100,
      generatedAt: new Date().toISOString(),
      summary,
    };
  }
}

// ── Factory ────────────────────────────────────────────────

export function createRegressionComparisonEngine(
  opts?: ConstructorParameters<typeof RegressionComparisonEngine>[0],
): RegressionComparisonEngine {
  return new RegressionComparisonEngine(opts);
}
