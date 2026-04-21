// ═══════════════════════════════════════════════════════════════
// SITA OS — Archive Inventory (Workstream B)
// Complete inventory of wrapper, deprecated, and legacy files
// ═══════════════════════════════════════════════════════════════

export type ArchiveCategory =
  | "migrated-wrapper"
  | "deprecated-service"
  | "legacy-script"
  | "false-positive"
  | "compliance-hold"
  | "historical-reference";

export type ArchiveResolution =
  | "safe-to-delete"
  | "retained-with-reason"
  | "migrated-to-docs"
  | "restored-to-active"
  | "pending-review"
  | "deleted";

export interface ArchiveEntry {
  path: string;
  category: ArchiveCategory;
  resolution: ArchiveResolution;
  importerCount: number;
  safeToDelete: boolean;
  retentionReason: string | null;
  retentionDeadline: string | null;
  notes: string;
}

export const ARCHIVE_INVENTORY: readonly ArchiveEntry[] = [
  // ── Migrated-wrapper files in src/domains/types/ ──
  { path: "src/domains/types/admin-view-models.ts", category: "migrated-wrapper", resolution: "pending-review", importerCount: 0, safeToDelete: false, retentionReason: null, retentionDeadline: null, notes: "Wrapper re-exporting from src/lib/types/" },
  { path: "src/domains/types/advisor-orchestration.types.ts", category: "migrated-wrapper", resolution: "pending-review", importerCount: 0, safeToDelete: false, retentionReason: null, retentionDeadline: null, notes: "Wrapper re-exporting from src/lib/types/" },
  { path: "src/domains/types/auth-connector-separation.types.ts", category: "migrated-wrapper", resolution: "pending-review", importerCount: 0, safeToDelete: false, retentionReason: null, retentionDeadline: null, notes: "Wrapper re-exporting from src/lib/types/" },
  { path: "src/domains/types/digital-twin.types.ts", category: "migrated-wrapper", resolution: "pending-review", importerCount: 0, safeToDelete: false, retentionReason: null, retentionDeadline: null, notes: "Wrapper re-exporting from src/lib/types/" },
  { path: "src/domains/types/domain-types.ts", category: "migrated-wrapper", resolution: "pending-review", importerCount: 0, safeToDelete: false, retentionReason: null, retentionDeadline: null, notes: "Wrapper re-exporting from src/lib/types/" },
  { path: "src/domains/types/dwe-types.ts", category: "migrated-wrapper", resolution: "pending-review", importerCount: 0, safeToDelete: false, retentionReason: null, retentionDeadline: null, notes: "Wrapper re-exporting from src/lib/types/" },
  { path: "src/domains/types/entity-graph.types.ts", category: "migrated-wrapper", resolution: "pending-review", importerCount: 0, safeToDelete: false, retentionReason: null, retentionDeadline: null, notes: "Wrapper re-exporting from src/lib/types/" },
  { path: "src/domains/types/guards.ts", category: "migrated-wrapper", resolution: "pending-review", importerCount: 0, safeToDelete: false, retentionReason: null, retentionDeadline: null, notes: "Wrapper re-exporting from src/lib/types/" },
  { path: "src/domains/types/index.ts", category: "migrated-wrapper", resolution: "pending-review", importerCount: 0, safeToDelete: false, retentionReason: null, retentionDeadline: null, notes: "Barrel wrapper" },
  { path: "src/domains/types/memory-governance.types.ts", category: "migrated-wrapper", resolution: "pending-review", importerCount: 0, safeToDelete: false, retentionReason: null, retentionDeadline: null, notes: "Wrapper re-exporting from src/lib/types/" },
  { path: "src/domains/types/meta-governance.types.ts", category: "migrated-wrapper", resolution: "pending-review", importerCount: 0, safeToDelete: false, retentionReason: null, retentionDeadline: null, notes: "Wrapper re-exporting from src/lib/types/" },
  { path: "src/domains/types/mission-control.types.ts", category: "migrated-wrapper", resolution: "pending-review", importerCount: 0, safeToDelete: false, retentionReason: null, retentionDeadline: null, notes: "Wrapper re-exporting from src/lib/types/" },
  { path: "src/domains/types/os-unified.types.ts", category: "migrated-wrapper", resolution: "pending-review", importerCount: 0, safeToDelete: false, retentionReason: null, retentionDeadline: null, notes: "Wrapper re-exporting from src/lib/types/" },
  { path: "src/domains/types/policy-depth.types.ts", category: "migrated-wrapper", resolution: "pending-review", importerCount: 0, safeToDelete: false, retentionReason: null, retentionDeadline: null, notes: "Wrapper re-exporting from src/lib/types/" },
  { path: "src/domains/types/relation-parsers.ts", category: "migrated-wrapper", resolution: "pending-review", importerCount: 0, safeToDelete: false, retentionReason: null, retentionDeadline: null, notes: "Wrapper re-exporting from src/lib/types/" },
  { path: "src/domains/types/render.ts", category: "migrated-wrapper", resolution: "pending-review", importerCount: 0, safeToDelete: false, retentionReason: null, retentionDeadline: null, notes: "Wrapper re-exporting from src/lib/types/" },
  { path: "src/domains/types/replay-recovery.types.ts", category: "migrated-wrapper", resolution: "pending-review", importerCount: 0, safeToDelete: false, retentionReason: null, retentionDeadline: null, notes: "Wrapper re-exporting from src/lib/types/" },
  { path: "src/domains/types/revenue-engine.types.ts", category: "migrated-wrapper", resolution: "pending-review", importerCount: 0, safeToDelete: false, retentionReason: null, retentionDeadline: null, notes: "Wrapper re-exporting from src/lib/types/" },
  { path: "src/domains/types/token-governance.types.ts", category: "migrated-wrapper", resolution: "pending-review", importerCount: 0, safeToDelete: false, retentionReason: null, retentionDeadline: null, notes: "Wrapper re-exporting from src/lib/types/" },

  // ── Deprecated service files ──
  { path: "src/lib/core-services/agent-orchestrator.ts", category: "deprecated-service", resolution: "pending-review", importerCount: 0, safeToDelete: false, retentionReason: "May have active importers", retentionDeadline: null, notes: "@deprecated marker found" },
  { path: "src/lib/core-services/analytics-service.ts", category: "deprecated-service", resolution: "pending-review", importerCount: 0, safeToDelete: false, retentionReason: "May have active importers", retentionDeadline: null, notes: "@deprecated marker found" },
  { path: "src/lib/core-services/canonical-chain-orchestrator.ts", category: "deprecated-service", resolution: "pending-review", importerCount: 0, safeToDelete: false, retentionReason: "May have active importers", retentionDeadline: null, notes: "@deprecated marker found" },
  { path: "src/lib/core-services/memory-service.ts", category: "deprecated-service", resolution: "pending-review", importerCount: 0, safeToDelete: false, retentionReason: "Superseded by memory-service/ dir", retentionDeadline: null, notes: "@deprecated — file vs directory conflict" },
  { path: "src/lib/backend-topology/edge-function-categories.ts", category: "deprecated-service", resolution: "pending-review", importerCount: 0, safeToDelete: false, retentionReason: null, retentionDeadline: null, notes: "@deprecated marker found" },

  // ── Legacy scripts ──
  { path: "scripts/legacy/migration-tools/consolidate-services.js", category: "legacy-script", resolution: "retained-with-reason", importerCount: 0, safeToDelete: false, retentionReason: "Reference until service consolidation completes", retentionDeadline: "2026-07-01", notes: "One-off migration runner" },
  { path: "scripts/legacy/README.md", category: "historical-reference", resolution: "retained-with-reason", importerCount: 0, safeToDelete: false, retentionReason: "Documents legacy script purpose", retentionDeadline: null, notes: "Documentation" },
] as const;

export function getArchiveStats() {
  const entries = ARCHIVE_INVENTORY;
  return {
    total: entries.length,
    pendingReview: entries.filter(e => e.resolution === "pending-review").length,
    safeToDelete: entries.filter(e => e.safeToDelete).length,
    retained: entries.filter(e => e.resolution === "retained-with-reason").length,
    deleted: entries.filter(e => e.resolution === "deleted").length,
    byCategory: {
      migratedWrapper: entries.filter(e => e.category === "migrated-wrapper").length,
      deprecatedService: entries.filter(e => e.category === "deprecated-service").length,
      legacyScript: entries.filter(e => e.category === "legacy-script").length,
      historicalReference: entries.filter(e => e.category === "historical-reference").length,
    },
  };
}