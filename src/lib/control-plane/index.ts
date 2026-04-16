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
  getImpactSummary,
  type KillSwitchState,
  type ImpactLevel,
  type KillSwitchEntry,
} from "./kill-switch-registry";
