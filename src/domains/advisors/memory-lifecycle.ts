// ═══════════════════════════════════════════════════════════════
// SITA OS — Memory Truth Lifecycle
// Decay, reconfirmation, conflict resolution, poisoning
// protection, and TTL policies for advisor memories
// ═══════════════════════════════════════════════════════════════

// ── Memory Classification ─────────────────────────────────

export type MemoryClass =
  | "user-confirmed"       // User explicitly stated this
  | "inferred-preference"  // System inferred from behavior
  | "observed-pattern"     // Detected from data patterns
  | "correction"           // User corrected previous advisor output
  | "decision-record"      // Records a past decision
  | "entity-fact"          // Fact about an entity (client, asset, etc.)
  | "contextual"           // Session/time-specific context
  | "sensitive"            // Requires reconfirmation before use
  | "system-derived";      // Computed by system processes

export type MemoryReliability = "confirmed" | "high" | "moderate" | "low" | "degraded" | "expired" | "poisoned";

export type MemoryLifecycleState =
  | "active"
  | "aging"
  | "stale"
  | "pending-reconfirmation"
  | "reconfirmed"
  | "conflicted"
  | "expired"
  | "deleted"
  | "quarantined"; // suspected poisoning

// ── Memory Record ─────────────────────────────────────────

export interface AdvisorMemoryRecord {
  id: string;
  advisorId: string;
  domain: string;
  memoryClass: MemoryClass;
  key: string;
  value: string;
  confidence: number;
  reliability: MemoryReliability;
  lifecycleState: MemoryLifecycleState;

  // Provenance
  source: string; // what created this memory
  sourceType: "user-input" | "system-inference" | "correction" | "observation" | "import";
  evidenceRef?: string;

  // Lifecycle
  createdAt: string;
  lastAccessedAt: string;
  lastReconfirmedAt?: string;
  expiresAt?: string;
  reconfirmationDueAt?: string;

  // Conflict
  conflictsWith?: string[]; // other memory IDs
  overriddenBy?: string;
  overrides?: string;

  // Audit
  accessCount: number;
  usedInRecommendations: number;
  lastRecommendationId?: string;
}

// ── TTL Policies by Memory Class ──────────────────────────

export interface MemoryTTLPolicy {
  memoryClass: MemoryClass;
  defaultTTLDays: number;
  maxTTLDays: number;
  reconfirmationIntervalDays: number;
  decayStartDays: number;
  requiresReconfirmationBeforeUse: boolean;
  autoExpire: boolean;
  sensitiveReconfirmation: boolean;
}

export const MEMORY_TTL_POLICIES: MemoryTTLPolicy[] = [
  { memoryClass: "user-confirmed",       defaultTTLDays: 365, maxTTLDays: 730, reconfirmationIntervalDays: 180, decayStartDays: 90,  requiresReconfirmationBeforeUse: false, autoExpire: false, sensitiveReconfirmation: false },
  { memoryClass: "inferred-preference",  defaultTTLDays: 90,  maxTTLDays: 180, reconfirmationIntervalDays: 60,  decayStartDays: 30,  requiresReconfirmationBeforeUse: false, autoExpire: true,  sensitiveReconfirmation: false },
  { memoryClass: "observed-pattern",     defaultTTLDays: 60,  maxTTLDays: 120, reconfirmationIntervalDays: 30,  decayStartDays: 14,  requiresReconfirmationBeforeUse: false, autoExpire: true,  sensitiveReconfirmation: false },
  { memoryClass: "correction",           defaultTTLDays: 365, maxTTLDays: 730, reconfirmationIntervalDays: 365, decayStartDays: 180, requiresReconfirmationBeforeUse: false, autoExpire: false, sensitiveReconfirmation: false },
  { memoryClass: "decision-record",      defaultTTLDays: 730, maxTTLDays: 1825,reconfirmationIntervalDays: 365, decayStartDays: 365, requiresReconfirmationBeforeUse: false, autoExpire: false, sensitiveReconfirmation: false },
  { memoryClass: "entity-fact",          defaultTTLDays: 180, maxTTLDays: 365, reconfirmationIntervalDays: 90,  decayStartDays: 60,  requiresReconfirmationBeforeUse: false, autoExpire: true,  sensitiveReconfirmation: false },
  { memoryClass: "contextual",           defaultTTLDays: 7,   maxTTLDays: 30,  reconfirmationIntervalDays: 7,   decayStartDays: 3,   requiresReconfirmationBeforeUse: false, autoExpire: true,  sensitiveReconfirmation: false },
  { memoryClass: "sensitive",            defaultTTLDays: 90,  maxTTLDays: 180, reconfirmationIntervalDays: 30,  decayStartDays: 14,  requiresReconfirmationBeforeUse: true,  autoExpire: true,  sensitiveReconfirmation: true },
  { memoryClass: "system-derived",       defaultTTLDays: 30,  maxTTLDays: 90,  reconfirmationIntervalDays: 14,  decayStartDays: 7,   requiresReconfirmationBeforeUse: false, autoExpire: true,  sensitiveReconfirmation: false },
];

export function getTTLPolicy(memoryClass: MemoryClass): MemoryTTLPolicy {
  return MEMORY_TTL_POLICIES.find(p => p.memoryClass === memoryClass)!;
}

// ── Memory Reliability Scoring ────────────────────────────

export interface MemoryReliabilityScore {
  overall: number; // 0-1
  ageFactor: number;
  sourceFactor: number;
  reconfirmationFactor: number;
  conflictPenalty: number;
  usageFactor: number;
  reliability: MemoryReliability;
}

export function scoreMemoryReliability(memory: AdvisorMemoryRecord): MemoryReliabilityScore {
  const now = Date.now();
  const policy = getTTLPolicy(memory.memoryClass);
  const ageMs = now - new Date(memory.createdAt).getTime();
  const ageDays = ageMs / 86400000;

  // Age factor: decays after decayStartDays, reaches 0 at TTL
  const ageFactor = ageDays < policy.decayStartDays
    ? 1.0
    : Math.max(0, 1 - (ageDays - policy.decayStartDays) / (policy.defaultTTLDays - policy.decayStartDays));

  // Source factor: user-confirmed > correction > observation > inference > system
  const sourceWeights: Record<string, number> = {
    "user-input": 1.0, "correction": 0.95, "observation": 0.7, "system-inference": 0.5, "import": 0.4,
  };
  const sourceFactor = sourceWeights[memory.sourceType] || 0.5;

  // Reconfirmation factor
  let reconfirmationFactor = 1.0;
  if (memory.reconfirmationDueAt) {
    const dueMs = new Date(memory.reconfirmationDueAt).getTime();
    if (now > dueMs) {
      const overdueMs = now - dueMs;
      const overdueDays = overdueMs / 86400000;
      reconfirmationFactor = Math.max(0.2, 1 - overdueDays / 30);
    }
  }

  // Conflict penalty
  const conflictPenalty = memory.conflictsWith && memory.conflictsWith.length > 0
    ? Math.max(0.3, 1 - memory.conflictsWith.length * 0.2)
    : 1.0;

  // Usage factor: memories that are used and not corrected are more reliable
  const usageFactor = memory.usedInRecommendations > 0
    ? Math.min(1.0, 0.6 + memory.usedInRecommendations * 0.05)
    : 0.5;

  const overall = Math.round(
    (ageFactor * 0.30 + sourceFactor * 0.25 + reconfirmationFactor * 0.20 + conflictPenalty * 0.15 + usageFactor * 0.10)
    * 100
  ) / 100;

  const reliability: MemoryReliability =
    memory.lifecycleState === "quarantined" ? "poisoned" :
    memory.lifecycleState === "expired" ? "expired" :
    overall >= 0.85 ? "confirmed" :
    overall >= 0.7 ? "high" :
    overall >= 0.5 ? "moderate" :
    overall >= 0.3 ? "low" : "degraded";

  return { overall, ageFactor, sourceFactor, reconfirmationFactor, conflictPenalty, usageFactor, reliability };
}

// ── Lifecycle Transitions ─────────────────────────────────

export type MemoryAction =
  | "access"
  | "reconfirm"
  | "conflict-detected"
  | "conflict-resolved"
  | "expire"
  | "quarantine"
  | "delete"
  | "renew"
  | "decay-check";

export interface MemoryTransition {
  memoryId: string;
  fromState: MemoryLifecycleState;
  toState: MemoryLifecycleState;
  action: MemoryAction;
  reason: string;
  triggeredBy: string;
  timestamp: string;
}

export function evaluateMemoryTransition(memory: AdvisorMemoryRecord): MemoryTransition | null {
  const now = Date.now();
  const policy = getTTLPolicy(memory.memoryClass);
  const ageMs = now - new Date(memory.createdAt).getTime();
  const ageDays = ageMs / 86400000;

  // Check expiration
  if (memory.expiresAt && now > new Date(memory.expiresAt).getTime()) {
    return {
      memoryId: memory.id,
      fromState: memory.lifecycleState,
      toState: "expired",
      action: "expire",
      reason: `TTL expired (${Math.round(ageDays)}d old, policy: ${policy.defaultTTLDays}d)`,
      triggeredBy: "memory-lifecycle-engine",
      timestamp: new Date().toISOString(),
    };
  }

  // Check reconfirmation needed
  if (memory.reconfirmationDueAt && now > new Date(memory.reconfirmationDueAt).getTime() && memory.lifecycleState === "active") {
    return {
      memoryId: memory.id,
      fromState: "active",
      toState: "pending-reconfirmation",
      action: "decay-check",
      reason: `Reconfirmation overdue (due: ${memory.reconfirmationDueAt})`,
      triggeredBy: "memory-lifecycle-engine",
      timestamp: new Date().toISOString(),
    };
  }

  // Check aging
  if (ageDays > policy.decayStartDays && memory.lifecycleState === "active") {
    return {
      memoryId: memory.id,
      fromState: "active",
      toState: "aging",
      action: "decay-check",
      reason: `Memory aging (${Math.round(ageDays)}d old, decay starts at ${policy.decayStartDays}d)`,
      triggeredBy: "memory-lifecycle-engine",
      timestamp: new Date().toISOString(),
    };
  }

  // Check stale
  if (ageDays > policy.defaultTTLDays * 0.8 && memory.lifecycleState === "aging") {
    return {
      memoryId: memory.id,
      fromState: "aging",
      toState: "stale",
      action: "decay-check",
      reason: `Memory stale (${Math.round(ageDays)}d old, approaching TTL ${policy.defaultTTLDays}d)`,
      triggeredBy: "memory-lifecycle-engine",
      timestamp: new Date().toISOString(),
    };
  }

  return null;
}

// ── Memory vs Live Data Conflict Resolution ───────────────

export type ConflictResolution = "live-data-wins" | "memory-wins" | "escalate-to-user" | "quarantine-memory" | "flag-both";

export interface MemoryConflict {
  memoryId: string;
  memoryValue: string;
  liveDataValue: string;
  liveDataSource: string;
  liveDataFreshness: string;
  memoryReliability: MemoryReliability;
  resolution: ConflictResolution;
  reason: string;
}

export function resolveMemoryConflict(
  memory: AdvisorMemoryRecord,
  liveValue: string,
  liveSource: string,
  liveFreshness: string,
): MemoryConflict {
  const reliability = scoreMemoryReliability(memory);

  let resolution: ConflictResolution;
  let reason: string;

  // Rule 1: Live data always wins for deterministic fields
  if (memory.memoryClass === "entity-fact" || memory.memoryClass === "system-derived") {
    resolution = "live-data-wins";
    reason = "Live data overrides stored entity facts and system-derived values";
  }
  // Rule 2: Degraded/expired memories always lose
  else if (reliability.reliability === "degraded" || reliability.reliability === "expired") {
    resolution = "live-data-wins";
    reason = `Memory reliability is ${reliability.reliability} — live data takes precedence`;
  }
  // Rule 3: User-confirmed memories with high reliability escalate
  else if (memory.memoryClass === "user-confirmed" && reliability.overall > 0.7) {
    resolution = "escalate-to-user";
    reason = "User-confirmed memory conflicts with live data — user should decide";
  }
  // Rule 4: Correction memories might indicate the live data is wrong again
  else if (memory.memoryClass === "correction" && reliability.overall > 0.5) {
    resolution = "flag-both";
    reason = "Previous correction exists — both values should be shown with context";
  }
  // Rule 5: Sensitive memories get quarantined on conflict
  else if (memory.memoryClass === "sensitive") {
    resolution = "quarantine-memory";
    reason = "Sensitive memory conflicts with live data — quarantined for review";
  }
  // Default: live data wins
  else {
    resolution = "live-data-wins";
    reason = "Default: live data takes precedence over stored memory";
  }

  return {
    memoryId: memory.id,
    memoryValue: memory.value,
    liveDataValue: liveValue,
    liveDataSource: liveSource,
    liveDataFreshness: liveFreshness,
    memoryReliability: reliability.reliability,
    resolution,
    reason,
  };
}

// ── Memory Poisoning Detection ────────────────────────────

export interface PoisoningSignal {
  memoryId: string;
  signalType: "rapid-mutation" | "contradicts-multiple" | "unusual-source" | "bulk-injection" | "overrides-confirmed";
  severity: "low" | "medium" | "high";
  description: string;
}

export function detectPoisoningSignals(
  memory: AdvisorMemoryRecord,
  recentMutations: { memoryId: string; mutatedAt: string }[],
  allMemories: AdvisorMemoryRecord[],
): PoisoningSignal[] {
  const signals: PoisoningSignal[] = [];

  // Signal 1: Rapid mutation — same memory changed multiple times recently
  const recentForThis = recentMutations.filter(m => m.memoryId === memory.id);
  if (recentForThis.length > 3) {
    signals.push({
      memoryId: memory.id,
      signalType: "rapid-mutation",
      severity: "high",
      description: `Memory mutated ${recentForThis.length} times recently`,
    });
  }

  // Signal 2: Contradicts multiple existing memories
  if (memory.conflictsWith && memory.conflictsWith.length >= 3) {
    signals.push({
      memoryId: memory.id,
      signalType: "contradicts-multiple",
      severity: "medium",
      description: `Conflicts with ${memory.conflictsWith.length} other memories`,
    });
  }

  // Signal 3: Overrides a user-confirmed memory from a non-user source
  if (memory.overrides) {
    const overridden = allMemories.find(m => m.id === memory.overrides);
    if (overridden?.memoryClass === "user-confirmed" && memory.sourceType !== "user-input") {
      signals.push({
        memoryId: memory.id,
        signalType: "overrides-confirmed",
        severity: "high",
        description: "Non-user source attempting to override user-confirmed memory",
      });
    }
  }

  return signals;
}
