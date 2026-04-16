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
  type RunbookSeverity,
  type RunbookStatus,
  type RunbookStep,
  type RunbookEntry,
} from "./runbook-registry";
