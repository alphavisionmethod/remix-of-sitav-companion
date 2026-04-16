// ═══════════════════════════════════════════════════════════════
// SITA OS — Support Layer Barrel
// Canonical import: @/lib/support
// ═══════════════════════════════════════════════════════════════

export {
  RUNBOOK_REGISTRY,
  getRunbook,
  getRunbooksBySeverity,
  getRunbooksForService,
  getRunbooksWithKillSwitch,
  getRunbooksByOwner,
  getUntestedRunbooks,
  getRunbooksByStatus,
  getRunbookForKillSwitch,
  getRunbooksByBoundedContext,
  getRunbookForSubsystem,
} from "./runbook-registry";

export type {
  RunbookSeverity,
  RunbookStatus,
  RunbookStep,
  RunbookEntry,
  RunbookSubsystem,
} from "./runbook-types";

export {
  RUNBOOK_SUBSYSTEM_REQUIREMENTS,
  getMandatorySubsystems,
  getCriticalIncidentSubsystems,
  type RunbookSubsystemRequirement,
} from "./runbook-subsystem-map";
