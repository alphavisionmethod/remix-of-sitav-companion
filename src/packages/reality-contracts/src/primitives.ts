// ═══════════════════════════════════════════════════════════════
// SITA OS — Reality Contracts: Shared Primitives
// Canonical enums and metadata for simulation, evidence,
// verification, finality, drift, reconciliation, autonomy, export
// ═══════════════════════════════════════════════════════════════

/** Structural lane separation — simulation, shadow, and live are never conflated */
export type RealityLane = "simulation" | "shadow" | "live";

/** Progression from tentative to irreversible finality */
export type FinalityLevel = "tentative" | "provisional" | "committed" | "finalized" | "irreversible";

/** Classification of reversal difficulty */
export type IrreversibilityClass =
  | "freely-reversible"
  | "reversible-with-cost"
  | "conditionally-reversible"
  | "irreversible"
  | "permanently-irreversible";

/** Drift severity scale */
export type DriftSeverity = "info" | "low" | "medium" | "high" | "critical";

/** Canonical evidence quality scale */
export type EvidenceGradeLevel =
  | "unverified"
  | "self-reported"
  | "system-observed"
  | "independently-verified"
  | "cryptographically-proven";

/** Verification outcome status */
export type RealityVerificationStatus = "pending" | "passed" | "failed" | "inconclusive" | "skipped";

/** Sensitivity classification */
export type SensitivityClassification = "public" | "internal" | "confidential" | "restricted" | "critical";

/** Retention class — governs storage, replay, and export eligibility */
export type RetentionClass =
  | "source-of-truth"
  | "append-only-reference"
  | "immutable"
  | "immutable-reference"
  | "operational"
  | "derived"
  | "governed-mutable"
  | "short-lived"
  | "redacted-export"
  | "sovereign-export";

/** Autonomy trust level for promotion/downgrade tracking */
export type AutonomyLevel =
  | "observe"
  | "suggest"
  | "approve-execute"
  | "delegated-single"
  | "delegated-recurring"
  | "fully-autonomous";

/** Reconciliation status */
export type ReconciliationStatus = "matched" | "partial" | "unresolved" | "escalated";

/** Metadata shared by all reality contract types */
export interface RealityContractMeta {
  producer: string[];
  consumers: string[];
  sensitivity: SensitivityClassification;
  retention_class: RetentionClass;
  deterministic_validation: boolean;
  receipt_binding_required: boolean | "conditional";
  approval_reference_required: boolean | "conditional";
}
