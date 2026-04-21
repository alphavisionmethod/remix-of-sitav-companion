// ═══════════════════════════════════════════════════════════════
// SITA OS — Operations Layer Barrel
// Canonical import: @/lib/operations
// ═══════════════════════════════════════════════════════════════

export {
  GOLDEN_PATH_REGISTRY,
  getGoldenPath,
  getGoldenPathsByContext,
  getGoldenPathsByCriticality,
  getGoldenPathsForKillSwitch,
  getGoldenPathsForRunbook,
  getOwnerships,
  getStepBindings,
} from "./golden-path-registry";

export type {
  GoldenPathEntry,
  GoldenPathId,
  GoldenPathStep,
  GoldenPathVerification,
  GoldenPathOwnership,
  GoldenPathStepBinding,
  GoldenPathPersona,
  GoldenPathCriticality,
  GoldenPathSurface,
  GoldenPathVerificationKind,
} from "./golden-path-types";

export {
  GOLDEN_PATH_OWNERSHIP,
  getOwnership,
  getPathsForOwnerTeam,
  listOwnerTeams,
  getCriticalityForOwnerTeam,
} from "./golden-path-ownership";

export {
  GOLDEN_PATH_VERIFICATION_MAP,
  getVerificationSummary,
  getMissingVerifications,
  type GoldenPathVerificationSummary,
} from "./golden-path-verification-map";

export {
  GOLDEN_PATHS_BY_KILL_SWITCH,
  GOLDEN_PATHS_BY_RUNBOOK,
  GOLDEN_PATHS_BY_CONTEXT,
  getGoldenPathIdsForKillSwitch,
  getGoldenPathIdsForRunbook,
  getGoldenPathIdsForContext,
} from "./golden-path-cross-link";

export {
  evaluateGoldenPaths,
  evaluatePath,
  summarizeEvaluation,
  type GoldenPathHealth,
  type GoldenPathEvaluation,
} from "./golden-path-evaluator";

// ═══ Wave 21 — Recovery Architecture Closure ═══

export {
  RECOVERY_EXECUTION_STATES,
  VALID_TRANSITIONS,
  isValidTransition,
  createExecutionInstance,
  transitionState,
  type RecoveryExecutionState,
  type RecoveryStepContract,
  type RecoveryExecutionInstance,
  type StepAutomation,
  type StepSafetyLevel,
} from "./runbook-execution-contract";

export {
  executeRecoveryPlan,
  executeRecoveryWithGovernance,
  abortRecovery,
  escalateRecovery,
  type RecoveryStep,
  type RecoveryReceipt,
  type RecoveryStepStatus,
  type GovernedRecoveryResult,
} from "./recovery-execution-engine";

export {
  RECOVERY_DEPENDENCY_GRAPH,
  getDependenciesFor,
  getRecoveryOrder,
  type RecoveryDependencyNode,
} from "./recovery-dependency-graph";

export {
  executeDrill,
  type DrillScenario,
  type DrillReceipt,
  type DrillStepOutcome,
} from "./recovery-drill-runner";

export {
  computeMetrics,
  summarizeMetrics,
  type RecoveryTimingMetrics,
  type RecoveryMetricsSummary,
} from "./recovery-metrics";

export {
  FRESHNESS_WINDOWS,
  DEPENDENCY_CHANGE_INVALIDATORS,
  getFreshnessWindow,
  checkFreshness,
  type FreshnessWindow,
  type FreshnessStatus,
} from "./runbook-freshness-policy";

export {
  CONFIRMATION_POLICY,
  getConfirmationRequirement,
  requiresConfirmation,
  requiresDualControl,
  type ConfirmationRequirement,
  type ConfirmationRecord,
} from "./recovery-operator-confirmation";

export {
  buildPostmortem,
  type PostmortemArtifact,
  type PostmortemTimelineEntry,
} from "./recovery-postmortem-builder";

export {
  SIMULATION_SCENARIOS,
  getScenarioById,
  getScenariosForSubsystem,
  type SimulationScenario,
} from "./recovery-simulation-policy";

export {
  SYSTEM_COVERAGE_MAP,
  getCoverageForSystem,
  getCriticalGaps,
  getOverallCoveragePercent,
  type SystemCoverageEntry,
} from "./recovery-system-coverage-map";
