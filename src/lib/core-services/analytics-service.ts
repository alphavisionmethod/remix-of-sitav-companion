// ═══════════════════════════════════════════════════════════════
// SITA OS — Analytics Service
// Event aggregation, usage metrics, and domain dashboards
// ═══════════════════════════════════════════════════════════════

export type MetricType = "counter" | "gauge" | "histogram" | "summary";
export type MetricDomain = "business" | "finance" | "concierge" | "platform" | "system";

export interface Metric {
  id: string;
  name: string;
  type: MetricType;
  domain: MetricDomain;
  value: number;
  labels: Record<string, string>;
  timestamp: number;
}

export interface MetricAggregation {
  metricName: string;
  domain: MetricDomain;
  period: "minute" | "hour" | "day" | "week" | "month";
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  p95: number;
  windowStart: number;
  windowEnd: number;
}

export interface UsageReport {
  domain: MetricDomain;
  period: string;
  totalEvents: number;
  uniqueCapabilities: number;
  totalTokens: number;
  avgLatencyMs: number;
  errorRate: number;
}

// ── Analytics Service ───────────────────────────────────────────

export class AnalyticsService {
  private metrics: Metric[] = [];
  private maxMetrics = 100_000;

  record(name: string, value: number, domain: MetricDomain, type: MetricType = "counter", labels: Record<string, string> = {}): void {
    if (this.metrics.length >= this.maxMetrics) {
      this.metrics = this.metrics.slice(-Math.floor(this.maxMetrics / 2));
    }

    this.metrics.push({
      id: `metric-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name, type, domain, value, labels, timestamp: Date.now(),
    });
  }

  increment(name: string, domain: MetricDomain, labels: Record<string, string> = {}): void {
    this.record(name, 1, domain, "counter", labels);
  }

  gauge(name: string, value: number, domain: MetricDomain, labels: Record<string, string> = {}): void {
    this.record(name, value, domain, "gauge", labels);
  }

  aggregate(name: string, domain: MetricDomain, period: MetricAggregation["period"]): MetricAggregation | null {
    const periodMs = { minute: 60_000, hour: 3_600_000, day: 86_400_000, week: 604_800_000, month: 2_592_000_000 }[period];
    const windowStart = Date.now() - periodMs;
    const windowEnd = Date.now();

    const filtered = this.metrics.filter(m => m.name === name && m.domain === domain && m.timestamp >= windowStart);
    if (filtered.length === 0) return null;

    const values = filtered.map(m => m.value).sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      metricName: name, domain, period,
      count: values.length, sum,
      avg: sum / values.length,
      min: values[0], max: values[values.length - 1],
      p95: values[Math.floor(values.length * 0.95)] ?? values[values.length - 1],
      windowStart, windowEnd,
    };
  }

  getUsageReport(domain: MetricDomain, period: MetricAggregation["period"] = "day"): UsageReport {
    const periodMs = { minute: 60_000, hour: 3_600_000, day: 86_400_000, week: 604_800_000, month: 2_592_000_000 }[period];
    const since = Date.now() - periodMs;
    const filtered = this.metrics.filter(m => m.domain === domain && m.timestamp >= since);

    const capabilities = new Set(filtered.map(m => m.labels["capability"]).filter(Boolean));
    const latencies = filtered.filter(m => m.name.includes("latency")).map(m => m.value);
    const errors = filtered.filter(m => m.name.includes("error")).length;

    return {
      domain, period: `last-${period}`,
      totalEvents: filtered.length,
      uniqueCapabilities: capabilities.size,
      totalTokens: filtered.filter(m => m.name.includes("token")).reduce((s, m) => s + m.value, 0),
      avgLatencyMs: latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
      errorRate: filtered.length ? errors / filtered.length : 0,
    };
  }

  query(name?: string, domain?: MetricDomain, since?: number): Metric[] {
    return this.metrics.filter(m =>
      (!name || m.name === name) &&
      (!domain || m.domain === domain) &&
      (!since || m.timestamp >= since)
    );
  }

  getHealth(): { status: "healthy"; metricsStored: number; oldestMs: number } {
    return {
      status: "healthy",
      metricsStored: this.metrics.length,
      oldestMs: this.metrics.length ? Date.now() - this.metrics[0].timestamp : 0,
    };
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createAnalyticsService(): AnalyticsService {
  return new AnalyticsService();
}
