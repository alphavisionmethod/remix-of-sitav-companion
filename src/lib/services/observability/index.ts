// ═══════════════════════════════════════════════════════════════
// SITA OS — Observability Service
// Metrics collection, SLO tracking, alert management
// Canonical contract: contracts/specialized/observability-metric-contracts
// ═══════════════════════════════════════════════════════════════

import type {
  ObservabilityMetric,
  SLODefinition,
  AlertRule,
  MetricType,
  AlertSeverity,
} from "@/packages/contracts/specialized/observability-metric-contracts";
import type { DomainId } from "@/packages/contracts";
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter

// ── Types ───────────────────────────────────────────────────────

export interface ObservabilityState {
  metrics: ObservabilityMetric[];
  slos: SLODefinition[];
  alerts: AlertRule[];
  triggeredAlerts: Array<{ ruleId: string; triggeredAt: string; value: number }>;
  health: { status: "healthy" | "degraded" | "critical"; score: number };
}

// ── Service ─────────────────────────────────────────────────────

export class ObservabilityService {
  private metrics = new Map<string, ObservabilityMetric>();
  private slos = new Map<string, SLODefinition>();
  private alerts = new Map<string, AlertRule>();
  private triggeredAlerts: ObservabilityState["triggeredAlerts"] = [];

  // ── Metrics ───────────────────────────────────────────────────

  recordMetric(metric: ObservabilityMetric): void {
    this.metrics.set(metric.id, metric);
  }

  incrementCounter(id: string, amount = 1): void {
    const m = this.metrics.get(id);
    if (m && m.type === "counter") {
      m.value += amount;
      m.timestamp = new Date().toISOString();
    }
  }

  setGauge(id: string, value: number): void {
    const m = this.metrics.get(id);
    if (m && m.type === "gauge") {
      m.value = value;
      m.timestamp = new Date().toISOString();
    }
  }

  getMetric(id: string): ObservabilityMetric | undefined {
    return this.metrics.get(id);
  }

  getMetricsByDomain(domain: DomainId): ObservabilityMetric[] {
    return Array.from(this.metrics.values()).filter(m => m.domain === domain);
  }

  getMetricsByType(type: MetricType): ObservabilityMetric[] {
    return Array.from(this.metrics.values()).filter(m => m.type === type);
  }

  // ── SLOs ──────────────────────────────────────────────────────

  registerSLO(slo: SLODefinition): void {
    this.slos.set(slo.id, slo);
  }

  updateSLOValue(id: string, currentValue: number): void {
    const slo = this.slos.get(id);
    if (slo) {
      slo.currentValue = currentValue;
      slo.isMet = currentValue >= slo.target;
      slo.burnRate = slo.target > 0 ? (slo.target - currentValue) / slo.target : 0;
    }
  }

  getBreachedSLOs(): SLODefinition[] {
    return Array.from(this.slos.values()).filter(s => !s.isMet);
  }

  // ── Alerts ────────────────────────────────────────────────────

  registerAlert(rule: AlertRule): void {
    this.alerts.set(rule.id, rule);
  }

  evaluateAlerts(): void {
    const now = new Date().toISOString();
    for (const rule of this.alerts.values()) {
      if (!rule.isActive) continue;
      const metric = Array.from(this.metrics.values()).find(m => m.name === rule.metric);
      if (!metric) continue;

      let triggered = false;
      switch (rule.condition) {
        case "gt": triggered = metric.value > rule.threshold; break;
        case "lt": triggered = metric.value < rule.threshold; break;
        case "eq": triggered = metric.value === rule.threshold; break;
        case "gte": triggered = metric.value >= rule.threshold; break;
        case "lte": triggered = metric.value <= rule.threshold; break;
      }

      if (triggered) {
        if (rule.lastTriggered) {
          const elapsed = Date.now() - new Date(rule.lastTriggered).getTime();
          if (elapsed < rule.cooldownMinutes * 60_000) continue;
        }
        rule.lastTriggered = now;
        this.triggeredAlerts.push({ ruleId: rule.id, triggeredAt: now, value: metric.value });
      }
    }
  }

  getTriggeredAlerts(): ObservabilityState["triggeredAlerts"] {
    return [...this.triggeredAlerts];
  }

  getAlertsBySeverity(severity: AlertSeverity): AlertRule[] {
    return Array.from(this.alerts.values()).filter(a => a.severity === severity);
  }

  // ── Health ────────────────────────────────────────────────────

  computeHealth(): ObservabilityState["health"] {
    const breached = this.getBreachedSLOs().length;
    const criticalAlerts = this.triggeredAlerts.filter(a => {
      const rule = this.alerts.get(a.ruleId);
      return rule?.severity === "critical";
    }).length;

    if (criticalAlerts > 0) return { status: "critical", score: Math.max(0, 100 - criticalAlerts * 25) };
    if (breached > 0) return { status: "degraded", score: Math.max(20, 100 - breached * 15) };
    return { status: "healthy", score: 100 };
  }

  evaluate(): ObservabilityState {
    this.evaluateAlerts();
    return {
      metrics: Array.from(this.metrics.values()),
      slos: Array.from(this.slos.values()),
      alerts: Array.from(this.alerts.values()),
      triggeredAlerts: [...this.triggeredAlerts],
      health: this.computeHealth(),
    };
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("observability", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      metrics: Array.from(this.metrics.entries()),
      slos: Array.from(this.slos.entries()),
      alerts: Array.from(this.alerts.entries()),
      triggeredAlerts: this.triggeredAlerts,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.metrics) this.metrics = new Map(state.metrics as Iterable<[string, never]>) as typeof this.metrics;
    if (state.slos) this.slos = new Map(state.slos as Iterable<[string, never]>) as typeof this.slos;
    if (state.alerts) this.alerts = new Map(state.alerts as Iterable<[string, never]>) as typeof this.alerts;
    if (state.triggeredAlerts) this.triggeredAlerts = state.triggeredAlerts as never;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("observability");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

// ── Attribution Tracker (merged from attribution-analytics) ─────────────────

export interface AttributionRecord {
  id: string;
  actionId: string;
  source: string;
  channel: string;
  revenue: number;
  costUsd: number;
  roi: number;
  touchpoints: Array<{ timestamp: string; channel: string; action: string }>;
  attributedAt: string;
}

export class AttributionTracker {
  private records: AttributionRecord[] = [];

  record(actionId: string, source: string, channel: string, revenue: number, costUsd: number, touchpoints: AttributionRecord["touchpoints"] = []): AttributionRecord {
    const roi = costUsd > 0 ? (revenue - costUsd) / costUsd : revenue > 0 ? Infinity : 0;
    const entry: AttributionRecord = {
      id: `attr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      actionId, source, channel, revenue, costUsd, roi, touchpoints,
      attributedAt: new Date().toISOString(),
    };
    this.records.push(entry);
    return entry;
  }

  getByChannel(channel: string): AttributionRecord[] { return this.records.filter(r => r.channel === channel); }
  getTopPerformers(limit = 10): AttributionRecord[] { return [...this.records].sort((a, b) => b.roi - a.roi).slice(0, limit); }
  getTotalROI(): number {
    const totalRev = this.records.reduce((s, r) => s + r.revenue, 0);
    const totalCost = this.records.reduce((s, r) => s + r.costUsd, 0);
    return totalCost > 0 ? (totalRev - totalCost) / totalCost : 0;
  }
}

// ── Golden Trace Runner (merged from golden-trace-runner) ───────────────────

export interface GoldenTrace {
  id: string;
  name: string;
  expectedSteps: string[];
  actualSteps: string[];
  passed: boolean;
  driftPoints: Array<{ step: number; expected: string; actual: string }>;
  executedAt: string;
  durationMs: number;
}

export class GoldenTraceRunner {
  private traces: GoldenTrace[] = [];

  run(name: string, expectedSteps: string[], actualSteps: string[]): GoldenTrace {
    const start = Date.now();
    const driftPoints: GoldenTrace["driftPoints"] = [];
    const maxLen = Math.max(expectedSteps.length, actualSteps.length);
    for (let i = 0; i < maxLen; i++) {
      if (expectedSteps[i] !== actualSteps[i]) {
        driftPoints.push({ step: i, expected: expectedSteps[i] ?? "(missing)", actual: actualSteps[i] ?? "(missing)" });
      }
    }
    const trace: GoldenTrace = {
      id: `gt-${Date.now()}`, name, expectedSteps, actualSteps,
      passed: driftPoints.length === 0, driftPoints,
      executedAt: new Date().toISOString(), durationMs: Date.now() - start,
    };
    this.traces.push(trace);
    return trace;
  }

  getAll(): GoldenTrace[] { return [...this.traces]; }
  getFailed(): GoldenTrace[] { return this.traces.filter(t => !t.passed); }
  getPassRate(): number {
    return this.traces.length > 0 ? this.traces.filter(t => t.passed).length / this.traces.length : 1;
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createObservabilityService(): ObservabilityService {
  return new ObservabilityService();
}

export function createAttributionTracker(): AttributionTracker {
  return new AttributionTracker();
}

export function createGoldenTraceRunner(): GoldenTraceRunner {
  return new GoldenTraceRunner();
}

