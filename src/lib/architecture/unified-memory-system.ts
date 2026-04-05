// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Memory System
// One governed memory with 6 types.
// Source attribution, evidence grades, conflict detection,
// privacy tiers, expiration, correction, forget controls.
// ═══════════════════════════════════════════════════════════════

export type MemoryType =
  | "episodic"     // event/interaction records
  | "semantic"     // facts, knowledge, learned truths
  | "procedural"   // how-to, routines, workflows
  | "preference"   // user preferences, settings, calibration
  | "refusal"      // things the system refused and why
  | "regret";      // negative outcomes, mistakes, lessons

export type PrivacyTier = "public" | "household" | "private" | "sensitive" | "sealed";

export type MemoryConfidence = "verified" | "high" | "medium" | "low" | "uncertain";

export interface MemoryRecord {
  memoryId: string;
  type: MemoryType;
  tenantId: string;
  userId: string;
  domain: "finance-os" | "business-os" | "concierge-os" | "platform" | "cross-domain";
  content: string;
  structuredData?: Record<string, unknown>;
  sourceAttribution: MemorySource;
  evidenceGrade: "verified" | "attested" | "observed" | "inferred" | "claimed";
  confidence: MemoryConfidence;
  privacyTier: PrivacyTier;
  conflicts: MemoryConflict[];
  corrections: MemoryCorrection[];
  expiresAt?: string;
  forgottenAt?: string;
  forgetReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemorySource {
  sourceType: "user-input" | "advisor" | "system-observation" | "external-connector" | "inference";
  sourceId: string;
  sourceName: string;
  timestamp: string;
  proofId?: string;
}

export interface MemoryConflict {
  conflictId: string;
  conflictingMemoryId: string;
  conflictType: "contradiction" | "superseded" | "ambiguous";
  resolution?: "keep-both" | "prefer-newer" | "prefer-higher-evidence" | "user-resolved" | "unresolved";
  resolvedAt?: string;
}

export interface MemoryCorrection {
  correctionId: string;
  previousValue: string;
  correctedValue: string;
  correctedBy: string;
  reason: string;
  correctedAt: string;
}

// ── Memory Operations ───────────────────────────────────────

export function createMemory(
  type: MemoryType,
  content: string,
  opts: {
    tenantId: string; userId: string;
    domain: MemoryRecord["domain"];
    source: MemorySource;
    evidenceGrade: MemoryRecord["evidenceGrade"];
    privacyTier: PrivacyTier;
    expiresAt?: string;
  }
): MemoryRecord {
  return {
    memoryId: crypto.randomUUID(),
    type,
    tenantId: opts.tenantId,
    userId: opts.userId,
    domain: opts.domain,
    content,
    sourceAttribution: opts.source,
    evidenceGrade: opts.evidenceGrade,
    confidence: opts.evidenceGrade === "verified" ? "verified" : "medium",
    privacyTier: opts.privacyTier,
    conflicts: [],
    corrections: [],
    expiresAt: opts.expiresAt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function correctMemory(
  memory: MemoryRecord,
  newValue: string,
  correctedBy: string,
  reason: string,
): MemoryRecord {
  return {
    ...memory,
    content: newValue,
    corrections: [
      ...memory.corrections,
      {
        correctionId: crypto.randomUUID(),
        previousValue: memory.content,
        correctedValue: newValue,
        correctedBy,
        reason,
        correctedAt: new Date().toISOString(),
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

export function forgetMemory(memory: MemoryRecord, reason: string): MemoryRecord {
  return {
    ...memory,
    forgottenAt: new Date().toISOString(),
    forgetReason: reason,
    content: "[FORGOTTEN]",
    structuredData: undefined,
    updatedAt: new Date().toISOString(),
  };
}

export function detectConflict(a: MemoryRecord, b: MemoryRecord): MemoryConflict | null {
  if (a.memoryId === b.memoryId) return null;
  if (a.domain !== b.domain) return null;
  if (a.type !== b.type) return null;
  // Simplified: same domain + type + different content = potential conflict
  if (a.content !== b.content) {
    return {
      conflictId: crypto.randomUUID(),
      conflictingMemoryId: b.memoryId,
      conflictType: "contradiction",
    };
  }
  return null;
}
