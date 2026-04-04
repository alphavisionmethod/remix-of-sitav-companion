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
