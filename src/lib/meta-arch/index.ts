// ═══════════════════════════════════════════════════════════════
// SITA OS — Meta-Architecture Layer Barrel (Phase 7)
// Canonical import: @/lib/meta-arch
// ═══════════════════════════════════════════════════════════════

export type {
  MetaContextHealth,
  MetaContextSummary,
  MetaArchSnapshot,
  RegistryIntegrityIssue,
  RegistryIntegrityReport,
  AnyRegistryEntry,
} from "./meta-arch-types";

export {
  listBoundedContexts,
  getKillSwitchesForContext,
  getRunbooksForContext,
  getGoldenPathIdsForContextSafe,
  getCounts,
  computeMetaArchSnapshot,
  resolveContextById,
  resolveSwitchById,
  resolveRunbookById,
} from "./meta-arch-registry";

export { validateRegistryIntegrity } from "./registry-integrity";
