// ═══════════════════════════════════════════════════════════════
// SITA OS — Reality Contracts Package
// Canonical types for simulation, evidence, verification,
// finality, drift, reconciliation, autonomy, and export
// ═══════════════════════════════════════════════════════════════

// Primitives & enums
export type {
  RealityLane,
  EvidenceGradeLevel,
  RealityVerificationStatus,
  SensitivityClassification,
  RetentionClass,
  AutonomyLevel,
  ReconciliationStatus,
  RealityContractMeta,
} from "./src/primitives";

// Re-export DriftSeverity and FinalityLevel from primitives only (definition files use them)
export type { FinalityLevel } from "./src/primitives";
export type { IrreversibilityClass } from "./src/primitives";
export type { DriftSeverity } from "./src/primitives";

// Simulation contracts
export type { RealitySwitch } from "./src/reality-switch";
export type { SimulationScenario } from "./src/simulation-scenario";
export type { SimulationInput } from "./src/simulation-input";
export type { SimulationResult } from "./src/simulation-result";
export type { ShadowExecutionRecord } from "./src/shadow-execution-record";
export type { ScenarioComparison } from "./src/scenario-comparison";
export type { CounterfactualSet } from "./src/counterfactual-set";

// Uncertainty & confidence contracts
export type { ConfidenceScore } from "./src/confidence-score";
export type { ConfidenceTrend } from "./src/confidence-trend";
export type { UncertaintyBand } from "./src/uncertainty-band";

// Evidence contracts
export type { EvidenceGrade } from "./src/evidence-grade";
export type { EvidenceSource } from "./src/evidence-source";
export type { EvidenceLineage } from "./src/evidence-lineage";

// Finality & irreversibility contracts
export type { FinalityLevelDefinition } from "./src/finality-level";
export type { IrreversibilityClassDefinition } from "./src/irreversibility-class";
export type { ReversibilityWindow } from "./src/reversibility-window";
export type { FinalityDecision } from "./src/finality-decision";

// Verification contracts
export type { VerificationAssertion } from "./src/verification-assertion";
export type { Postcondition } from "./src/postcondition";
export type { VerificationOutcome } from "./src/verification-outcome";

// Drift contracts
export type { DriftDetection } from "./src/drift-detection";
export type { DriftSeverityDefinition } from "./src/drift-severity";
export type { DriftIncident } from "./src/drift-incident";

// Reconciliation contracts
export type { ReconciliationResult } from "./src/reconciliation-result";
export type { ReconciliationGap } from "./src/reconciliation-gap";
export type { ReconciliationCheckpoint } from "./src/reconciliation-checkpoint";

// Autonomy contracts
export type { AutonomyPromotionRecord } from "./src/autonomy-promotion-record";
export type { AutonomyDowngradeRecord } from "./src/autonomy-downgrade-record";

// Export & audit contracts
export type { RealityExportPack } from "./src/reality-export-pack";
export type { AuditAnchorReference } from "./src/audit-anchor-reference";
export type { CryptoShredEligibility } from "./src/crypto-shred-eligibility";

// Scaling / nightly contracts
export type { NightlyDriftSummary } from "./src/nightly-drift-summary";
export type { NightlyReconciliationSummary } from "./src/nightly-reconciliation-summary";
export type { TrustRecalibrationSignal } from "./src/trust-recalibration-signal";
