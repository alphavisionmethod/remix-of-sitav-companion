// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Engineering: Observation Layer
// Ingests raw signals from frontend, backend, CI, design, a11y,
// performance, support, approvals, rollbacks, and overrides.
// Freshness-aware, confidence-scored, correlation-enabled.
// ═══════════════════════════════════════════════════════════════

export type SignalSource =
  | "frontend-error"
  | "backend-error"
  | "trace"
  | "log"
  | "test-result"
  | "ci-pipeline"
  | "deployment"
  | "config-drift"
  | "design-drift"
  | "accessibility-scan"
  | "performance-metric"
  | "user-friction"
  | "support-report"
  | "approval-event"
  | "rollback-event"
  | "operator-override"
  | "connector-health"
  | "edge-function-health";

export type SignalSeverity = "info" | "low" | "medium" | "high" | "critical";

export type SignalQuality = "verified" | "system-observed" | "self-reported" | "inferred" | "stale";

export interface RawSignal {
  id: string;
  source: SignalSource;
  severity: SignalSeverity;
  quality: SignalQuality;
  title: string;
  detail: string;
  metadata: Record<string, unknown>;
  timestamp: string;
  tenantId: string;
  correlationId?: string;
  affectedSurface?: string;
  affectedService?: string;
  affectedRoute?: string;
  affectedComponent?: string;
  environment?: "preview" | "staging" | "production";
  freshnessMs?: number; // how old the underlying data is
  sourceRef?: string;   // link to original log/trace/report
}

export interface SignalIngestionResult {
  signalId: string;
  accepted: boolean;
  deduplicated: boolean;
  clusterId?: string;
  escalated: boolean;
  confidenceScore: number;
}

export interface NormalizedEvent {
  eventId: string;
  signals: string[];
  category: "issue" | "drift" | "anomaly" | "regression" | "improvement";
  title: string;
  severity: SignalSeverity;
  confidence: number;
  firstSeen: string;
  lastSeen: string;
  signalCount: number;
  affectedSurfaces: string[];
  affectedServices: string[];
}

export interface ObservationLayerConfig {
  deduplicationWindowMs: number;
  autoEscalateSeverities: SignalSeverity[];
  maxSignalsPerMinute: number;
  enabledSources: SignalSource[];
  stalenessThresholdMs: number;
  correlationWindowMs: number;
}

const DEFAULT_CONFIG: ObservationLayerConfig = {
  deduplicationWindowMs: 300_000, // 5 min
  autoEscalateSeverities: ["critical", "high"],
  maxSignalsPerMinute: 500,
  stalenessThresholdMs: 3_600_000, // 1 hour
  correlationWindowMs: 600_000,    // 10 min
  enabledSources: [
    "frontend-error", "backend-error", "trace", "log", "test-result",
    "ci-pipeline", "deployment", "config-drift", "design-drift",
    "accessibility-scan", "performance-metric", "user-friction",
    "support-report", "approval-event", "rollback-event",
    "operator-override", "connector-health", "edge-function-health",
  ],
};

// Confidence by signal quality
const QUALITY_CONFIDENCE: Record<SignalQuality, number> = {
  verified: 95,
  "system-observed": 85,
  "self-reported": 65,
  inferred: 50,
  stale: 30,
};

export class ObservationLayer {
  private signals: RawSignal[] = [];
  private normalizedEvents: NormalizedEvent[] = [];
  private config: ObservationLayerConfig;
  private recentHashes = new Map<string, number>();
  private correlationBuckets = new Map<string, string[]>(); // correlationId → signalIds

  constructor(config: Partial<ObservationLayerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  ingest(signal: RawSignal): SignalIngestionResult {
    if (!this.config.enabledSources.includes(signal.source)) {
      return { signalId: signal.id, accepted: false, deduplicated: false, escalated: false, confidenceScore: 0 };
    }

    // Freshness check — mark stale signals
    if (signal.freshnessMs && signal.freshnessMs > this.config.stalenessThresholdMs) {
      signal.quality = "stale";
    }

    const hash = `${signal.source}:${signal.title}:${signal.affectedService ?? ""}:${signal.affectedRoute ?? ""}`;
    const now = Date.now();
    const lastSeen = this.recentHashes.get(hash);
    const isDuplicate = lastSeen !== undefined && (now - lastSeen) < this.config.deduplicationWindowMs;

    if (isDuplicate) {
      return { signalId: signal.id, accepted: true, deduplicated: true, escalated: false, confidenceScore: QUALITY_CONFIDENCE[signal.quality] };
    }

    this.recentHashes.set(hash, now);
    this.signals.push(signal);

    // Correlation tracking
    if (signal.correlationId) {
      const bucket = this.correlationBuckets.get(signal.correlationId) ?? [];
      bucket.push(signal.id);
      this.correlationBuckets.set(signal.correlationId, bucket);
    }

    const escalated = this.config.autoEscalateSeverities.includes(signal.severity);
    const confidenceScore = this.calculateSignalConfidence(signal);

    return {
      signalId: signal.id,
      accepted: true,
      deduplicated: false,
      escalated,
      confidenceScore,
    };
  }

  private calculateSignalConfidence(signal: RawSignal): number {
    let base = QUALITY_CONFIDENCE[signal.quality];
    // Boost for signals with source references
    if (signal.sourceRef) base = Math.min(base + 5, 98);
    // Boost for correlated signals
    if (signal.correlationId) {
      const bucket = this.correlationBuckets.get(signal.correlationId);
      if (bucket && bucket.length > 1) base = Math.min(base + bucket.length * 3, 98);
    }
    return base;
  }

  // ── Normalized event generation ────────────────────────────

  generateNormalizedEvents(): NormalizedEvent[] {
    const buckets = new Map<string, RawSignal[]>();

    for (const s of this.signals) {
      const key = `${s.source}:${s.affectedService ?? s.affectedSurface ?? "general"}`;
      const bucket = buckets.get(key) ?? [];
      bucket.push(s);
      buckets.set(key, bucket);
    }

    this.normalizedEvents = [];
    for (const [, group] of buckets) {
      if (group.length === 0) continue;
      const category = this.inferCategory(group);
      this.normalizedEvents.push({
        eventId: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        signals: group.map(s => s.id),
        category,
        title: group[0].title,
        severity: this.pickHighest(group),
        confidence: Math.round(group.reduce((a, s) => a + this.calculateSignalConfidence(s), 0) / group.length),
        firstSeen: group.reduce((min, s) => s.timestamp < min ? s.timestamp : min, group[0].timestamp),
        lastSeen: group.reduce((max, s) => s.timestamp > max ? s.timestamp : max, group[0].timestamp),
        signalCount: group.length,
        affectedSurfaces: [...new Set(group.map(s => s.affectedSurface).filter(Boolean) as string[])],
        affectedServices: [...new Set(group.map(s => s.affectedService).filter(Boolean) as string[])],
      });
    }

    return this.normalizedEvents;
  }

  private inferCategory(signals: RawSignal[]): NormalizedEvent["category"] {
    const sources = new Set(signals.map(s => s.source));
    if (sources.has("rollback-event") || sources.has("deployment")) return "regression";
    if (sources.has("design-drift") || sources.has("config-drift")) return "drift";
    if (sources.has("performance-metric")) return "anomaly";
    if (signals.some(s => s.severity === "critical" || s.severity === "high")) return "issue";
    return "issue";
  }

  private pickHighest(signals: RawSignal[]): SignalSeverity {
    const order: SignalSeverity[] = ["critical", "high", "medium", "low", "info"];
    for (const s of order) {
      if (signals.some(sig => sig.severity === s)) return s;
    }
    return "info";
  }

  // ── Queries ────────────────────────────────────────────────

  getRecentSignals(limit = 50): RawSignal[] { return this.signals.slice(-limit); }
  getSignalsBySource(source: SignalSource): RawSignal[] { return this.signals.filter(s => s.source === source); }
  getSignalsBySeverity(severity: SignalSeverity): RawSignal[] { return this.signals.filter(s => s.severity === severity); }
  getSignalsByEnvironment(env: string): RawSignal[] { return this.signals.filter(s => s.environment === env); }
  getCorrelatedSignals(correlationId: string): RawSignal[] {
    const ids = this.correlationBuckets.get(correlationId) ?? [];
    return this.signals.filter(s => ids.includes(s.id));
  }
  getNormalizedEvents(): NormalizedEvent[] { return [...this.normalizedEvents]; }

  getStats() {
    const bySeverity: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    const byQuality: Record<string, number> = {};
    const byEnvironment: Record<string, number> = {};
    for (const s of this.signals) {
      bySeverity[s.severity] = (bySeverity[s.severity] ?? 0) + 1;
      bySource[s.source] = (bySource[s.source] ?? 0) + 1;
      byQuality[s.quality] = (byQuality[s.quality] ?? 0) + 1;
      if (s.environment) byEnvironment[s.environment] = (byEnvironment[s.environment] ?? 0) + 1;
    }
    return { total: this.signals.length, bySeverity, bySource, byQuality, byEnvironment };
  }
}
