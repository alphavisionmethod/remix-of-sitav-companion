// ═══════════════════════════════════════════════════════════════
// SITA OS — Kernel Contract: EvidencePack
// Bundles evidence references for trust-aware execution.
// ═══════════════════════════════════════════════════════════════

export type KernelEvidenceType = "receipt" | "memory" | "external" | "user-input" | "advisor-output" | "verification" | "policy-decision";

export interface EvidenceReference {
  id: string;
  type: KernelEvidenceType;
  sourceId: string;
  sourceLabel: string;
  trustLevel: "verified" | "inferred" | "external" | "user-provided" | "unverified";
  confidence: number;
  ingestedAt: string;
  relevanceScore?: number;
}

export interface EvidencePack {
  id: string;
  correlationId: string;
  envelopeId: string;
  references: EvidenceReference[];
  aggregateConfidence: number;
  aggregateTrustLevel: "verified" | "inferred" | "external" | "mixed" | "unverified";
  createdAt: string;
}

/** Compute aggregate confidence from evidence references */
export function computeAggregateConfidence(refs: EvidenceReference[]): number {
  if (refs.length === 0) return 0;
  return refs.reduce((sum, r) => sum + r.confidence, 0) / refs.length;
}

/** Determine aggregate trust level */
export function computeAggregateTrust(refs: EvidenceReference[]): EvidencePack["aggregateTrustLevel"] {
  if (refs.length === 0) return "unverified";
  const levels = new Set(refs.map(r => r.trustLevel));
  if (levels.size === 1) return refs[0].trustLevel as EvidencePack["aggregateTrustLevel"];
  if (levels.has("unverified")) return "mixed";
  if (levels.has("external") && levels.has("verified")) return "mixed";
  return "inferred";
}
