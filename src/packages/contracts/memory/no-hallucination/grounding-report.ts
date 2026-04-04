// ═══════════════════════════════════════════════════════════════
// SITA OS — Memory: No-Hallucination: Grounding Report
// ═══════════════════════════════════════════════════════════════

export type RequiredSourceType = "deterministic" | "verified-external" | "canonical-record";

export interface GroundingSource {
  id: string;
  name: string;
  domain: string;
  type: RequiredSourceType;
  lastUpdated: string;
  fieldsCited: string[];
}

export interface GroundingReport {
  sources: GroundingSource[];
  derivedFields: string[];
  verbatimFields: string[];
  ambiguities: string[];
  ungroundedClaims: string[];
}
