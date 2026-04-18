// ═══════════════════════════════════════════════════════════════
// SITA OS — Legacy Orchestrator Map (Migration)
// Maps every legacy orchestrator to its new role
// ═══════════════════════════════════════════════════════════════

// Re-export the canonical registry which contains the full map
export { LEGACY_ORCHESTRATOR_MAP, getLegacyEntry, getEntriesByLayer, getMigrationReport } from "../shared/orchestration-registry";
