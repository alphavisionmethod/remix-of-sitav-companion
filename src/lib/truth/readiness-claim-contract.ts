// ═══════════════════════════════════════════════════════════════
// SITA OS — Readiness Claim Contract
// Canonical types for claims, proofs, dimensions, contradictions
// ═══════════════════════════════════════════════════════════════

export type ReadinessDimension =
  | "structural"
  | "behavioral"
  | "distribution"
  | "operational"
  | "trust";

export type ReadinessVerdict =
  | "READY"
  | "CONDITIONALLY_READY"
  | "STRUCTURALLY_READY_ONLY"
  | "BEHAVIORALLY_PARTIAL"
  | "DISTRIBUTION_BLOCKED"
  | "OPERATIONALLY_DEFERRED"
  | "TRUST_GAP_OPEN"
  | "DEFERRED";

export type ContradictionSeverity = "critical" | "high" | "medium" | "low";
export type ContradictionStatus = "open" | "mitigated" | "accepted" | "closed";
export type ProofType = "generated-artifact" | "validator-gate" | "runtime-evidence" | "nightly-run" | "manual-attestation";
export type ClaimConfidence = "high" | "medium" | "low" | "unverified";

export interface ReadinessClaim {
  readonly claimId: string;
  readonly claim: string;
  readonly subsystem: string;
  readonly claimType: "readiness" | "closure" | "security" | "behavioral" | "operational";
  readonly dimensions: readonly ReadinessDimension[];
  readonly proofArtifacts: readonly string[];
  readonly evidenceSources: readonly string[];
  readonly owner: string;
  readonly confidence: ClaimConfidence;
  readonly advisorySensitivity: "none" | "low" | "medium" | "high";
  readonly invalidationConditions: readonly string[];
  readonly lastVerified: string;
  readonly currentVerdict: ReadinessVerdict;
}

export interface ContradictionEntry {
  readonly contradictionId: string;
  readonly title: string;
  readonly description: string;
  readonly involvedClaims: readonly string[];
  readonly conflictingEvidence: readonly string[];
  readonly impactedDimensions: readonly ReadinessDimension[];
  readonly severity: ContradictionSeverity;
  readonly owner: string;
  readonly mitigationPath: string;
  readonly status: ContradictionStatus;
  readonly lastVerified: string;
}

export interface ProofMapping {
  readonly claimId: string;
  readonly proofType: ProofType;
  readonly artifactPath: string;
  readonly validatorScript?: string;
  readonly runtimeEvidence?: string;
  readonly owner: string;
  readonly staleAfterHours: number;
  readonly invalidationTriggers: readonly string[];
}

export interface DimensionScore {
  readonly dimension: ReadinessDimension;
  readonly score: number; // 0-100
  readonly verdict: ReadinessVerdict;
  readonly passingGates: number;
  readonly totalGates: number;
  readonly openContradictions: number;
  readonly advisoryCount: number;
}

export interface SubsystemScoreboard {
  readonly subsystem: string;
  readonly dimensions: readonly DimensionScore[];
  readonly overallVerdict: ReadinessVerdict;
  readonly lastEvaluated: string;
}