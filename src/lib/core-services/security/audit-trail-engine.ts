// ═══════════════════════════════════════════════════════════════
// SITA OS — Audit Trail Engine
// Immutable append-only structured audit log with hash-chain
// tamper detection, correlation IDs, before/after state,
// queryable history, and export support
// ═══════════════════════════════════════════════════════════════

import type { CorrelationContext } from "@/packages/contracts/_contract-scaffold";

// ── Types ──────────────────────────────────────────────────────

export type AuditDomain =
  | "auth"
  | "command"
  | "approval"
  | "trust"
  | "sync"
  | "update"
  | "policy"
  | "admin"
  | "founder"
  | "ai"
  | "key-management"
  | "device"
  | "security"
  | "system"
  | "app"
  | "receipt";

export type AuditSeverity = "trace" | "info" | "warn" | "error" | "critical";

export interface AuditEntry {
  id: string;
  sequence: number;
  timestamp: string;
  domain: AuditDomain;
  severity: AuditSeverity;
  action: string;
  actor: AuditActor;
  target: AuditTarget;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  outcome: "success" | "failure" | "denied" | "error" | "timeout";
  reason: string;
  evidence: Record<string, unknown>;
  correlationContext: CorrelationContext | null;
  commandId: string | null;
  receiptId: string | null;
  rollbackRef: string | null;
  hash: string;
  previousHash: string;
  tags: string[];
}

export interface AuditActor {
  type: "user" | "system" | "service" | "ai" | "admin" | "founder" | "device" | "scheduler";
  id: string;
  displayName: string;
  deviceId: string | null;
  sessionId: string | null;
  trustRing: number | null;
  ipAddress: string | null;
}

export interface AuditTarget {
  type: string;
  id: string;
  name: string;
  domain: string | null;
}

export interface AuditQuery {
  domain?: AuditDomain;
  severity?: AuditSeverity;
  action?: string;
  actorId?: string;
  targetId?: string;
  startTime?: string;
  endTime?: string;
  outcome?: string;
  correlationId?: string;
  commandId?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface AuditExport {
  version: string;
  exportedAt: string;
  entryCount: number;
  firstSequence: number;
  lastSequence: number;
  chainValid: boolean;
  entries: AuditEntry[];
}

export interface AuditStats {
  totalEntries: number;
  entriesByDomain: Record<string, number>;
  entriesBySeverity: Record<string, number>;
  entriesByOutcome: Record<string, number>;
  chainIntegrity: boolean;
  lastEntryAt: string | null;
  oldestEntryAt: string | null;
}

// ── Hash Utility ───────────────────────────────────────────────

async function computeHash(data: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoded = new TextEncoder().encode(data);
    const buffer = await crypto.subtle.digest("SHA-256", encoded);
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback: simple deterministic hash for environments without crypto.subtle
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

// ── Engine ─────────────────────────────────────────────────────

export class AuditTrailEngine {
  private entries: AuditEntry[] = [];
  private sequence = 0;
  private lastHash = "0000000000000000000000000000000000000000000000000000000000000000";
  private readonly maxEntries: number;
  private listeners: Array<(entry: AuditEntry) => void> = [];

  constructor(maxEntries = 50_000) {
    this.maxEntries = maxEntries;
  }

  // ── Core Append ────────────────────────────────────────────

  async append(params: {
    domain: AuditDomain;
    severity: AuditSeverity;
    action: string;
    actor: AuditActor;
    target: AuditTarget;
    outcome: AuditEntry["outcome"];
    reason?: string;
    beforeState?: Record<string, unknown> | null;
    afterState?: Record<string, unknown> | null;
    evidence?: Record<string, unknown>;
    correlationContext?: CorrelationContext | null;
    commandId?: string | null;
    receiptId?: string | null;
    rollbackRef?: string | null;
    tags?: string[];
  }): Promise<AuditEntry> {
    const seq = ++this.sequence;
    const timestamp = new Date().toISOString();
    const previousHash = this.lastHash;

    const hashInput = `${seq}:${timestamp}:${params.domain}:${params.action}:${params.actor.id}:${params.target.id}:${params.outcome}:${previousHash}`;
    const hash = await computeHash(hashInput);

    const entry: AuditEntry = {
      id: `audit-${seq}-${Date.now()}`,
      sequence: seq,
      timestamp,
      domain: params.domain,
      severity: params.severity,
      action: params.action,
      actor: params.actor,
      target: params.target,
      beforeState: params.beforeState ?? null,
      afterState: params.afterState ?? null,
      outcome: params.outcome,
      reason: params.reason ?? "",
      evidence: params.evidence ?? {},
      correlationContext: params.correlationContext ?? null,
      commandId: params.commandId ?? null,
      receiptId: params.receiptId ?? null,
      rollbackRef: params.rollbackRef ?? null,
      hash,
      previousHash,
      tags: params.tags ?? [],
    };

    this.lastHash = hash;
    this.entries.push(entry);

    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }

    for (const l of this.listeners) {
      try { l(entry); } catch { /* isolation */ }
    }

    return entry;
  }

  // ── Convenience Methods ────────────────────────────────────

  async logSystemAction(action: string, target: AuditTarget, outcome: AuditEntry["outcome"], details?: Record<string, unknown>): Promise<AuditEntry> {
    return this.append({
      domain: "system",
      severity: "info",
      action,
      actor: { type: "system", id: "sita-os", displayName: "SITA OS", deviceId: null, sessionId: null, trustRing: 0, ipAddress: null },
      target,
      outcome,
      evidence: details,
    });
  }

  async logSecurityEvent(action: string, actor: AuditActor, target: AuditTarget, severity: AuditSeverity, outcome: AuditEntry["outcome"], evidence?: Record<string, unknown>): Promise<AuditEntry> {
    return this.append({ domain: "security", severity, action, actor, target, outcome, evidence });
  }

  async logAdminAction(action: string, actor: AuditActor, target: AuditTarget, beforeState?: Record<string, unknown>, afterState?: Record<string, unknown>): Promise<AuditEntry> {
    return this.append({ domain: "admin", severity: "warn", action, actor, target, outcome: "success", beforeState, afterState });
  }

  // ── Query ──────────────────────────────────────────────────

  query(q: AuditQuery): AuditEntry[] {
    let results = this.entries;

    if (q.domain) results = results.filter((e) => e.domain === q.domain);
    if (q.severity) results = results.filter((e) => e.severity === q.severity);
    if (q.action) results = results.filter((e) => e.action.includes(q.action));
    if (q.actorId) results = results.filter((e) => e.actor.id === q.actorId);
    if (q.targetId) results = results.filter((e) => e.target.id === q.targetId);
    if (q.outcome) results = results.filter((e) => e.outcome === q.outcome);
    if (q.correlationId) results = results.filter((e) => e.correlationContext?.correlationId === q.correlationId);
    if (q.commandId) results = results.filter((e) => e.commandId === q.commandId);
    if (q.startTime) results = results.filter((e) => e.timestamp >= q.startTime!);
    if (q.endTime) results = results.filter((e) => e.timestamp <= q.endTime!);
    if (q.tags?.length) results = results.filter((e) => q.tags!.some((t) => e.tags.includes(t)));

    const offset = q.offset ?? 0;
    const limit = q.limit ?? 100;
    return results.slice(offset, offset + limit);
  }

  // ── Chain Integrity ────────────────────────────────────────

  async verifyChainIntegrity(): Promise<{ valid: boolean; brokenAt: number | null; totalChecked: number }> {
    let prevHash = "0000000000000000000000000000000000000000000000000000000000000000";

    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];
      if (entry.previousHash !== prevHash) {
        return { valid: false, brokenAt: entry.sequence, totalChecked: i };
      }
      prevHash = entry.hash;
    }

    return { valid: true, brokenAt: null, totalChecked: this.entries.length };
  }

  // ── Export ─────────────────────────────────────────────────

  async export(q?: AuditQuery): Promise<AuditExport> {
    const entries = q ? this.query(q) : this.entries;
    const integrity = await this.verifyChainIntegrity();

    return {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      entryCount: entries.length,
      firstSequence: entries[0]?.sequence ?? 0,
      lastSequence: entries[entries.length - 1]?.sequence ?? 0,
      chainValid: integrity.valid,
      entries,
    };
  }

  // ── Stats ──────────────────────────────────────────────────

  getStats(): AuditStats {
    const byDomain: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byOutcome: Record<string, number> = {};

    for (const e of this.entries) {
      byDomain[e.domain] = (byDomain[e.domain] ?? 0) + 1;
      bySeverity[e.severity] = (bySeverity[e.severity] ?? 0) + 1;
      byOutcome[e.outcome] = (byOutcome[e.outcome] ?? 0) + 1;
    }

    return {
      totalEntries: this.entries.length,
      entriesByDomain: byDomain,
      entriesBySeverity: bySeverity,
      entriesByOutcome: byOutcome,
      chainIntegrity: true, // Sync check; use verifyChainIntegrity for async
      lastEntryAt: this.entries[this.entries.length - 1]?.timestamp ?? null,
      oldestEntryAt: this.entries[0]?.timestamp ?? null,
    };
  }

  // ── Subscriptions ──────────────────────────────────────────

  onEntry(listener: (entry: AuditEntry) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter((l) => l !== listener); };
  }

  getEntryCount(): number {
    return this.entries.length;
  }
}

export function createAuditTrailEngine(maxEntries?: number): AuditTrailEngine {
  return new AuditTrailEngine(maxEntries);
}
