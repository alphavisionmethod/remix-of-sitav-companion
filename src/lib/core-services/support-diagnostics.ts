// ═══════════════════════════════════════════════════════════════
// SITA OS — Support Diagnostics
// System health reports, debug traces, diagnostic tooling
// ═══════════════════════════════════════════════════════════════

export type DiagnosticSeverity = "info" | "warning" | "error" | "critical";
export type DiagnosticCategory = "service" | "connector" | "policy" | "execution" | "memory" | "event-bus" | "trust" | "performance";

export interface DiagnosticEntry {
  id: string;
  category: DiagnosticCategory;
  severity: DiagnosticSeverity;
  service: string;
  message: string;
  details: Record<string, unknown>;
  correlationId?: string;
  timestamp: number;
}

export interface SystemHealthReport {
  overallStatus: "healthy" | "degraded" | "critical";
  generatedAt: number;
  services: ServiceDiagnostic[];
  activeAlerts: DiagnosticEntry[];
  recentErrors: DiagnosticEntry[];
  uptime: number;
}

export interface ServiceDiagnostic {
  serviceId: string;
  status: "healthy" | "degraded" | "down";
  latencyMs: number;
  errorRate: number;
  lastChecked: number;
}

export interface DebugTrace {
  correlationId: string;
  entries: DiagnosticEntry[];
  startTime: number;
  endTime?: number;
  totalDurationMs: number;
}

// ── Support Diagnostics Service ─────────────────────────────────

export class SupportDiagnosticsService {
  private entries: DiagnosticEntry[] = [];
  private startTime = Date.now();
  private maxEntries = 10_000;

  record(category: DiagnosticCategory, severity: DiagnosticSeverity, service: string, message: string, details: Record<string, unknown> = {}, correlationId?: string): DiagnosticEntry {
    if (this.entries.length >= this.maxEntries) {
      this.entries = this.entries.slice(-Math.floor(this.maxEntries / 2));
    }

    const entry: DiagnosticEntry = {
      id: `diag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category, severity, service, message, details, correlationId, timestamp: Date.now(),
    };
    this.entries.push(entry);
    return entry;
  }

  getAlerts(minSeverity: DiagnosticSeverity = "warning"): DiagnosticEntry[] {
    const severityOrder: Record<DiagnosticSeverity, number> = { info: 0, warning: 1, error: 2, critical: 3 };
    const minLevel = severityOrder[minSeverity];
    return this.entries.filter(e => severityOrder[e.severity] >= minLevel);
  }

  getTrace(correlationId: string): DebugTrace {
    const traceEntries = this.entries.filter(e => e.correlationId === correlationId).sort((a, b) => a.timestamp - b.timestamp);
    const startTime = traceEntries[0]?.timestamp ?? 0;
    const endTime = traceEntries[traceEntries.length - 1]?.timestamp;

    return {
      correlationId, entries: traceEntries, startTime,
      endTime, totalDurationMs: endTime ? endTime - startTime : 0,
    };
  }

  generateHealthReport(serviceStatuses: ServiceDiagnostic[]): SystemHealthReport {
    const recentErrors = this.entries.filter(e => e.severity === "error" || e.severity === "critical").slice(-20);
    const activeAlerts = this.getAlerts("warning").slice(-10);

    const hasDown = serviceStatuses.some(s => s.status === "down");
    const hasDegraded = serviceStatuses.some(s => s.status === "degraded");
    const hasCritical = recentErrors.some(e => e.severity === "critical");

    return {
      overallStatus: hasDown || hasCritical ? "critical" : hasDegraded ? "degraded" : "healthy",
      generatedAt: Date.now(),
      services: serviceStatuses,
      activeAlerts, recentErrors,
      uptime: Date.now() - this.startTime,
    };
  }

  query(options?: { category?: DiagnosticCategory; service?: string; since?: number; limit?: number }): DiagnosticEntry[] {
    let filtered = [...this.entries];
    if (options?.category) filtered = filtered.filter(e => e.category === options.category);
    if (options?.service) filtered = filtered.filter(e => e.service === options.service);
    if (options?.since) filtered = filtered.filter(e => e.timestamp >= options.since!);
    if (options?.limit) filtered = filtered.slice(-options.limit);
    return filtered;
  }

  getHealth(): { status: "healthy"; entriesStored: number; uptimeMs: number } {
    return { status: "healthy", entriesStored: this.entries.length, uptimeMs: Date.now() - this.startTime };
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createSupportDiagnostics(): SupportDiagnosticsService {
  return new SupportDiagnosticsService();
}
