// ═══════════════════════════════════════════════════════════════
// SITA OS — Memory Service
// Privacy-tiered context storage with sensitive key detection,
// confidence decay, supersession, role-aware visibility, and
// forget paths with audit trail
// ═══════════════════════════════════════════════════════════════

export type PrivacyTier = "public" | "internal" | "confidential" | "restricted";

export interface MemoryEntry {
  id: string;
  key: string;
  value: unknown;
  privacyTier: PrivacyTier;
  confidence: number;         // 0-1, decays over time
  source: string;             // attribution
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
  supersededBy?: string;      // ID of the entry that replaced this
  tags: string[];
  entityId?: string;          // linked entity
  entityType?: string;
  accessLog: { role: string; timestamp: number }[];
}

export interface MemoryForgetRecord {
  id: string;
  entryId: string;
  key: string;
  reason: string;
  requestedBy: string;
  timestamp: number;
  previousTier: PrivacyTier;
}

export interface MemoryQuery {
  key?: string;
  tags?: string[];
  entityId?: string;
  minConfidence?: number;
  privacyTier?: PrivacyTier;
  includeSuperseded?: boolean;
}

// Sensitive keys that auto-classify as restricted
const SENSITIVE_PATTERNS = [
  /ssn/i, /social.?security/i, /tax.?id/i, /ein/i, /tin/i,
  /bank.?account/i, /routing.?number/i, /credit.?card/i, /cvv/i,
  /medical/i, /diagnosis/i, /prescription/i, /health.?record/i,
  /password/i, /secret/i, /private.?key/i, /api.?key/i,
  /passport/i, /driver.?license/i, /birth.?date/i, /dob/i,
];

const CONFIDENTIAL_PATTERNS = [
  /salary/i, /income/i, /net.?worth/i, /debt/i, /loan/i,
  /insurance/i, /beneficiary/i, /will/i, /trust.?document/i,
  /address/i, /phone/i, /email/i,
];

// Privacy tier visibility by role
const TIER_VISIBILITY: Record<string, PrivacyTier[]> = {
  admin: ["public", "internal", "confidential", "restricted"],
  owner: ["public", "internal", "confidential", "restricted"],
  advisor: ["public", "internal", "confidential"],
  member: ["public", "internal"],
  viewer: ["public"],
};

// Confidence decay: 2% per day
const DECAY_RATE_PER_DAY = 0.02;
const MIN_CONFIDENCE = 0.1;

export class MemoryService {
  private entries: Map<string, MemoryEntry> = new Map();
  private forgetLog: MemoryForgetRecord[] = [];

  /** Store a memory entry with automatic privacy classification */
  store(
    key: string,
    value: unknown,
    options?: {
      source?: string;
      privacyTier?: PrivacyTier;
      confidence?: number;
      tags?: string[];
      entityId?: string;
      entityType?: string;
      expiresAt?: number;
    }
  ): MemoryEntry {
    // Auto-detect privacy tier if not specified
    const detectedTier = options?.privacyTier ?? this.detectPrivacyTier(key);

    // Check for supersession
    const existing = this.findByKey(key, options?.entityId);
    if (existing && !existing.supersededBy) {
      existing.supersededBy = crypto.randomUUID(); // will be set to new entry's ID
    }

    const entry: MemoryEntry = {
      id: existing?.supersededBy ?? crypto.randomUUID(),
      key,
      value,
      privacyTier: detectedTier,
      confidence: options?.confidence ?? 1.0,
      source: options?.source ?? "user",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      expiresAt: options?.expiresAt,
      tags: options?.tags ?? [],
      entityId: options?.entityId,
      entityType: options?.entityType,
      accessLog: [],
    };

    this.entries.set(entry.id, entry);
    return entry;
  }

  /** Retrieve a memory entry with confidence decay and access logging */
  retrieve(id: string, role: string = "viewer"): MemoryEntry | null {
    const entry = this.entries.get(id);
    if (!entry) return null;

    // Check visibility
    const allowedTiers = TIER_VISIBILITY[role] ?? TIER_VISIBILITY.viewer;
    if (!allowedTiers.includes(entry.privacyTier)) return null;

    // Check expiry
    if (entry.expiresAt && Date.now() > entry.expiresAt) return null;

    // Apply confidence decay
    const daysSinceUpdate = (Date.now() - entry.updatedAt) / 86400000;
    const decayedConfidence = Math.max(MIN_CONFIDENCE, entry.confidence * Math.pow(1 - DECAY_RATE_PER_DAY, daysSinceUpdate));

    // Log access
    entry.accessLog.push({ role, timestamp: Date.now() });

    return { ...entry, confidence: decayedConfidence };
  }

  /** Query memories with filters */
  query(query: MemoryQuery, role: string = "viewer"): MemoryEntry[] {
    const allowedTiers = TIER_VISIBILITY[role] ?? TIER_VISIBILITY.viewer;
    const now = Date.now();

    return Array.from(this.entries.values()).filter(entry => {
      if (!allowedTiers.includes(entry.privacyTier)) return false;
      if (entry.expiresAt && now > entry.expiresAt) return false;
      if (!query.includeSuperseded && entry.supersededBy) return false;
      if (query.privacyTier && entry.privacyTier !== query.privacyTier) return false;
      if (query.key && entry.key !== query.key) return false;
      if (query.entityId && entry.entityId !== query.entityId) return false;
      if (query.tags && !query.tags.some(t => entry.tags.includes(t))) return false;

      // Apply confidence decay for minConfidence check
      if (query.minConfidence) {
        const daysSinceUpdate = (now - entry.updatedAt) / 86400000;
        const decayed = Math.max(MIN_CONFIDENCE, entry.confidence * Math.pow(1 - DECAY_RATE_PER_DAY, daysSinceUpdate));
        if (decayed < query.minConfidence) return false;
      }

      return true;
    });
  }

  /** Forget a memory entry — removes it and logs the action */
  forget(entryId: string, reason: string, requestedBy: string): boolean {
    const entry = this.entries.get(entryId);
    if (!entry) return false;

    this.forgetLog.push({
      id: crypto.randomUUID(),
      entryId,
      key: entry.key,
      reason,
      requestedBy,
      timestamp: Date.now(),
      previousTier: entry.privacyTier,
    });

    this.entries.delete(entryId);
    return true;
  }

  /** Get forget audit trail */
  getForgetLog(): MemoryForgetRecord[] {
    return [...this.forgetLog];
  }

  /** Get all entries for an entity */
  getEntityMemory(entityId: string, role: string = "viewer"): MemoryEntry[] {
    return this.query({ entityId, includeSuperseded: false }, role);
  }

  /** Get memory statistics */
  getStats(): { total: number; byTier: Record<PrivacyTier, number>; forgotten: number; expired: number } {
    const byTier: Record<PrivacyTier, number> = { public: 0, internal: 0, confidential: 0, restricted: 0 };
    let expired = 0;
    const now = Date.now();

    for (const entry of this.entries.values()) {
      byTier[entry.privacyTier]++;
      if (entry.expiresAt && now > entry.expiresAt) expired++;
    }

    return { total: this.entries.size, byTier, forgotten: this.forgetLog.length, expired };
  }

  // ── Private ───────────────────────────────────────────────────

  private detectPrivacyTier(key: string): PrivacyTier {
    if (SENSITIVE_PATTERNS.some(p => p.test(key))) return "restricted";
    if (CONFIDENTIAL_PATTERNS.some(p => p.test(key))) return "confidential";
    return "internal";
  }

  private findByKey(key: string, entityId?: string): MemoryEntry | undefined {
    for (const entry of this.entries.values()) {
      if (entry.key === key && entry.entityId === entityId && !entry.supersededBy) {
        return entry;
      }
    }
    return undefined;
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createMemoryService(): MemoryService {
  return new MemoryService();
}
