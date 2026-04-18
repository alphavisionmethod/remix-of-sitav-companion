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
