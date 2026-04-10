// SITA OS — Observability Hub (merge: observability)
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface HubMetric {
  service: string;
  metric: string;
  value: number;
  timestamp: string;
  correlationId?: string;
  traceId?: string;
  level?: LogLevel;
}

export interface StructuredLogEntry {
  level: LogLevel;
  service: string;
  message: string;
  correlationId?: string;
  traceId?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export class ObservabilityHubService {
  private metrics: HubMetric[] = [];
  private logs: StructuredLogEntry[] = [];
  private static MAX_METRICS = 5000;
  private static MAX_LOGS = 2000;

  push(service: string, metric: string, value: number, opts?: { correlationId?: string; traceId?: string; level?: LogLevel }): void {
    this.metrics.push({
      service, metric, value,
      timestamp: new Date().toISOString(),
      correlationId: opts?.correlationId,
      traceId: opts?.traceId,
      level: opts?.level,
    });
    if (this.metrics.length > ObservabilityHubService.MAX_METRICS) {
      this.metrics = this.metrics.slice(-ObservabilityHubService.MAX_METRICS);
    }
    this._persist();
  }

  log(entry: Omit<StructuredLogEntry, "timestamp">): void {
    const full: StructuredLogEntry = { ...entry, timestamp: new Date().toISOString() };
    this.logs.push(full);
    if (this.logs.length > ObservabilityHubService.MAX_LOGS) {
      this.logs = this.logs.slice(-ObservabilityHubService.MAX_LOGS);
    }
    this._persist();
  }

  query(service: string, metric: string, limit: number = 100): HubMetric[] {
    return this.metrics.filter(m => m.service === service && m.metric === metric).slice(-limit);
  }

  getTraceLog(correlationId: string): StructuredLogEntry[] {
    return this.logs.filter(l => l.correlationId === correlationId);
  }

  getLogsByLevel(level: LogLevel, limit: number = 100): StructuredLogEntry[] {
    return this.logs.filter(l => l.level === level).slice(-limit);
  }

  getRecentLogs(limit: number = 50): StructuredLogEntry[] {
    return this.logs.slice(-limit);
  }

  getServiceHealth(): Record<string, { metrics: number; lastSeen: string; errors: number }> {
    const h: Record<string, { metrics: number; lastSeen: string; errors: number }> = {};
    this.metrics.forEach(m => {
      if (!h[m.service]) h[m.service] = { metrics: 0, lastSeen: m.timestamp, errors: 0 };
      h[m.service].metrics++;
      if (m.level === "error") h[m.service].errors++;
      if (m.timestamp > h[m.service].lastSeen) h[m.service].lastSeen = m.timestamp;
    });
    return h;
  }

  getStats(): { totalMetrics: number; services: number; totalLogs: number; errorCount: number } {
    return {
      totalMetrics: this.metrics.length,
      services: new Set(this.metrics.map(m => m.service)).size,
      totalLogs: this.logs.length,
      errorCount: this.logs.filter(l => l.level === "error").length,
    };
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("observability-hub", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      metrics: this.metrics.slice(-1000), // persist last 1000 for size
      logs: this.logs.slice(-500),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.metrics) this.metrics = state.metrics as HubMetric[];
    if (state.logs) this.logs = state.logs as StructuredLogEntry[];
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("observability-hub");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export const createObservabilityHub = () => new ObservabilityHubService();
