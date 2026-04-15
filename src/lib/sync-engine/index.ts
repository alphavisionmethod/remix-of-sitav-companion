// ═══════════════════════════════════════════════════════════════
// SITA OS — Sync Engine Barrel Export (Batch 1+2)
// ═══════════════════════════════════════════════════════════════

// Core
export { syncd } from "./syncd";
export { conflictResolver } from "./conflict-resolver";
export { deltaEngine } from "./delta-engine";
export { namespaceRegistry } from "./sync-namespaces";

// Adapters
export { fileWatchAdapter } from "./adapters/file-watch-adapter";
export { settingsSyncAdapter } from "./adapters/settings-sync-adapter";
export { sessionSyncAdapter } from "./adapters/session-sync-adapter";
export { appStateSyncAdapter } from "./adapters/app-state-adapter";
export { syncCacheDB } from "./adapters/sync-cache-db";

// Types - Core
export type {
  SyncObject, SyncObjectType, EncryptionClass, SyncObjectState,
  ContentRef, VersionVectorEntry, SyncChangeEvent, SyncCheckpoint,
  SyncObjectPermissions,
} from "./sync-object-model";
export type { SyncNamespace, ConflictStrategy, SyncPriority, NamespacePolicyFlags } from "./sync-namespaces";
export type { SyncConflict, ConflictResolution } from "./conflict-resolver";
export type { SyncDelta, DeltaType, DeltaOperation } from "./delta-engine";
export type { SyncMode, SyncJob, SyncDaemonStatus, EnvironmentSignals } from "./syncd";

// Types - Adapters
export type { FileEvent, SyncRoot, HydrationState, FileHydrationEntry } from "./adapters/file-watch-adapter";
export type { SettingSyncConfig, SettingsSnapshot } from "./adapters/settings-sync-adapter";
export type { SessionSnapshot, HandoffCandidate, WindowLayoutDescriptor } from "./adapters/session-sync-adapter";
export type { AppSyncManifest } from "./adapters/app-state-adapter";
export type { PendingChange, TransferJob, HydrationRecord, DeviceSyncPrefs } from "./adapters/sync-cache-db";

// Helpers
export {
  createSyncObject, generateSyncId, computeObjectHash,
  compareVersionVectors, incrementVersionVector,
  tombstoneSyncObject, isTombstoneExpired, isSyncObjectType,
} from "./sync-object-model";
