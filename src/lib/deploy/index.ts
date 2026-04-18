// ═══════════════════════════════════════════════════════════════
// SITA OS — Deploy Layer Barrel
// Canonical import: @/lib/deploy
// ═══════════════════════════════════════════════════════════════

export type {
  DeployStage,
  DeployStageState,
  DeployStageEvidence,
  DeployabilityEntry,
  DeployabilityScore,
} from "./deployability-types";

export {
  DEPLOYABILITY_REGISTRY,
  scoreDeployability,
  allDeployabilityScores,
  deployabilityHealth,
} from "./deployability-registry";
