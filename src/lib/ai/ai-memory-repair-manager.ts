// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Memory Repair Manager
// Repair procedures for advisor memory systems.
// Extends MEMORY_AGING_RULES from advisor-memory-aging-policy.ts.
// ═══════════════════════════════════════════════════════════════

export type CorruptionDetection = "stale-check" | "integrity-hash" | "access-pattern-anomaly";
export type RepairProcedure = "prune" | "rebuild" | "rollback" | "operator-manual";
export type RollbackSafety = "safe" | "partial-data-loss" | "requires-backup";

export interface MemoryRepairEntry {
  domainId: string;
  description: string;
  corruptionDetection: CorruptionDetection;
  repairProcedure: RepairProcedure;
  preconditions: readonly string[];
  auditRequired: boolean;
  rollbackSafety: RollbackSafety;
}

export const MEMORY_REPAIR_ENTRIES: readonly MemoryRepairEntry[] = [
  {
    domainId: "working-memory-corruption",
    description: "Working memory contains stale or inconsistent short-lived entries",
    corruptionDetection: "stale-check",
    repairProcedure: "prune",
    preconditions: ["Identify entries older than maxAgeDays (1 day)", "Verify no active references"],
    auditRequired: true,
    rollbackSafety: "safe",
  },
  {
    domainId: "preference-drift",
    description: "User preference memory diverged from actual behavior patterns",
    corruptionDetection: "access-pattern-anomaly",
    repairProcedure: "rebuild",
    preconditions: ["Collect recent interaction data (30 days)", "Validate against user feedback signals"],
    auditRequired: true,
    rollbackSafety: "partial-data-loss",
  },
  {
    domainId: "stale-long-term-memory",
    description: "Long-term memory entries that haven't been accessed or validated in 90+ days",
    corruptionDetection: "stale-check",
    repairProcedure: "prune",
    preconditions: ["Check access_count and last_accessed_at", "Archive before pruning"],
    auditRequired: true,
    rollbackSafety: "safe",
  },
  {
    domainId: "orphaned-archival-entries",
    description: "Archived memory entries without valid parent references or context",
    corruptionDetection: "integrity-hash",
    repairProcedure: "operator-manual",
    preconditions: ["Scan for broken context_ref links", "Verify parent entity existence"],
    auditRequired: true,
    rollbackSafety: "requires-backup",
  },
];

export function getRepairEntry(domainId: string): MemoryRepairEntry | undefined {
  return MEMORY_REPAIR_ENTRIES.find((e) => e.domainId === domainId);
}

export function getRepairableDomainsRequiringAudit(): string[] {
  return MEMORY_REPAIR_ENTRIES.filter((e) => e.auditRequired).map((e) => e.domainId);
}

export function getSafeRepairDomains(): string[] {
  return MEMORY_REPAIR_ENTRIES.filter((e) => e.rollbackSafety === "safe").map((e) => e.domainId);
}