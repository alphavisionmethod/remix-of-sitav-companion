// ═══════════════════════════════════════════════════════════════
// SITA OS — auditd: Audit Daemon
// Tamper-evident append-only chain, structured events,
// hash chaining, privacy-aware redaction
// ═══════════════════════════════════════════════════════════════

import {
  type OSAuditEvent, type AuditSeverity, type AuditDecision,
  type OSAuthMethod, type AuditSealingCheckpoint,
} from "./types";

// ── Hash Chain ──────────────────────────────────────────────

async function sha256(input: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data.buffer as ArrayBuffer);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ── AuditD Service ──────────────────────────────────────────

interface AuditChainEntry {
  event: OSAuditEvent;
  previousHash: string;
  entryHash: string;
}

export class AuditDaemon {
  private chain: AuditChainEntry[] = [];
  private lastHash = "0000000000000000000000000000000000000000000000000000000000000000";
  private listeners: Array<(event: OSAuditEvent) => void> = [];
  private sealingCheckpoints: AuditSealingCheckpoint[] = [];
  private retentionMaxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
  }

  // ── Record Event ────────────────────────────────────────

  async record(params: {
    actorUserId: string;
    actorSessionId: string;
    actorService?: string;
    action: string;
    resource?: string;
    decision: AuditDecision;
    reason?: string;
    severity: AuditSeverity;
    correlationId?: string;
    authMethod?: OSAuthMethod;
    metadata?: Record<string, unknown>;
    elevationUsed?: boolean;
    devicePostureHash?: string;
  }): Promise<OSAuditEvent> {
    const event: OSAuditEvent = {
      eventId: crypto.randomUUID(),
      timestamp: Date.now(),
      actorUserId: params.actorUserId,
      actorSessionId: params.actorSessionId,
      actorService: params.actorService,
      action: params.action,
      resource: params.resource,
      decision: params.decision,
      reason: params.reason,
      severity: params.severity,
      correlationId: params.correlationId || crypto.randomUUID(),
      authMethod: params.authMethod,
      metadata: {
        ...params.metadata,
        elevationUsed: params.elevationUsed,
        devicePostureHash: params.devicePostureHash,
        previousEventHash: this.lastHash,
      },
    };

    const entryContent = `${this.lastHash}:${JSON.stringify(event)}`;
    const entryHash = await sha256(entryContent);

    const entry: AuditChainEntry = { event, previousHash: this.lastHash, entryHash };
    this.chain.push(entry);
    this.lastHash = entryHash;

    if (this.chain.length > 50000) this.chain = this.chain.slice(-25000);
    for (const l of this.listeners) { try { l(event); } catch {} }

    return event;
  }

  // ── Convenience Methods ─────────────────────────────────

  async logAuth(
    userId: string, sessionId: string, action: "login" | "unlock" | "elevation",
    success: boolean, method?: OSAuthMethod, reason?: string
  ): Promise<OSAuditEvent> {
    return this.record({
      actorUserId: userId, actorSessionId: sessionId,
      action: `auth.${action}`, decision: success ? "allowed" : "failed",
      severity: success ? "info" : "warning", authMethod: method, reason,
    });
  }

  async logAuthorization(
    userId: string, sessionId: string, action: string,
    decision: AuditDecision, severity: AuditSeverity, reason?: string
  ): Promise<OSAuditEvent> {
    return this.record({
      actorUserId: userId, actorSessionId: sessionId,
      action: `policy.${action}`, decision, severity, reason,
    });
  }

  async logSecretAccess(
    userId: string, sessionId: string, secretId: string,
    accessAction: string, granted: boolean
  ): Promise<OSAuditEvent> {
    return this.record({
      actorUserId: userId, actorSessionId: sessionId,
      action: `secrets.${accessAction}`, resource: secretId,
      decision: granted ? "allowed" : "denied", severity: "high",
    });
  }

  async logElevation(
    userId: string, sessionId: string, action: string,
    success: boolean, method?: OSAuthMethod
  ): Promise<OSAuditEvent> {
    return this.record({
      actorUserId: userId, actorSessionId: sessionId,
      action: `elevation.${action}`, decision: success ? "elevated" : "failed",
      severity: success ? "high" : "critical", authMethod: method,
      elevationUsed: true,
    });
  }

  // ── Log Sealing ─────────────────────────────────────────

  async sealCheckpoint(): Promise<AuditSealingCheckpoint> {
    const lastCp = this.sealingCheckpoints[this.sealingCheckpoints.length - 1];
    const startIndex = lastCp ? lastCp.endIndex : 0;
    const endIndex = this.chain.length;

    const chainHash = this.lastHash;
    const checkpoint: AuditSealingCheckpoint = {
      checkpointId: crypto.randomUUID(),
      sealedAt: Date.now(),
      startIndex, endIndex,
      entriesCount: endIndex - startIndex,
      chainHash,
      previousCheckpointHash: lastCp?.chainHash,
    };

    this.sealingCheckpoints.push(checkpoint);
    return checkpoint;
  }

  getSealingCheckpoints(): AuditSealingCheckpoint[] {
    return [...this.sealingCheckpoints];
  }

  // ── Query ───────────────────────────────────────────────

  getEvents(filters?: {
    severity?: AuditSeverity;
    userId?: string;
    action?: string;
    since?: number;
    limit?: number;
  }): OSAuditEvent[] {
    let events = this.chain.map(e => e.event);
    if (filters?.severity) {
      const severityOrder: Record<AuditSeverity, number> = { info: 0, warning: 1, high: 2, critical: 3 };
      const minSev = severityOrder[filters.severity];
      events = events.filter(e => severityOrder[e.severity] >= minSev);
    }
    if (filters?.userId) events = events.filter(e => e.actorUserId === filters.userId);
    if (filters?.action) events = events.filter(e => e.action.includes(filters.action!));
    if (filters?.since) events = events.filter(e => e.timestamp >= filters.since!);
    const limit = filters?.limit || 100;
    return events.slice(-limit).reverse();
  }

  getEventById(eventId: string): OSAuditEvent | undefined {
    return this.chain.find(e => e.event.eventId === eventId)?.event;
  }

  // ── Chain Integrity Verification ────────────────────────

  async verifyChainIntegrity(startIndex = 0, endIndex?: number): Promise<{
    valid: boolean;
    checkedEntries: number;
    firstInvalidIndex?: number;
  }> {
    const end = endIndex ?? this.chain.length;
    let prevHash = startIndex === 0
      ? "0000000000000000000000000000000000000000000000000000000000000000"
      : this.chain[startIndex - 1].entryHash;
    for (let i = startIndex; i < end; i++) {
      const entry = this.chain[i];
      if (entry.previousHash !== prevHash) return { valid: false, checkedEntries: i - startIndex, firstInvalidIndex: i };
      const computed = await sha256(`${entry.previousHash}:${JSON.stringify(entry.event)}`);
      if (computed !== entry.entryHash) return { valid: false, checkedEntries: i - startIndex, firstInvalidIndex: i };
      prevHash = entry.entryHash;
    }
    return { valid: true, checkedEntries: end - startIndex };
  }

  async getChainIntegrity(): Promise<{
    valid: boolean; totalEntries: number; checkedEntries: number;
    sealedCheckpoints: number; lastSealedAt?: number;
  }> {
    const result = await this.verifyChainIntegrity();
    const lastCp = this.sealingCheckpoints[this.sealingCheckpoints.length - 1];
    return {
      ...result,
      totalEntries: this.chain.length,
      sealedCheckpoints: this.sealingCheckpoints.length,
      lastSealedAt: lastCp?.sealedAt,
    };
  }

  // ── Export with Privacy Redaction ────────────────────────

  exportEvents(filters?: { redactPII?: boolean; since?: number; severity?: AuditSeverity }): string {
    let events = this.chain.map(e => e.event);
    if (filters?.since) events = events.filter(e => e.timestamp >= filters.since!);
    if (filters?.severity) {
      const severityOrder: Record<AuditSeverity, number> = { info: 0, warning: 1, high: 2, critical: 3 };
      const minSev = severityOrder[filters.severity];
      events = events.filter(e => severityOrder[e.severity] >= minSev);
    }
    if (filters?.redactPII) {
      events = events.map(e => ({
        ...e,
        actorUserId: e.actorUserId.slice(0, 4) + "****" + e.actorUserId.slice(-4),
        actorSessionId: e.actorSessionId.slice(0, 4) + "****",
        metadata: undefined,
      }));
    }
    return JSON.stringify(events, null, 2);
  }

  // ── Retention Policy ────────────────────────────────────

  enforceRetention(): { archived: number; remaining: number } {
    const cutoff = Date.now() - this.retentionMaxAge;
    const beforeCount = this.chain.length;
    this.chain = this.chain.filter(e => e.event.timestamp >= cutoff);
    return { archived: beforeCount - this.chain.length, remaining: this.chain.length };
  }

  setRetentionDays(days: number): void {
    this.retentionMaxAge = days * 24 * 60 * 60 * 1000;
  }

  // ── Listeners ───────────────────────────────────────────

  onEvent(listener: (event: OSAuditEvent) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  // ── Severity Counts ─────────────────────────────────────

  getSeverityCounts(since?: number): Record<AuditSeverity, number> {
    let events = this.chain.map(e => e.event);
    if (since) events = events.filter(e => e.timestamp >= since);
    const counts: Record<AuditSeverity, number> = { info: 0, warning: 0, high: 0, critical: 0 };
    for (const e of events) counts[e.severity]++;
    return counts;
  }

  getStats() {
    const events = this.chain.map(e => e.event);
    const severityCounts: Record<AuditSeverity, number> = { info: 0, warning: 0, high: 0, critical: 0 };
    for (const e of events) severityCounts[e.severity]++;
    return {
      totalEvents: this.chain.length,
      chainLength: this.chain.length,
      lastEventAt: events[events.length - 1]?.timestamp,
      severityCounts,
      sealingCheckpoints: this.sealingCheckpoints.length,
      lastSealedAt: this.sealingCheckpoints[this.sealingCheckpoints.length - 1]?.sealedAt,
    };
  }
}

// ── Singleton ──────────────────────────────────────────────

let _auditd: AuditDaemon | null = null;
export function getAuditDaemon(): AuditDaemon {
  if (!_auditd) _auditd = new AuditDaemon();
  return _auditd;
}
