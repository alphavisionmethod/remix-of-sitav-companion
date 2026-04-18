// ═══════════════════════════════════════════════════════════════
// SITA OS — Storage Layer Barrel
// Canonical import: @/lib/storage (forwards to @/data/persistence)
// ═══════════════════════════════════════════════════════════════

export {
  STORAGE_TOPOLOGY_REGISTRY,
  getBackendById,
  getBackendsByType,
  getOfflineCapableBackends,
  getRLSProtectedBackends,
  getBackendsByDomain,
  getPersistentBackends,
  getFailoverChain,
  type StorageBackendType,
  type EncryptionModel,
  type ReplicationMode,
  type StorageTier,
  type StorageBackendEntry,
} from "@/data/persistence/storage-topology-registry";
