// ═══════════════════════════════════════════════════════════════
// SITA OS — Telemetry Package
// ═══════════════════════════════════════════════════════════════

export type TelemetryEventType = "page_view" | "action" | "error" | "performance" | "ai_request" | "approval" | "workflow" | "search";

export interface TelemetryEvent {
  id: string;
  type: TelemetryEventType;
  name: string;
  domain: string;
  userId?: string;
  timestamp: number;
  properties: Record<string, unknown>;
  duration?: number;
  sessionId: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: "ms" | "bytes" | "count" | "percent";
  timestamp: number;
}

export interface AITelemetry {
  model: string;
  tokensUsed: number;
  latencyMs: number;
  cost: number;
  cached: boolean;
}

const eventQueue: TelemetryEvent[] = [];
let sessionId = typeof crypto !== "undefined" ? crypto.randomUUID() : "session";

export const track = (type: TelemetryEventType, name: string, properties: Record<string, unknown> = {}, domain = "system"): void => {
  eventQueue.push({
    id: crypto.randomUUID(),
    type,
    name,
    domain,
    timestamp: Date.now(),
    properties,
    sessionId,
  });
};

export const flush = (): TelemetryEvent[] => {
  const events = [...eventQueue];
  eventQueue.length = 0;
  return events;
};

export const getSessionId = () => sessionId;
export const resetSession = () => { sessionId = crypto.randomUUID(); };

// ── SLA Definitions ─────────────────────────────────────────

export type SLAMetric = "availability" | "latency_p50" | "latency_p99" | "error_rate" | "throughput";

export interface SLADefinition {
  readonly id: string;
  readonly serviceId: string;
  readonly metric: SLAMetric;
  readonly target: number;
  readonly unit: string;
  readonly window: "1m" | "5m" | "1h" | "24h" | "7d" | "30d";
}

// ── Health Checks ───────────────────────────────────────────

export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

export interface HealthCheck {
  readonly serviceId: string;
  readonly status: HealthStatus;
  readonly lastChecked: number;
  readonly latencyMs: number;
  readonly message?: string;
  readonly dependencies: HealthCheck[];
}

// ── Incident Records ────────────────────────────────────────

export type TelemetryIncidentSeverity = "critical" | "major" | "minor" | "informational";

export interface IncidentTimelineEntry {
  readonly timestamp: number;
  readonly action: string;
  readonly actor: string;
  readonly note?: string;
}

export interface IncidentRecord {
  readonly id: string;
  readonly severity: TelemetryIncidentSeverity;
  readonly serviceId: string;
  readonly title: string;
  readonly status: "open" | "investigating" | "mitigated" | "resolved";
  readonly openedAt: number;
  readonly resolvedAt?: number;
  readonly timeline: IncidentTimelineEntry[];
  readonly relatedAlerts: string[];
}

// ── Alert Rules ─────────────────────────────────────────────

export interface AlertRule {
  readonly id: string;
  readonly serviceId: string;
  readonly metric: SLAMetric;
  readonly condition: "above" | "below" | "equals";
  readonly threshold: number;
  readonly window: string;
  readonly severity: TelemetryIncidentSeverity;
  readonly enabled: boolean;
  readonly notifyChannels: string[];
}

// ── Observability Contract ──────────────────────────────────

export interface ObservabilityContract {
  readonly featureId: string;
  readonly slas: SLADefinition[];
  readonly healthChecks: string[];
  readonly alertRules: string[];
  readonly dashboardId?: string;
  readonly runbookUrl?: string;
}
