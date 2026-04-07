// ═══════════════════════════════════════════════════════════════
// SITA OS — Epistemic Firewall Barrel
// Evidence Grading + Cite-Check + Assumption Registry +
// Negative Receipts + Tool Grounding + Sentinel Engine + Cortex Loop
// ═══════════════════════════════════════════════════════════════

// Evidence Grader (Truth Triangle Gate 1)
export {
  gradeEvidence,
  gradeEvidenceSet,
  getDomainEvidencePolicy,
  isHighTrustDomain,
  EVIDENCE_GRADE_POLICIES,
} from "./evidence-grader";
export type {
  EvidenceGrade,
  EvidenceGradePolicy,
  EvidenceItem,
  GradedEvidence,
  GradedEvidenceSet,
  DomainEvidencePolicy,
} from "./evidence-grader";

// Cite-Checker (Truth Triangle Gate 2)
export {
  extractClaims,
  verifyClaim,
  runCiteCheck,
  getCiteCheckPolicy,
} from "./cite-checker";
export type {
  ClaimVerdict,
  ExtractedClaim,
  ClaimVerification,
  CiteCheckResult,
} from "./cite-checker";

// Assumption Registry (Truth Triangle Gate 3)
export {
  createAssumption,
  invalidateAssumption,
  confirmAssumption,
  getAssumptionsForCorrelation,
  getAssumptionsForUser,
  getActiveAssumptions,
  getHighImpactAssumptions,
  buildAssumptionSet,
  getAssumptionStats,
  assumeIncomeStable,
  assumeExpenseStable,
  assumeConnectorFresh,
  assumeNoNewObligations,
} from "./assumption-registry";
export type {
  Assumption,
  AssumptionCategory,
  AssumptionStatus,
  AssumptionSet,
} from "./assumption-registry";

// Negative Receipts
export {
  createNegativeReceipt,
  refuseForWeakEvidence,
  refuseForCiteCheckFailure,
  refuseForBudgetExceeded,
  refuseForMissingApproval,
  getNegativeReceipts,
  getNegativeReceiptStats,
} from "./negative-receipt";
export type {
  NegativeReceipt,
  RefusalReason,
  SuggestedAction,
} from "./negative-receipt";

// Tool Grounding
export {
  checkGrounding,
  getGroundingRulesForDomain,
  getBlockingRulesForDomain,
  logGroundingCheck,
  getGroundingStats,
  GROUNDING_RULES,
} from "./tool-grounding";
export type {
  GroundedFieldType,
  GroundingRule,
  GroundingViolation,
  GroundingCheckResult,
  GroundedSource,
} from "./tool-grounding";

// Sentinel Engine / Invariant Guard
export {
  runSentinelCheck,
  logSentinelReport,
  getSentinelHistory,
  getSentinelStats,
  getInvariants,
  getInvariantById,
} from "./sentinel-engine";
export type {
  Invariant,
  InvariantContext,
  InvariantCheckResult,
  SentinelReport,
  InvariantSeverity,
  InvariantScope,
} from "./sentinel-engine";

// Cortex Loop Runtime
export {
  createCortexState,
  advanceStage,
  completeCortexLoop,
  recordVerifiedOutcome,
  getVerifiedOutcomes,
  getOutcomeLearningStats,
  getCortexLoopConfig,
  CORTEX_LOOP_CONFIGS,
} from "./cortex-loop";
export type {
  CortexStage,
  CortexLoopConfig,
  CortexState,
  CortexStageRecord,
  CortexOutcome,
  VerifiedOutcome,
} from "./cortex-loop";

