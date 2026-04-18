// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Health Aggregator
// Aggregate signals from fleet-health, self-healing, immune,
// error-patrol, agent-health, cost-breaker → single score
// ═══════════════════════════════════════════════════════════════

export type HealthTrend = "improving" | "stable" | "degrading";
export type SystemHealthLevel = "nominal" | "degraded" | "critical" | "emergency";

export interface HealthSignal {
  source: string;
  component: string;
  score: number;       // 0-100
  weight: number;      // relative importance
  status: "ok" | "warn" | "error" | "unknown";
  lastUpdated: string;
  details?: Record<string, unknown>;
}

export interface SystemHealthReport {
  overallScore: number;          // 0-100 weighted
  level: SystemHealthLevel;
  trend: HealthTrend;
  signals: HealthSignal[];
  degradedComponents: string[];
  criticalComponents: string[];
  recommendations: HealthRecommendation[];
  computedAt: string;
  historyWindow: number[];       // last N scores for trend
}

export interface HealthRecommendation {
  priority: "critical" | "high" | "medium" | "low";
  component: string;
  action: string;
  reason: string;
  automated: boolean;
}

export interface DegradedModeConfig {
  component: string;
  fallbackBehavior: string;
  maxDurationMs: number;
  autoRecovery: boolean;
}

// Weighted component importance
const COMPONENT_WEIGHTS: Record<string, number> = {
  "fleet-health": 0.20,
  "self-healing": 0.15,
  "immune-controller": 0.15,
  "agent-health": 0.15,
  "cost-breaker": 0.10,
  "error-patrol": 0.10,
  "connector-health": 0.10,
  "database": 0.05,
};

const HISTORY_WINDOW_SIZE = 30;

export class HealthAggregatorService {
  private signals = new Map<string, HealthSignal>();
  private scoreHistory: number[] = [];
  private degradedModes: DegradedModeConfig[] = [];
  private recommendations: HealthRecommendation[] = [];

  // ── Signal Ingestion ──────────────────────────────────────────

  reportSignal(signal: HealthSignal): void {
    const key = `${signal.source}:${signal.component}`;
    signal.lastUpdated = new Date().toISOString();
    this.signals.set(key, signal);
  }

  reportBatch(signals: HealthSignal[]): void {
    for (const s of signals) this.reportSignal(s);
  }

  // Convenience for common sources
  reportFleetHealth(score: number, details?: Record<string, unknown>): void {
    this.reportSignal({
      source: "fleet-health", component: "fleet-health",
      score, weight: COMPONENT_WEIGHTS["fleet-health"] ?? 0.15,
      status: score > 80 ? "ok" : score > 50 ? "warn" : "error",
      lastUpdated: new Date().toISOString(), details,
    });
  }

  reportSelfHealing(activeIncidents: number, healedCount: number): void {
    const score = activeIncidents === 0 ? 100 : Math.max(0, 100 - activeIncidents * 15);
    this.reportSignal({
      source: "self-healing", component: "self-healing",
      score, weight: COMPONENT_WEIGHTS["self-healing"] ?? 0.15,
      status: activeIncidents > 3 ? "error" : activeIncidents > 0 ? "warn" : "ok",
      lastUpdated: new Date().toISOString(),
      details: { activeIncidents, healedCount },
    });
  }

  reportImmuneController(activeThreats: number, quarantinedServices: number): void {
    const score = activeThreats === 0 ? 100 : Math.max(0, 100 - activeThreats * 20);
    this.reportSignal({
      source: "immune-controller", component: "immune-controller",
      score, weight: COMPONENT_WEIGHTS["immune-controller"] ?? 0.15,
      status: activeThreats > 2 ? "error" : activeThreats > 0 ? "warn" : "ok",
      lastUpdated: new Date().toISOString(),
      details: { activeThreats, quarantinedServices },
    });
  }

  reportAgentHealth(avgScore: number, unhealthyCount: number, totalAgents: number): void {
    this.reportSignal({
      source: "agent-health", component: "agent-health",
      score: avgScore, weight: COMPONENT_WEIGHTS["agent-health"] ?? 0.15,
      status: avgScore > 80 ? "ok" : avgScore > 50 ? "warn" : "error",
      lastUpdated: new Date().toISOString(),
      details: { unhealthyCount, totalAgents },
    });
  }

  reportCostBreaker(utilizationPercent: number, haltedAgents: number): void {
    const score = Math.max(0, 100 - utilizationPercent * 100);
    this.reportSignal({
      source: "cost-breaker", component: "cost-breaker",
      score, weight: COMPONENT_WEIGHTS["cost-breaker"] ?? 0.10,
      status: haltedAgents > 0 ? "error" : utilizationPercent > 0.85 ? "warn" : "ok",
      lastUpdated: new Date().toISOString(),
      details: { utilizationPercent, haltedAgents },
    });
  }

  // ── Computation ───────────────────────────────────────────────

  computeHealth(): SystemHealthReport {
    const signals = Array.from(this.signals.values());
    if (signals.length === 0) {
      return {
        overallScore: 100, level: "nominal", trend: "stable",
        signals: [], degradedComponents: [], criticalComponents: [],
        recommendations: [], computedAt: new Date().toISOString(),
        historyWindow: [],
      };
    }

    // Weighted average
    let totalWeight = 0;
    let weightedSum = 0;
    const degradedComponents: string[] = [];
    const criticalComponents: string[] = [];

    for (const s of signals) {
      const w = s.weight || (COMPONENT_WEIGHTS[s.component] ?? 0.1);
      totalWeight += w;
      weightedSum += s.score * w;
      if (s.status === "warn") degradedComponents.push(s.component);
      if (s.status === "error") criticalComponents.push(s.component);
    }

    const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 100;

    // Track history
    this.scoreHistory.push(overallScore);
    if (this.scoreHistory.length > HISTORY_WINDOW_SIZE) this.scoreHistory.shift();

    // Compute trend
    const trend = this.computeTrend();

    // Determine level
    let level: SystemHealthLevel = "nominal";
    if (overallScore < 30 || criticalComponents.length >= 3) level = "emergency";
    else if (overallScore < 50 || criticalComponents.length > 0) level = "critical";
    else if (overallScore < 75 || degradedComponents.length > 0) level = "degraded";

    // Generate recommendations
    this.recommendations = this.generateRecommendations(signals, overallScore);

    return {
      overallScore, level, trend,
      signals: [...signals],
      degradedComponents, criticalComponents,
      recommendations: [...this.recommendations],
      computedAt: new Date().toISOString(),
      historyWindow: [...this.scoreHistory],
    };
  }

  private computeTrend(): HealthTrend {
    if (this.scoreHistory.length < 3) return "stable";
    const recent = this.scoreHistory.slice(-5);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const diff = last - first;
    if (diff > 5) return "improving";
    if (diff < -5) return "degrading";
    return "stable";
  }

  private generateRecommendations(signals: HealthSignal[], overall: number): HealthRecommendation[] {
    const recs: HealthRecommendation[] = [];

    for (const s of signals) {
      if (s.status === "error") {
        recs.push({
          priority: "critical",
          component: s.component,
          action: `Investigate and recover ${s.component} (score: ${s.score})`,
          reason: `Component is in error state`,
          automated: s.component === "agent-health" || s.component === "self-healing",
        });
      } else if (s.score < 50) {
        recs.push({
          priority: "high",
          component: s.component,
          action: `Review ${s.component} health metrics`,
          reason: `Health score below 50 (${s.score})`,
          automated: false,
        });
      }
    }

    if (overall < 50) {
      recs.push({
        priority: "critical",
        component: "system",
        action: "Enter degraded mode — reduce non-essential operations",
        reason: `System health critically low (${overall})`,
        automated: true,
      });
    }

    return recs.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.priority] - order[b.priority];
    });
  }

  // ── Degraded Mode ─────────────────────────────────────────────

  registerDegradedMode(config: DegradedModeConfig): void {
    this.degradedModes.push(config);
  }

  getDegradedModes(): DegradedModeConfig[] {
    return [...this.degradedModes];
  }

  getActiveDegradedComponents(): string[] {
    return Array.from(this.signals.values())
      .filter(s => s.status === "error" || s.status === "warn")
      .map(s => s.component);
  }

  // ── Queries ───────────────────────────────────────────────────

  getSignal(source: string, component: string): HealthSignal | null {
    return this.signals.get(`${source}:${component}`) ?? null;
  }

  getAllSignals(): HealthSignal[] {
    return Array.from(this.signals.values());
  }

  getScoreHistory(): number[] {
    return [...this.scoreHistory];
  }

  getLastRecommendations(): HealthRecommendation[] {
    return [...this.recommendations];
  }
}

export function createHealthAggregator(): HealthAggregatorService {
  return new HealthAggregatorService();
}

