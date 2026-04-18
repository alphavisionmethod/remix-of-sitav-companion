// ═══════════════════════════════════════════════════════════════
// SITA OS — Storage Layer Barrel
// Canonical import: @/lib/storage
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
} from "./storage-topology-registry";
