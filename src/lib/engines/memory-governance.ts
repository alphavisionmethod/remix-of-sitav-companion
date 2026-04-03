// ═══════════════════════════════════════════════════════════════
// SITA OS — Memory Governance Engine
// Confidence, contradiction, lineage, privacy, forget/correct
// ═══════════════════════════════════════════════════════════════

import type {
  MemoryEntry, MemoryContradiction, MemoryCorrection,
  MemoryForgetRequest, MemoryPersistenceRule, MemoryGovernanceConfig,
  MemoryConflictResolution, MemoryType, MemoryPrivacy, MemorySource,
  MemoryAuditEntry,
} from "../types/memory-governance.types";

const DEFAULT_CONFIG: MemoryGovernanceConfig = {
  globalRules: [
    { id: "default", domain: "*", memoryType: "durable", autoExpireAfterDays: 365, requiresUserReview: false, maxConfidenceWithoutReview: 0.7, allowAdvisorWrite: true, allowAdvisorRead: true, privacyDefault: "private", retentionPolicy: "ttl" },
    { id: "temporary", domain: "*", memoryType: "temporary", autoExpireAfterDays: 1, requiresUserReview: false, maxConfidenceWithoutReview: 1, allowAdvisorWrite: true, allowAdvisorRead: true, privacyDefault: "private", retentionPolicy: "session" },
    { id: "shared", domain: "*", memoryType: "shared", autoExpireAfterDays: undefined, requiresUserReview: true, maxConfidenceWithoutReview: 0.5, allowAdvisorWrite: true, allowAdvisorRead: true, privacyDefault: "household", retentionPolicy: "permanent" },
  ],
  domainOverrides: {},
  advisorScopes: {
    "money-advisor": { canRead: ["finance", "billing"], canWrite: ["finance"], canDelete: false },
    "business-advisor": { canRead: ["business", "crm"], canWrite: ["business"], canDelete: false },
    "concierge-advisor": { canRead: ["concierge", "calendar"], canWrite: ["concierge"], canDelete: false },
  },
  householdSharing: { enabled: true, requiresConsent: true, excludedTypes: ["private"] },
  auditEnabled: true,
  contradictionDetectionEnabled: true,
  autoExpirationEnabled: true,
};

export class MemoryGovernanceEngine {
  private memories: Map<string, MemoryEntry> = new Map();
  private contradictions: MemoryContradiction[] = [];
  private corrections: MemoryCorrection[] = [];
  private forgetRequests: MemoryForgetRequest[] = [];
  private config: MemoryGovernanceConfig;

  constructor(config: Partial<MemoryGovernanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ── Write Memory ────────────────────────────────────────────
  write(entry: Omit<MemoryEntry, "id" | "createdAt" | "updatedAt" | "accessCount" | "verified" | "userReviewed">): MemoryEntry {
    const rule = this.getRule(entry.domain, entry.type);

    // Check advisor write permission
    if (entry.lineage.sourceType === "advisor_inference") {
      const advisorScope = this.config.advisorScopes[entry.source];
      if (advisorScope && !advisorScope.canWrite.includes(entry.domain) && !advisorScope.canWrite.includes("*")) {
        throw new Error(`Advisor ${entry.source} cannot write to domain ${entry.domain}`);
      }
    }

    // Cap confidence for unreviewed memories
    const confidence = rule?.requiresUserReview
      ? Math.min(entry.confidence, rule.maxConfidenceWithoutReview)
      : entry.confidence;

    const id = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const memory: MemoryEntry = {
      ...entry,
      id,
      confidence,
      createdAt: now,
      updatedAt: now,
      accessCount: 0,
      verified: false,
      userReviewed: false,
      expiresAt: rule?.autoExpireAfterDays
        ? new Date(Date.now() + rule.autoExpireAfterDays * 86400000).toISOString()
        : entry.expiresAt,
    };

    // Contradiction detection
    if (this.config.contradictionDetectionEnabled) {
      this.detectContradictions(memory);
    }

    this.memories.set(id, memory);
    return memory;
  }

  // ── Read Memory ─────────────────────────────────────────────
  read(id: string, readerId?: string): MemoryEntry | undefined {
    const mem = this.memories.get(id);
    if (!mem) return undefined;

    // Check expiration
    if (mem.expiresAt && new Date(mem.expiresAt) < new Date()) {
      this.memories.delete(id);
      return undefined;
    }

    mem.accessCount++;
    mem.lastAccessedAt = new Date().toISOString();
    return { ...mem };
  }

  // ── Query Memory ────────────────────────────────────────────
  query(filters: { domain?: string; type?: MemoryType; privacy?: MemoryPrivacy; tags?: string[]; minConfidence?: number }): MemoryEntry[] {
    const now = new Date();
    return Array.from(this.memories.values()).filter(m => {
      if (m.expiresAt && new Date(m.expiresAt) < now) return false;
      if (filters.domain && m.domain !== filters.domain) return false;
      if (filters.type && m.type !== filters.type) return false;
      if (filters.privacy && m.privacy !== filters.privacy) return false;
      if (filters.minConfidence && m.confidence < filters.minConfidence) return false;
      if (filters.tags && !filters.tags.some(t => m.tags.includes(t))) return false;
      return true;
    });
  }

  // ── Correct Memory ──────────────────────────────────────────
  correct(memoryId: string, correctedValue: unknown, correctedBy: string, reason: string): MemoryCorrection {
    const mem = this.memories.get(memoryId);
    if (!mem) throw new Error(`Memory ${memoryId} not found`);

    const correction: MemoryCorrection = {
      id: `cor_${Date.now()}`,
      memoryId,
      previousValue: mem.value,
      correctedValue,
      correctedBy,
      reason,
      timestamp: new Date().toISOString(),
      propagated: false,
      affectedWorkflows: [],
    };

    mem.value = correctedValue;
    mem.updatedAt = correction.timestamp;
    mem.userReviewed = true;
    mem.verified = true;
    mem.confidence = 1;

    this.corrections.push(correction);
    return correction;
  }

  // ── Forget Memory ───────────────────────────────────────────
  forget(memoryIds: string[], requestedBy: string, reason: string): MemoryForgetRequest {
    const request: MemoryForgetRequest = {
      id: `forget_${Date.now()}`,
      memoryIds,
      requestedBy,
      reason,
      timestamp: new Date().toISOString(),
      status: "pending",
      affectedAdvisors: [],
      cascadeEffects: [],
    };

    // Find affected advisors
    const affectedAdvisors = new Set<string>();
    for (const id of memoryIds) {
      const mem = this.memories.get(id);
      if (mem) affectedAdvisors.add(mem.source);
    }
    request.affectedAdvisors = Array.from(affectedAdvisors);

    // Execute forget
    let deleted = 0;
    for (const id of memoryIds) {
      if (this.memories.delete(id)) deleted++;
    }

    request.status = deleted === memoryIds.length ? "completed" : deleted > 0 ? "partial" : "denied";
    this.forgetRequests.push(request);
    return request;
  }

  // ── Contradiction Detection ─────────────────────────────────
  private detectContradictions(newMemory: MemoryEntry): void {
    for (const existing of this.memories.values()) {
      if (existing.domain !== newMemory.domain || existing.key !== newMemory.key) continue;
      if (JSON.stringify(existing.value) === JSON.stringify(newMemory.value)) continue;

      const contradiction: MemoryContradiction = {
        id: `contradiction_${Date.now()}`,
        memoryA: existing.id,
        memoryB: newMemory.id,
        field: newMemory.key,
        valueA: existing.value,
        valueB: newMemory.value,
        detectedAt: new Date().toISOString(),
        resolution: "unresolved",
        confidence: Math.min(existing.confidence, newMemory.confidence),
      };

      newMemory.contradicts = [...(newMemory.contradicts || []), existing.id];
      this.contradictions.push(contradiction);
    }
  }

  // ── Resolve Conflict ────────────────────────────────────────
  resolveConflict(contradictionId: string, resolution: MemoryConflictResolution): void {
    const c = this.contradictions.find(c => c.id === contradictionId);
    if (!c) throw new Error(`Contradiction ${contradictionId} not found`);

    c.resolution = resolution.strategy === "latest_wins" ? "keep_b"
      : resolution.strategy === "highest_confidence" ? "keep_a"
      : "user_decided";
    c.resolvedAt = resolution.timestamp;
    c.resolvedBy = resolution.resolvedBy;
  }

  // ── Expiration Sweep ────────────────────────────────────────
  sweepExpired(): number {
    if (!this.config.autoExpirationEnabled) return 0;
    const now = new Date();
    let removed = 0;
    for (const [id, mem] of this.memories) {
      if (mem.expiresAt && new Date(mem.expiresAt) < now) {
        this.memories.delete(id);
        removed++;
      }
    }
    return removed;
  }

  // ── Stats ───────────────────────────────────────────────────
  getStats() {
    return {
      totalMemories: this.memories.size,
      unresolvedContradictions: this.contradictions.filter(c => c.resolution === "unresolved").length,
      pendingReviews: Array.from(this.memories.values()).filter(m => !m.userReviewed && m.confidence < 0.7).length,
      corrections: this.corrections.length,
      forgetRequests: this.forgetRequests.length,
    };
  }

  private getRule(domain: string, type: MemoryType): MemoryPersistenceRule | undefined {
    const override = this.config.domainOverrides[domain];
    const global = this.config.globalRules.find(r => r.memoryType === type || r.domain === "*");
    return override ? { ...global!, ...override } as MemoryPersistenceRule : global;
  }
}
