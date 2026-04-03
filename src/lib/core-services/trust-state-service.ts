// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust State Service
// Trust scoring (0-100) per entity, security flags, audit logs,
// automatic downgrade on violations, and recovery paths
// ═══════════════════════════════════════════════════════════════

export type SecurityFlag = "anomaly" | "breach" | "escalation" | "policy-violation" | "suspicious-activity" | "credential-exposure";

export interface TrustState {
  entityId: string;
  entityType: "user" | "advisor" | "agent" | "connector" | "workflow" | "device";
  score: number;               // 0-100
  flags: SecurityFlag[];
  lastVerified: number;
  lastScoreChange: number;
  verificationCount: number;
  status: "trusted" | "provisional" | "restricted" | "suspended";
}

export interface TrustChangeRecord {
  id: string;
  entityId: string;
  previousScore: number;
  newScore: number;
  previousStatus: TrustState["status"];
  newStatus: TrustState["status"];
  reason: string;
  source: string;
  flagsAdded: SecurityFlag[];
  flagsRemoved: SecurityFlag[];
  timestamp: number;
}

// Score thresholds for status transitions
const TRUST_THRESHOLDS = {
  trusted: 80,
  provisional: 50,
  restricted: 25,
  // Below 25 = suspended
};

// Automatic score penalties by violation type
const VIOLATION_PENALTIES: Record<SecurityFlag, number> = {
  "anomaly": 10,
  "breach": 40,
  "escalation": 5,
  "policy-violation": 15,
  "suspicious-activity": 20,
  "credential-exposure": 35,
};

// Recovery points per verification
const RECOVERY_PER_VERIFICATION = 5;
const MAX_RECOVERY_PER_DAY = 15;

export class TrustStateService {
  private states: Map<string, TrustState> = new Map();
  private auditLog: TrustChangeRecord[] = [];
  private maxAuditLog = 5000;

  /** Initialize or get trust state for an entity */
  initialize(entityId: string, entityType: TrustState["entityType"], initialScore: number = 80): TrustState {
    if (this.states.has(entityId)) return this.states.get(entityId)!;

    const state: TrustState = {
      entityId,
      entityType,
      score: Math.min(100, Math.max(0, initialScore)),
      flags: [],
      lastVerified: Date.now(),
      lastScoreChange: Date.now(),
      verificationCount: 0,
      status: this.scoreToStatus(initialScore),
    };

    this.states.set(entityId, state);
    return state;
  }

  /** Get current trust state */
  get(entityId: string): TrustState | null {
    return this.states.get(entityId) ?? null;
  }

  /** Report a security flag — automatically downgrades trust score */
  reportFlag(entityId: string, flag: SecurityFlag, source: string, reason?: string): TrustState | null {
    const state = this.states.get(entityId);
    if (!state) return null;

    const previousScore = state.score;
    const previousStatus = state.status;
    const penalty = VIOLATION_PENALTIES[flag] ?? 10;

    state.score = Math.max(0, state.score - penalty);
    if (!state.flags.includes(flag)) {
      state.flags.push(flag);
    }
    state.status = this.scoreToStatus(state.score);
    state.lastScoreChange = Date.now();

    this.logChange({
      entityId,
      previousScore,
      newScore: state.score,
      previousStatus,
      newStatus: state.status,
      reason: reason ?? `Security flag: ${flag}`,
      source,
      flagsAdded: [flag],
      flagsRemoved: [],
    });

    return state;
  }

  /** Clear a security flag */
  clearFlag(entityId: string, flag: SecurityFlag, source: string, reason?: string): TrustState | null {
    const state = this.states.get(entityId);
    if (!state) return null;

    const hadFlag = state.flags.includes(flag);
    if (!hadFlag) return state;

    state.flags = state.flags.filter(f => f !== flag);

    this.logChange({
      entityId,
      previousScore: state.score,
      newScore: state.score,
      previousStatus: state.status,
      newStatus: state.status,
      reason: reason ?? `Flag cleared: ${flag}`,
      source,
      flagsAdded: [],
      flagsRemoved: [flag],
    });

    return state;
  }

  /** Record a successful verification — recovers trust score */
  recordVerification(entityId: string, source: string): TrustState | null {
    const state = this.states.get(entityId);
    if (!state) return null;

    const previousScore = state.score;
    const previousStatus = state.status;

    // Calculate daily recovery cap
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayRecovery = this.auditLog
      .filter(r => r.entityId === entityId && r.timestamp >= todayStart.getTime() && r.newScore > r.previousScore)
      .reduce((s, r) => s + (r.newScore - r.previousScore), 0);

    const recoveryAmount = Math.min(RECOVERY_PER_VERIFICATION, MAX_RECOVERY_PER_DAY - todayRecovery);
    if (recoveryAmount <= 0) return state;

    state.score = Math.min(100, state.score + recoveryAmount);
    state.status = this.scoreToStatus(state.score);
    state.lastVerified = Date.now();
    state.lastScoreChange = Date.now();
    state.verificationCount++;

    this.logChange({
      entityId,
      previousScore,
      newScore: state.score,
      previousStatus,
      newStatus: state.status,
      reason: "Successful verification",
      source,
      flagsAdded: [],
      flagsRemoved: [],
    });

    return state;
  }

  /** Manually set trust score (admin action) */
  setScore(entityId: string, newScore: number, source: string, reason: string): TrustState | null {
    const state = this.states.get(entityId);
    if (!state) return null;

    const previousScore = state.score;
    const previousStatus = state.status;

    state.score = Math.min(100, Math.max(0, newScore));
    state.status = this.scoreToStatus(state.score);
    state.lastScoreChange = Date.now();

    this.logChange({
      entityId,
      previousScore,
      newScore: state.score,
      previousStatus,
      newStatus: state.status,
      reason,
      source,
      flagsAdded: [],
      flagsRemoved: [],
    });

    return state;
  }

  /** Get all entities with a specific status */
  getByStatus(status: TrustState["status"]): TrustState[] {
    return Array.from(this.states.values()).filter(s => s.status === status);
  }

  /** Get all entities with active flags */
  getFlagged(): TrustState[] {
    return Array.from(this.states.values()).filter(s => s.flags.length > 0);
  }

  /** Get audit log */
  getAuditLog(options?: { entityId?: string; since?: number; limit?: number }): TrustChangeRecord[] {
    let log = [...this.auditLog];
    if (options?.entityId) log = log.filter(r => r.entityId === options.entityId);
    if (options?.since) log = log.filter(r => r.timestamp >= options.since!);
    log.sort((a, b) => b.timestamp - a.timestamp);
    return options?.limit ? log.slice(0, options.limit) : log;
  }

  /** Get summary statistics */
  getStats(): { total: number; trusted: number; provisional: number; restricted: number; suspended: number; flagged: number; avgScore: number } {
    const states = Array.from(this.states.values());
    return {
      total: states.length,
      trusted: states.filter(s => s.status === "trusted").length,
      provisional: states.filter(s => s.status === "provisional").length,
      restricted: states.filter(s => s.status === "restricted").length,
      suspended: states.filter(s => s.status === "suspended").length,
      flagged: states.filter(s => s.flags.length > 0).length,
      avgScore: states.length > 0 ? Math.round(states.reduce((s, st) => s + st.score, 0) / states.length) : 0,
    };
  }

  // ── Private ───────────────────────────────────────────────────

  private scoreToStatus(score: number): TrustState["status"] {
    if (score >= TRUST_THRESHOLDS.trusted) return "trusted";
    if (score >= TRUST_THRESHOLDS.provisional) return "provisional";
    if (score >= TRUST_THRESHOLDS.restricted) return "restricted";
    return "suspended";
  }

  private logChange(record: Omit<TrustChangeRecord, "id" | "timestamp">) {
    const entry: TrustChangeRecord = {
      ...record,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    this.auditLog.push(entry);
    if (this.auditLog.length > this.maxAuditLog) {
      this.auditLog = this.auditLog.slice(-this.maxAuditLog);
    }
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createTrustStateService(): TrustStateService {
  return new TrustStateService();
}
