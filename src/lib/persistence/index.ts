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

// ── EventBus Persistence ────────────────────────────────────────
export {
  persistEvent,
  persistDeadLetter,
  persistEventBatch,
  fetchPersistedEvents,
  fetchDeadLetters,
  markEventReplayed,
  getPersistedTopicCounts,
  getEventLineage,
} from "./event-bus-persistence";
export type { PersistedEvent } from "./event-bus-persistence";

// ── Scoped Memory Persistence ───────────────────────────────────
export {
  persistMemoryEntry,
  supersedeMemoryEntry,
  fetchScopedMemory,
  forgetScopedMemory,
  updateMemoryConfidence,
  getMemoryStats as getScopedMemoryStats,
  hydrateMemoryForAI,
} from "./memory-service-persistence";
export type { PersistedScopedMemory, MemoryScope } from "./memory-service-persistence";

// ── Policy Evaluation Persistence ───────────────────────────────
export {
  persistPolicyEvaluation,
  fetchPolicyEvaluations,
  getPolicyEvaluationStats,
  getPolicyLineageForAction,
} from "./policy-engine-persistence";
export type { PersistedPolicyEvaluation } from "./policy-engine-persistence";

// ── Action Lineage Persistence ──────────────────────────────────
export {
  persistActionRecord,
  persistActionTransition,
  linkEventToAction,
  linkMemoryToAction,
  linkPolicyToAction,
  linkReceiptToAction,
  addProofToAction,
  fetchActionLineage,
  getActionExplanation,
  findStuckActions,
} from "./action-lineage-persistence";
export type { PersistedActionLineage } from "./action-lineage-persistence";
