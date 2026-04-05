// ═══════════════════════════════════════════════════════════════
// SITA OS — Persistence Layer Barrel
// ═══════════════════════════════════════════════════════════════

export {
  persistReceipt, fetchReceipts,
  persistProof, fetchProofs,
  persistMemory, fetchMemory, forgetMemory,
} from "./supabase-adapters";

export type {
  PersistedReceipt, PersistedProof, PersistedMemoryEntry,
} from "./supabase-adapters";

// ── Generic Engine Persistence ──────────────────────────────────
export {
  persistEngineState,
  debouncedPersistEngineState,
  loadEngineState,
  loadAllEngineStates,
  appendEngineEvent,
  fetchEngineEvents,
  clearEngineState,
} from "./engine-persistence-adapter";

// ── Intelligence Asset Persistence ──────────────────────────────
export {
  createIntelligenceAsset,
  fetchIntelligenceAssets,
  incrementAssetReuse,
  invalidateAsset,
  updateFreshness,
  getAssetStats,
} from "./intelligence-asset-persistence";
export type { IntelligenceAssetRow } from "./intelligence-asset-persistence";

// ── Quality Floor Persistence ───────────────────────────────────
export {
  fetchQualityFloors,
  upsertQualityFloor,
  deleteQualityFloor,
} from "./quality-floor-persistence";
export type { QualityFloorConfigRow } from "./quality-floor-persistence";

// ── Compute Governance Persistence ──────────────────────────────
export {
  createComputeSnapshot,
  fetchComputeSnapshots,
  getLatestSnapshot,
} from "./compute-governance-persistence";
export type { ComputeBudgetSnapshotRow } from "./compute-governance-persistence";

// ── Operator Taste Persistence ──────────────────────────────────
export {
  fetchTasteProfiles,
  upsertTasteProfile,
  recordTasteApplication,
  deleteTasteProfile,
} from "./operator-taste-persistence";
export type { OperatorTasteRow } from "./operator-taste-persistence";
