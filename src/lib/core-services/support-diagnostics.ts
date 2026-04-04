// ═══════════════════════════════════════════════════════════════
// SITA OS — Support Diagnostics
// System health reports, debug traces, diagnostic tooling
// Canonical contracts: DiagnosticBundle from contracts/specialized
// ═══════════════════════════════════════════════════════════════

import type { DiagnosticBundle as CanonicalDiagnosticBundle } from "@/packages/contracts/specialized/diagnostic-bundle";
import type { CorrelationContext } from "@/packages/contracts";

export type { CanonicalDiagnosticBundle, CorrelationContext as SupportCorrelationContext };

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

// ── Audit Ledger (merged from audit-ledger service) ─────────────────────────

export interface AuditLedgerEntry {
  id: string;
  sequence: number;
  action: string;
  actor: string;
  resource: string;
  resourceId: string;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  metadata: Record<string, unknown>;
  checksum: string;
  previousChecksum?: string;
  timestamp: string;
}

export class AuditLedger {
  private entries: AuditLedgerEntry[] = [];
  private sequence = 0;

  append(action: string, actor: string, resource: string, resourceId: string, details?: {
    previousState?: Record<string, unknown>; newState?: Record<string, unknown>; metadata?: Record<string, unknown>;
  }): AuditLedgerEntry {
    const previousChecksum = this.entries.length > 0 ? this.entries[this.entries.length - 1].checksum : undefined;
    this.sequence++;
    const entry: AuditLedgerEntry = {
      id: `al-${Date.now()}-${this.sequence}`,
      sequence: this.sequence,
      action, actor, resource, resourceId,
      previousState: details?.previousState,
      newState: details?.newState,
      metadata: details?.metadata ?? {},
      checksum: this.computeChecksum(this.sequence, action, actor, previousChecksum),
      previousChecksum,
      timestamp: new Date().toISOString(),
    };
    this.entries.push(entry);
    return entry;
  }

  verifyIntegrity(): { isValid: boolean; brokenAt?: number; totalEntries: number } {
    for (let i = 1; i < this.entries.length; i++) {
      if (this.entries[i].previousChecksum !== this.entries[i - 1].checksum) {
        return { isValid: false, brokenAt: i, totalEntries: this.entries.length };
      }
    }
    return { isValid: true, totalEntries: this.entries.length };
  }

  getEntries(options?: { actor?: string; resource?: string; since?: string; limit?: number }): AuditLedgerEntry[] {
    let filtered = [...this.entries];
    if (options?.actor) filtered = filtered.filter(e => e.actor === options.actor);
    if (options?.resource) filtered = filtered.filter(e => e.resource === options.resource);
    if (options?.since) filtered = filtered.filter(e => e.timestamp >= options.since!);
    if (options?.limit) filtered = filtered.slice(-options.limit);
    return filtered;
  }

  exportForRegulatory(): { entries: AuditLedgerEntry[]; integrity: ReturnType<AuditLedger["verifyIntegrity"]>; exportedAt: string } {
    return { entries: [...this.entries], integrity: this.verifyIntegrity(), exportedAt: new Date().toISOString() };
  }

  private computeChecksum(seq: number, action: string, actor: string, prev?: string): string {
    const raw = `${seq}:${action}:${actor}:${prev ?? "genesis"}:${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) { hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0; }
    return `ck-${Math.abs(hash).toString(36)}`;
  }
}

export function createAuditLedger(): AuditLedger {
  return new AuditLedger();
}

// ── Factory ─────────────────────────────────────────────────────

export function createSupportDiagnostics(): SupportDiagnosticsService {
  return new SupportDiagnosticsService();
}
