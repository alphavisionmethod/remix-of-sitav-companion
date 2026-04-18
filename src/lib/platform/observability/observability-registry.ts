// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Service: Observability Registry
// Layer 3 · structured logs / metrics / traces / drift / diagnostics
// Companion doc: docs/architecture/OBSERVABILITY_AND_INCIDENT_MODEL.md
// ═══════════════════════════════════════════════════════════════

export type SignalKind = "log" | "metric" | "trace" | "drift" | "diagnostic" | "incident";
export type SignalSeverity = "info" | "warn" | "error" | "critical";
export type SignalRuntime = "web" | "desktop" | "appliance" | "mobile" | "edge" | "kernel";

export interface ObservabilitySignal {
  readonly signalId: string;
  readonly kind: SignalKind;
  readonly displayName: string;
  readonly source: string;                 // service / module emitting the signal
  readonly defaultSeverity: SignalSeverity;
  readonly runtimes: readonly SignalRuntime[];
  readonly retentionDays: number;
  readonly userVisible: boolean;
  readonly adminSurfaceRoute: string | null; // where admin can inspect
  readonly killSwitchOnFlood: string | null;
  readonly notes: string;
}

export const OBSERVABILITY_REGISTRY: readonly ObservabilitySignal[] = [
  // ── Logs ──────────────────────────────────────────────────────
  { signalId: "log.app.action",             kind: "log",        displayName: "Application Action Log",     source: "core.action-executor", defaultSeverity: "info",  runtimes: ["web","desktop","appliance","mobile","edge"], retentionDays: 30,  userVisible: false, adminSurfaceRoute: "/admin/logs",          killSwitchOnFlood: null,            notes: "Structured per-action log" },
  { signalId: "log.app.error",              kind: "log",        displayName: "Application Error Log",      source: "core.error-reporter", defaultSeverity: "error", runtimes: ["web","desktop","appliance","mobile","edge","kernel"], retentionDays: 90, userVisible: false, adminSurfaceRoute: "/admin/logs/errors", killSwitchOnFlood: "log-flood-kill", notes: "Captured client + server errors" },
  { signalId: "log.security.event",         kind: "log",        displayName: "Security Event Log",         source: "trust-governor",       defaultSeverity: "warn",  runtimes: ["web","desktop","appliance","mobile","edge","kernel"], retentionDays: 365 * 7, userVisible: false, adminSurfaceRoute: "/admin/logs/security", killSwitchOnFlood: null, notes: "Auth, MFA, suspicious activity" },

  // ── Metrics ───────────────────────────────────────────────────
  { signalId: "metric.executor.latency_ms", kind: "metric",     displayName: "Executor Latency (ms)",      source: "core.action-executor", defaultSeverity: "info",  runtimes: ["edge","kernel"], retentionDays: 90,  userVisible: false, adminSurfaceRoute: "/admin/health/executor", killSwitchOnFlood: null, notes: "p50/p95/p99 reported" },
  { signalId: "metric.connector.uptime",    kind: "metric",     displayName: "Connector Uptime",           source: "connector-control-plane", defaultSeverity: "warn", runtimes: ["edge"], retentionDays: 90, userVisible: true, adminSurfaceRoute: "/admin/integrations", killSwitchOnFlood: null, notes: "Per connector heartbeat" },
  { signalId: "metric.ai.cost_cents",       kind: "metric",     displayName: "AI Cost (cents)",            source: "ai-gateway",           defaultSeverity: "warn",  runtimes: ["edge"], retentionDays: 365, userVisible: true,  adminSurfaceRoute: "/admin/ai-runtime/cost", killSwitchOnFlood: "ai-cost-kill", notes: "Per user / per role" },
  { signalId: "metric.session.active",      kind: "metric",     displayName: "Active Sessions",            source: "session-registry",     defaultSeverity: "info",  runtimes: ["edge"], retentionDays: 30,  userVisible: false, adminSurfaceRoute: "/admin/users",         killSwitchOnFlood: null, notes: "Per-plane gauge" },

  // ── Traces ────────────────────────────────────────────────────
  { signalId: "trace.command.lifecycle",    kind: "trace",      displayName: "Command Lifecycle Trace",    source: "core.action-executor", defaultSeverity: "info",  runtimes: ["edge","kernel"], retentionDays: 14, userVisible: false, adminSurfaceRoute: "/admin/traces",      killSwitchOnFlood: null, notes: "Spans across executor → connector" },
  { signalId: "trace.advisor.invocation",   kind: "trace",      displayName: "Advisor Invocation Trace",   source: "advisor-runtime",      defaultSeverity: "info",  runtimes: ["edge"],          retentionDays: 30, userVisible: false, adminSurfaceRoute: "/admin/ai-runtime",  killSwitchOnFlood: null, notes: "Includes prompt + model + cost" },

  // ── Drift indicators ──────────────────────────────────────────
  { signalId: "drift.policy.coverage",      kind: "drift",      displayName: "Policy Coverage Drift",      source: "policy-engine",        defaultSeverity: "warn",  runtimes: ["edge"], retentionDays: 365, userVisible: false, adminSurfaceRoute: "/admin/policies/coverage", killSwitchOnFlood: null, notes: "Detect policy/registry mismatch" },
  { signalId: "drift.schema.manifest",      kind: "drift",      displayName: "Schema Manifest Drift",      source: "manifest-truth",       defaultSeverity: "warn",  runtimes: ["edge"], retentionDays: 365, userVisible: false, adminSurfaceRoute: "/admin/backend-topology",  killSwitchOnFlood: null, notes: "DB schema vs declared manifest" },

  // ── Diagnostics ───────────────────────────────────────────────
  { signalId: "diag.support.bundle",        kind: "diagnostic", displayName: "Support Diagnostic Bundle",  source: "support-diagnostics",  defaultSeverity: "info",  runtimes: ["web","desktop","appliance","mobile"], retentionDays: 90, userVisible: true, adminSurfaceRoute: "/admin/support", killSwitchOnFlood: null, notes: "User-initiated" },

  // ── Incidents ─────────────────────────────────────────────────
  { signalId: "incident.runtime",           kind: "incident",   displayName: "Runtime Incident",           source: "incident-management",  defaultSeverity: "critical", runtimes: ["web","desktop","appliance","mobile","edge","kernel"], retentionDays: 365 * 2, userVisible: true, adminSurfaceRoute: "/admin/incidents", killSwitchOnFlood: null, notes: "Auto + manual" },
] as const;

export function getSignal(signalId: string): ObservabilitySignal | undefined {
  return OBSERVABILITY_REGISTRY.find((s) => s.signalId === signalId);
}

export function signalsByKind(kind: SignalKind): readonly ObservabilitySignal[] {
  return OBSERVABILITY_REGISTRY.filter((s) => s.kind === kind);
}

export function signalsForRuntime(runtime: SignalRuntime): readonly ObservabilitySignal[] {
  return OBSERVABILITY_REGISTRY.filter((s) => s.runtimes.includes(runtime));
}
