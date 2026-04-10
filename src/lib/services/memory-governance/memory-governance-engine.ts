// ═══════════════════════════════════════════════════════════════
// SITA OS — Memory Governance Engine
// Confidence, freshness, correction, forgetting, contradiction
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
import type { MemoryType, MemoryPrivacy, MemorySource, MemoryContradiction, MemoryCorrection, MemoryForgetRequest, MemoryPersistenceRule, MemoryGovernanceConfig } from "@/packages/contracts/domain-types/memory-governance";

// ── Types ────────────────────────────────────────────────────────

export interface GovernedMemory {
  id: string;
  key: string;
  value: unknown;
  type: MemoryType;
  privacy: MemoryPrivacy;
  source: MemorySource;
  domain: string;
  confidence: number;          // 0–1
  freshness: number;           // 0–1 (decays over time)
  verified: boolean;
  userReviewed: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  accessCount: number;
  lastAccessedAt?: string;
  supersedes?: string;
  contradicts?: string[];
  tags: string[];
}

export interface MemoryDecayPolicy {
  type: MemoryType;
  halfLifeDays: number;        // time for freshness to decay to 50%
  minFreshness: number;        // below this, auto-archive
  requiresReviewBelow: number; // below this confidence, flag for review
}

export interface MemoryAuditRecord {
  id: string;
  memoryId: string;
  action: "created" | "accessed" | "updated" | "corrected" | "forgotten" | "archived" | "contradiction_detected" | "verified";
  actor: string;
  timestamp: string;
  details: Record<string, unknown>;
}

// ── Default Policies ─────────────────────────────────────────────

const DEFAULT_DECAY_POLICIES: MemoryDecayPolicy[] = [
  { type: "ephemeral", halfLifeDays: 1, minFreshness: 0.1, requiresReviewBelow: 0.3 },
  { type: "working", halfLifeDays: 7, minFreshness: 0.2, requiresReviewBelow: 0.4 },
  { type: "temporary", halfLifeDays: 14, minFreshness: 0.15, requiresReviewBelow: 0.35 },
  { type: "durable", halfLifeDays: 365, minFreshness: 0.05, requiresReviewBelow: 0.3 },
  { type: "preference", halfLifeDays: 180, minFreshness: 0.1, requiresReviewBelow: 0.5 },
  { type: "operating_pattern", halfLifeDays: 90, minFreshness: 0.1, requiresReviewBelow: 0.4 },
  { type: "trust_behavior", halfLifeDays: 60, minFreshness: 0.15, requiresReviewBelow: 0.5 },
];

// ── Service ──────────────────────────────────────────────────────

export class MemoryGovernanceEngine {
  private memories: Map<string, GovernedMemory> = new Map();
  private contradictions: MemoryContradiction[] = [];
  private corrections: MemoryCorrection[] = [];
  private forgetRequests: MemoryForgetRequest[] = [];
  private auditLog: MemoryAuditRecord[] = [];
  private decayPolicies: MemoryDecayPolicy[] = [...DEFAULT_DECAY_POLICIES];
  private counter = 0;

  // ── Memory CRUD ────────────────────────────────────────────

  store(key: string, value: unknown, type: MemoryType, privacy: MemoryPrivacy, source: MemorySource, domain: string, confidence: number, tags: string[] = []): GovernedMemory {
    const id = `mem-${++this.counter}-${Date.now()}`;

    // Check for contradictions
    const existing = [...this.memories.values()].find(m => m.key === key && m.domain === domain);
    if (existing && JSON.stringify(existing.value) !== JSON.stringify(value)) {
      this.detectContradiction(existing, { id, key, value, confidence } as GovernedMemory);
    }

    const memory: GovernedMemory = {
      id, key, value, type, privacy, source, domain,
      confidence: Math.min(1, Math.max(0, confidence)),
      freshness: 1.0, verified: false, userReviewed: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      accessCount: 0, tags,
      supersedes: existing?.id,
    };

    if (existing) {
      existing.updatedAt = new Date().toISOString();
      memory.supersedes = existing.id;
    }

    this.memories.set(id, memory);
    this.audit(id, "created", source, { key, type, confidence });
    this._persist();
    return memory;
  }

  access(memoryId: string): GovernedMemory | null {
    const m = this.memories.get(memoryId);
    if (!m) return null;
    m.accessCount++;
    m.lastAccessedAt = new Date().toISOString();
    this.audit(memoryId, "accessed", "system", {});
    return m;
  }

  // ── Correction ─────────────────────────────────────────────

  correct(memoryId: string, newValue: unknown, correctedBy: string, reason: string): MemoryCorrection | null {
    const memory = this.memories.get(memoryId);
    if (!memory) return null;

    const correction: MemoryCorrection = {
      id: `corr-${++this.counter}`, memoryId,
      previousValue: memory.value, correctedValue: newValue,
      correctedBy, reason, timestamp: new Date().toISOString(),
      propagated: false, affectedWorkflows: [],
    };

    memory.value = newValue;
    memory.updatedAt = new Date().toISOString();
    memory.confidence = Math.min(1, memory.confidence + 0.1); // corrections boost confidence
    memory.userReviewed = true;

    this.corrections.push(correction);
    this.audit(memoryId, "corrected", correctedBy, { reason, previousValue: correction.previousValue });
    this._persist();
    return correction;
  }

  // ── Forgetting ─────────────────────────────────────────────

  requestForget(memoryIds: string[], requestedBy: string, reason: string): MemoryForgetRequest {
    const request: MemoryForgetRequest = {
      id: `forget-${++this.counter}`, memoryIds, requestedBy, reason,
      timestamp: new Date().toISOString(), status: "pending",
      affectedAdvisors: [], cascadeEffects: [],
    };

    // Immediately forget
    let forgotCount = 0;
    for (const id of memoryIds) {
      const m = this.memories.get(id);
      if (m) {
        this.audit(id, "forgotten", requestedBy, { reason });
        this.memories.delete(id);
        forgotCount++;
      }
    }

    request.status = forgotCount === memoryIds.length ? "completed" : forgotCount > 0 ? "partial" : "denied";
    this.forgetRequests.push(request);
    this._persist();
    return request;
  }

  // ── Contradiction Detection ────────────────────────────────

  private detectContradiction(existing: GovernedMemory, incoming: GovernedMemory): void {
    const contradiction: MemoryContradiction = {
      id: `contra-${++this.counter}`, memoryA: existing.id, memoryB: incoming.id,
      field: incoming.key, valueA: existing.value, valueB: incoming.value,
      detectedAt: new Date().toISOString(), confidence: Math.max(existing.confidence, incoming.confidence),
    };
    this.contradictions.push(contradiction);
    this.audit(existing.id, "contradiction_detected", "system", { newMemoryId: incoming.id });
  }

  resolveContradiction(contradictionId: string, resolution: MemoryContradiction["resolution"], resolvedBy: string): boolean {
    const c = this.contradictions.find(x => x.id === contradictionId);
    if (!c) return false;
    c.resolution = resolution;
    c.resolvedBy = resolvedBy;
    c.resolvedAt = new Date().toISOString();

    // Apply resolution
    if (resolution === "keep_a") this.memories.delete(c.memoryB);
    else if (resolution === "keep_b") this.memories.delete(c.memoryA);

    this._persist();
    return true;
  }

  getUnresolvedContradictions(): MemoryContradiction[] {
    return this.contradictions.filter(c => !c.resolvedAt);
  }

  // ── Decay & Freshness ──────────────────────────────────────

  applyDecay(): { decayed: number; archived: number; flagged: number } {
    let decayed = 0, archived = 0, flagged = 0;
    const now = Date.now();

    for (const memory of this.memories.values()) {
      const policy = this.decayPolicies.find(p => p.type === memory.type);
      if (!policy) continue;

      const ageMs = now - new Date(memory.updatedAt).getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);
      const decayFactor = Math.pow(0.5, ageDays / policy.halfLifeDays);
      const newFreshness = Math.max(0, decayFactor);

      if (newFreshness < memory.freshness) {
        memory.freshness = Math.round(newFreshness * 100) / 100;
        decayed++;
      }

      if (memory.freshness < policy.minFreshness) {
        this.audit(memory.id, "archived", "system", { reason: "Below freshness threshold" });
        this.memories.delete(memory.id);
        archived++;
      } else if (memory.confidence < policy.requiresReviewBelow && !memory.userReviewed) {
        flagged++;
      }
    }
    this._persist();
    return { decayed, archived, flagged };
  }

  // ── Verification ───────────────────────────────────────────

  verify(memoryId: string, verifiedBy: string): boolean {
    const m = this.memories.get(memoryId);
    if (!m) return false;
    m.verified = true;
    m.userReviewed = true;
    m.confidence = Math.min(1, m.confidence + 0.15);
    this.audit(memoryId, "verified", verifiedBy, {});
    this._persist();
    return true;
  }

  // ── Queries ────────────────────────────────────────────────

  getMemory(id: string): GovernedMemory | undefined { return this.memories.get(id); }
  getByKey(key: string, domain?: string): GovernedMemory[] {
    return [...this.memories.values()].filter(m => m.key === key && (!domain || m.domain === domain));
  }
  getStale(freshnessThreshold = 0.3): GovernedMemory[] { return [...this.memories.values()].filter(m => m.freshness < freshnessThreshold); }
  getNeedsReview(): GovernedMemory[] { return [...this.memories.values()].filter(m => !m.userReviewed && m.confidence < 0.5); }
  getByDomain(domain: string): GovernedMemory[] { return [...this.memories.values()].filter(m => m.domain === domain); }
  getCorrections(memoryId?: string): MemoryCorrection[] { return memoryId ? this.corrections.filter(c => c.memoryId === memoryId) : [...this.corrections]; }
  getAuditLog(memoryId?: string, limit = 50): MemoryAuditRecord[] { return (memoryId ? this.auditLog.filter(a => a.memoryId === memoryId) : this.auditLog).slice(-limit); }

  getStats(): { totalMemories: number; byType: Record<string, number>; avgConfidence: number; avgFreshness: number; contradictions: number; corrections: number; forgetRequests: number } {
    const all = [...this.memories.values()];
    const byType: Record<string, number> = {};
    let confSum = 0, freshSum = 0;
    for (const m of all) { byType[m.type] = (byType[m.type] ?? 0) + 1; confSum += m.confidence; freshSum += m.freshness; }
    return {
      totalMemories: all.length, byType,
      avgConfidence: all.length > 0 ? Math.round((confSum / all.length) * 100) / 100 : 0,
      avgFreshness: all.length > 0 ? Math.round((freshSum / all.length) * 100) / 100 : 0,
      contradictions: this.contradictions.filter(c => !c.resolvedAt).length,
      corrections: this.corrections.length, forgetRequests: this.forgetRequests.length,
    };
  }

  // ── Audit ──────────────────────────────────────────────────

  private audit(memoryId: string, action: MemoryAuditRecord["action"], actor: string, details: Record<string, unknown>): void {
    this.auditLog.push({ id: `audit-${++this.counter}`, memoryId, action, actor, timestamp: new Date().toISOString(), details });
    if (this.auditLog.length > 1000) this.auditLog.shift();
  }

  // ── Persistence ────────────────────────────────────────────

  private _persist = () => debouncedSaveServiceState("memory-governance", this.serialize());
  serialize(): Record<string, unknown> { return { memories: Array.from(this.memories.entries()), contradictions: this.contradictions, corrections: this.corrections.slice(-100), forgetRequests: this.forgetRequests.slice(-50), auditLog: this.auditLog.slice(-200), counter: this.counter }; }
  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.memories) this.memories = new Map(state.memories as [string, GovernedMemory][]);
    if (state.contradictions) this.contradictions = state.contradictions as MemoryContradiction[];
    if (state.corrections) this.corrections = state.corrections as MemoryCorrection[];
    if (state.forgetRequests) this.forgetRequests = state.forgetRequests as MemoryForgetRequest[];
    if (state.auditLog) this.auditLog = state.auditLog as MemoryAuditRecord[];
    if (state.counter) this.counter = state.counter as number;
  }
  async loadPersistedState(): Promise<void> { const s = await loadServiceState("memory-governance"); if (s) this.hydrate(s as Record<string, unknown>); }
}

export const createMemoryGovernance = () => new MemoryGovernanceEngine();
