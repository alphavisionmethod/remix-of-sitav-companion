// ============================================================
// SITA OS — No-Hallucination Contract Type System
// System-wide anti-hallucination types and interfaces
// ============================================================

export type HallucinationRiskClass = "low" | "medium" | "high" | "critical-truth";

export type OutputClass = "observation" | "recommendation" | "draft" | "simulation" | "approval-ready";

export type DowngradeLevel = "none" | "caveat" | "low-confidence" | "refuse";

export type FreshnessLevel = "fresh" | "aging" | "stale" | "critical";

export type RequiredSourceType = "deterministic" | "verified-external" | "canonical-record";

// ── Confidence Envelope ───────────────────────────────────

export interface ConfidenceEnvelope {
  score: number; // 0-1
  riskClass: HallucinationRiskClass;
  reasons: string[];
  missingInputs: string[];
  staleInputs: string[];
  downgradedFields: string[];
  isRefused: boolean;
}

// ── Grounding Report ──────────────────────────────────────

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

// ── Refusal State ─────────────────────────────────────────

export interface RefusalState {
  refused: boolean;
  reason: string;
  nextSteps: string[];
  fallbackOutput?: string;
  downgradeLevel: DowngradeLevel;
}

// ── Staleness State ───────────────────────────────────────

export interface SourceFreshness {
  id: string;
  name: string;
  lastUpdated: string;
  ageMs: number;
  threshold: number;
  isStale: boolean;
}

export interface StalenessState {
  sources: SourceFreshness[];
  overallFreshness: FreshnessLevel;
}

// ── Contradiction Report ──────────────────────────────────

export interface Contradiction {
  field: string;
  sourceA: string;
  valueA: string;
  sourceB: string;
  valueB: string;
  severity: "material" | "minor";
}

export interface ContradictionReport {
  contradictions: Contradiction[];
  recommendedDowngrade: string | null;
}

// ── Truth Boundary Rule ───────────────────────────────────

export interface TruthBoundaryRule {
  domain: string;
  field: string;
  requiredSource: RequiredSourceType;
  neverFromLLM: boolean;
  description?: string;
}

// ── Advisor Contract ──────────────────────────────────────

export interface AdvisorGroundingConfig {
  advisorId: string;
  domain: string;
  requiredInputs: string[];
  optionalInputs: string[];
  confidenceThreshold: number;
  blockedActionsWhenStale: string[];
  outputClass: OutputClass;
  refusalConditions: string[];
}

// ── Wrapped Output ────────────────────────────────────────

export interface TruthWrappedOutput<T = unknown> {
  data: T;
  confidence: ConfidenceEnvelope;
  grounding: GroundingReport;
  staleness: StalenessState;
  contradictions: ContradictionReport;
  refusal: RefusalState;
  outputClass: OutputClass;
  generatedAt: string;
}
