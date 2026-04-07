// ═══════════════════════════════════════════════════════════════
// SITA OS — Memory Service (Durable)
// Privacy-tiered context storage with durable persistence to
// os_memory_scoped. In-memory map acts as hot cache; Supabase
// is the source of truth.
// ═══════════════════════════════════════════════════════════════

import type { PrivacyTier as CanonicalPrivacyTier } from "@/packages/contracts";
import {
  persistMemoryEntry,
  supersedeMemoryEntry,
  forgetScopedMemory,
  fetchScopedMemory,
  type MemoryScope,
} from "@/lib/persistence/memory-service-persistence";

/** @deprecated Use CanonicalPrivacyTier from contracts */
export type ServicePrivacyTier = CanonicalPrivacyTier;

/** Trust level for memory entries (epistemic transparency) */
export type MemoryTrustLevel = "verified" | "inferred" | "external" | "user-provided" | "unverified";

export interface MemoryEntry {
  id: string;
  key: string;
  value: unknown;
  privacyTier: ServicePrivacyTier;
  confidence: number;
  source: string;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
  supersededBy?: string;
  tags: string[];
  entityId?: string;
  entityType?: string;
  accessLog: { role: string; timestamp: number }[];
  // Trust lens fields
  trustLevel: MemoryTrustLevel;
  ingestedAt: number;
  sourceType: string;
  sanitized: boolean;
  evidenceIds?: string[];
}

export interface MemoryForgetRecord {
  id: string;
  entryId: string;
  key: string;
  reason: string;
  requestedBy: string;
  timestamp: number;
  previousTier: ServicePrivacyTier;
}

export interface MemoryQuery {
  key?: string;
  tags?: string[];
  entityId?: string;
  minConfidence?: number;
  privacyTier?: ServicePrivacyTier;
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
const TIER_VISIBILITY: Record<string, ServicePrivacyTier[]> = {
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
  private persistenceEnabled = true;

  /** Sanitize value to prevent prompt injection via memory */
  private sanitize(value: unknown): { sanitized: unknown; wasSanitized: boolean } {
    if (typeof value === "string") {
      // Strip HTML/script tags and common injection patterns
      const cleaned = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<[^>]*>/g, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "");
      return { sanitized: cleaned, wasSanitized: cleaned !== value };
    }
    if (typeof value === "object" && value !== null) {
      // Recursively sanitize object values
      const result: Record<string, unknown> = {};
      let anySanitized = false;
      for (const [k, v] of Object.entries(value)) {
        const { sanitized, wasSanitized } = this.sanitize(v);
        result[k] = sanitized;
        if (wasSanitized) anySanitized = true;
      }
      return { sanitized: result, wasSanitized: anySanitized };
    }
    return { sanitized: value, wasSanitized: false };
  }

  /** Store a memory entry with automatic privacy classification, trust lens, and durable persistence */
  store(
    key: string,
    value: unknown,
    options?: {
      source?: string;
      privacyTier?: ServicePrivacyTier;
      confidence?: number;
      tags?: string[];
      entityId?: string;
      entityType?: string;
      expiresAt?: number;
      scope?: MemoryScope;
      domain?: string;
      trustLevel?: MemoryTrustLevel;
      sourceType?: string;
      evidenceIds?: string[];
    }
  ): MemoryEntry {
    const detectedTier = options?.privacyTier ?? this.detectPrivacyTier(key);

    // Sanitize value (trust lens: ingestion corridor)
    const { sanitized: sanitizedValue, wasSanitized } = this.sanitize(value);

    // Check for supersession
    const existing = this.findByKey(key, options?.entityId);

    const now = Date.now();
    const entry: MemoryEntry = {
      id: crypto.randomUUID(),
      key,
      value: sanitizedValue,
      privacyTier: detectedTier,
      confidence: options?.confidence ?? 1.0,
      source: options?.source ?? "user",
      createdAt: now,
      updatedAt: now,
      expiresAt: options?.expiresAt,
      tags: options?.tags ?? [],
      entityId: options?.entityId,
      entityType: options?.entityType,
      accessLog: [],
      // Trust lens
      trustLevel: options?.trustLevel ?? this.inferTrustLevel(options?.source),
      ingestedAt: now,
      sourceType: options?.sourceType ?? options?.source ?? "unknown",
      sanitized: wasSanitized,
      evidenceIds: options?.evidenceIds,
    };

    // Mark existing as superseded
    if (existing && !existing.supersededBy) {
      existing.supersededBy = entry.id;

      // Durable supersession
      if (this.persistenceEnabled) {
        supersedeMemoryEntry(existing.id, entry, {
          scope: options?.scope,
          domain: options?.domain,
        }).catch(() => {});
      }
    } else if (this.persistenceEnabled) {
      // Durable persistence (fire-and-forget)
      persistMemoryEntry(entry, {
        scope: options?.scope,
        domain: options?.domain,
      }).catch(() => {});
    }

    this.entries.set(entry.id, entry);
    return entry;
  }

  /** Retrieve a memory entry with confidence decay and access logging */
  retrieve(id: string, role: string = "viewer"): MemoryEntry | null {
    const entry = this.entries.get(id);
    if (!entry) return null;

    const allowedTiers = TIER_VISIBILITY[role] ?? TIER_VISIBILITY.viewer;
    if (!allowedTiers.includes(entry.privacyTier)) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) return null;

    const daysSinceUpdate = (Date.now() - entry.updatedAt) / 86400000;
    const decayedConfidence = Math.max(MIN_CONFIDENCE, entry.confidence * Math.pow(1 - DECAY_RATE_PER_DAY, daysSinceUpdate));

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

      if (query.minConfidence) {
        const daysSinceUpdate = (now - entry.updatedAt) / 86400000;
        const decayed = Math.max(MIN_CONFIDENCE, entry.confidence * Math.pow(1 - DECAY_RATE_PER_DAY, daysSinceUpdate));
        if (decayed < query.minConfidence) return false;
      }

      return true;
    });
  }

  /** Forget a memory entry — removes it and logs the action durably */
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

    // Durable forget (persists audit trail)
    if (this.persistenceEnabled) {
      forgetScopedMemory(entryId, reason, requestedBy).catch(() => {});
    }

    return true;
  }

  /** Hydrate in-memory cache from durable storage */
  async hydrate(opts?: { scope?: MemoryScope; domain?: string; limit?: number }): Promise<number> {
    const persisted = await fetchScopedMemory({
      scope: opts?.scope,
      domain: opts?.domain,
      limit: opts?.limit ?? 500,
    });

    let loaded = 0;
    for (const p of persisted) {
      if (!this.entries.has(p.id)) {
        this.entries.set(p.id, {
          id: p.id,
          key: p.key,
          value: p.value,
          privacyTier: p.privacy_tier as ServicePrivacyTier,
          confidence: Number(p.confidence),
          source: p.source,
          createdAt: new Date(p.created_at).getTime(),
          updatedAt: new Date(p.updated_at).getTime(),
          expiresAt: p.expires_at ? new Date(p.expires_at).getTime() : undefined,
          supersededBy: p.superseded_by ?? undefined,
          tags: p.tags,
          entityId: p.entity_id ?? undefined,
          entityType: p.entity_type ?? undefined,
          accessLog: [],
        });
        loaded++;
      }
    }
    return loaded;
  }

  /** Get forget audit trail */
  getForgetLog(): MemoryForgetRecord[] { return [...this.forgetLog]; }

  /** Get all entries for an entity */
  getEntityMemory(entityId: string, role: string = "viewer"): MemoryEntry[] {
    return this.query({ entityId, includeSuperseded: false }, role);
  }

  /** Get memory statistics */
  getStats(): { total: number; byTier: Record<ServicePrivacyTier, number>; forgotten: number; expired: number } {
    const byTier: Record<ServicePrivacyTier, number> = { public: 0, internal: 0, confidential: 0, restricted: 0 };
    let expired = 0;
    const now = Date.now();
    for (const entry of this.entries.values()) {
      byTier[entry.privacyTier]++;
      if (entry.expiresAt && now > entry.expiresAt) expired++;
    }
    return { total: this.entries.size, byTier, forgotten: this.forgetLog.length, expired };
  }

  /** Enable/disable persistence */
  setPersistence(enabled: boolean): void { this.persistenceEnabled = enabled; }

  // ── Private ───────────────────────────────────────────────────

  private detectPrivacyTier(key: string): ServicePrivacyTier {
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

  /** Infer trust level from source */
  private inferTrustLevel(source?: string): MemoryTrustLevel {
    if (!source) return "unverified";
    if (source === "canonical-chain" || source === "kernel" || source === "system") return "verified";
    if (source === "advisor" || source === "agent") return "inferred";
    if (source === "user" || source === "ui") return "user-provided";
    if (source === "external" || source === "connector") return "external";
    return "unverified";
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createMemoryService(): MemoryService {
  return new MemoryService();
}
