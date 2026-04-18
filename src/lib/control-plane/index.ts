// ═══════════════════════════════════════════════════════════════
// SITA OS — Control Plane Barrel
// Canonical import: @/lib/control-plane
// ═══════════════════════════════════════════════════════════════

export {
  KILL_SWITCH_REGISTRY,
  getKillSwitch,
  getKillSwitchByTarget,
  getDualApprovalSwitches,
  getSwitchesByImpact,
  getSwitchesAffectingService,
  getSwitchesAffectingTable,
  getSwitchesWithRunbook,
  getSwitchesByBoundedContext,
  getSwitchesByOwner,
  getImpactSummary,
} from "./kill-switch-registry";

export type {
  KillSwitchState,
  ImpactLevel,
  KillSwitchEntry,
  EnforcementLayer,
  EnforcementPoint,
  RuntimeConsequenceClass,
  RuntimeConsequence,
  SwitchDependencyEdge,
  KillSwitchGateResult,
} from "./kill-switch-types";

export {
  KILL_SWITCH_ENFORCEMENT_MAP,
  getEnforcementPoints,
  getEnforcementCoverage,
} from "./kill-switch-enforcement-map";

export {
  KILL_SWITCH_DEPENDENCY_MAP,
  getDependenciesOf,
  getDependentsOn,
  recommendCascade,
} from "./kill-switch-dependency-map";

export {
  KILL_SWITCH_CONSEQUENCE_MAP,
  getConsequence,
  getConsequencesForSurface,
} from "./kill-switch-runtime-consequence";

export {
  useKillSwitchGate,
  checkKillSwitch,
  checkKillSwitchOrReject,
  setKillSwitchStateResolver,
  publishKillSwitchSnapshot,
  snapshotAllKillSwitches,
} from "./use-kill-switch-gate";
