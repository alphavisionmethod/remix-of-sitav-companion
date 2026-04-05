// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Engineering: Observation Layer
// Ingests raw signals from frontend, backend, CI, design, a11y,
// performance, support, approvals, rollbacks, and overrides
// ═══════════════════════════════════════════════════════════════

export type SignalSource =
  | "frontend-error"
  | "backend-error"
  | "trace"
  | "log"
  | "test-result"
  | "ci-pipeline"
  | "deployment"
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

export interface RawSignal {
  id: string;
  source: SignalSource;
  severity: SignalSeverity;
  title: string;
  detail: string;
  metadata: Record<string, unknown>;
  timestamp: string;
  tenantId: string;
  correlationId?: string;
  affectedSurface?: string;
  affectedService?: string;
}

export interface SignalIngestionResult {
  signalId: string;
  accepted: boolean;
  deduplicated: boolean;
  clusterId?: string;
  escalated: boolean;
}

export interface ObservationLayerConfig {
  deduplicationWindowMs: number;
  autoEscalateSeverities: SignalSeverity[];
  maxSignalsPerMinute: number;
  enabledSources: SignalSource[];
}

const DEFAULT_CONFIG: ObservationLayerConfig = {
  deduplicationWindowMs: 300_000, // 5 min
  autoEscalateSeverities: ["critical", "high"],
  maxSignalsPerMinute: 500,
  enabledSources: [
    "frontend-error", "backend-error", "trace", "log", "test-result",
    "ci-pipeline", "deployment", "design-drift", "accessibility-scan",
    "performance-metric", "user-friction", "support-report",
    "approval-event", "rollback-event", "operator-override",
    "connector-health", "edge-function-health",
  ],
};

export class ObservationLayer {
  private signals: RawSignal[] = [];
  private config: ObservationLayerConfig;
  private recentHashes = new Map<string, number>();

  constructor(config: Partial<ObservationLayerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  ingest(signal: RawSignal): SignalIngestionResult {
    if (!this.config.enabledSources.includes(signal.source)) {
      return { signalId: signal.id, accepted: false, deduplicated: false, escalated: false };
    }

    const hash = `${signal.source}:${signal.title}:${signal.affectedService ?? ""}`;
    const now = Date.now();
    const lastSeen = this.recentHashes.get(hash);
    const isDuplicate = lastSeen !== undefined && (now - lastSeen) < this.config.deduplicationWindowMs;

    if (isDuplicate) {
      return { signalId: signal.id, accepted: true, deduplicated: true, escalated: false };
    }

    this.recentHashes.set(hash, now);
    this.signals.push(signal);

    const escalated = this.config.autoEscalateSeverities.includes(signal.severity);

    return {
      signalId: signal.id,
      accepted: true,
      deduplicated: false,
      escalated,
    };
  }

  getRecentSignals(limit = 50): RawSignal[] {
    return this.signals.slice(-limit);
  }

  getSignalsBySource(source: SignalSource): RawSignal[] {
    return this.signals.filter(s => s.source === source);
  }

  getSignalsBySeverity(severity: SignalSeverity): RawSignal[] {
    return this.signals.filter(s => s.severity === severity);
  }

  getStats() {
    const bySeverity: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    for (const s of this.signals) {
      bySeverity[s.severity] = (bySeverity[s.severity] ?? 0) + 1;
      bySource[s.source] = (bySource[s.source] ?? 0) + 1;
    }
    return { total: this.signals.length, bySeverity, bySource };
  }
}
