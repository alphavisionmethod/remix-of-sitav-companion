// ═══════════════════════════════════════════════════════════════
// SITA OS — Storage Topology Registry
// Maps all storage backends with replication, encryption, quota
// ═══════════════════════════════════════════════════════════════

export type StorageBackendType = "supabase-db" | "supabase-storage" | "indexeddb" | "localstorage" | "sessionstorage" | "nova-fs" | "memory";
export type EncryptionModel = "at-rest-aes256" | "in-transit-tls" | "e2e-encrypted" | "none";
export type ReplicationMode = "cloud-primary" | "local-first" | "write-through" | "cache-only" | "ephemeral";
export type StorageTier = "hot" | "warm" | "cold" | "archive";

export interface StorageBackendEntry {
  readonly backendId: string;
  readonly type: StorageBackendType;
  readonly displayName: string;
  readonly description: string;
  readonly replicationMode: ReplicationMode;
  readonly encryption: readonly EncryptionModel[];
  readonly maxQuotaMB: number | null;
  readonly tier: StorageTier;
  readonly persistsAcrossSessions: boolean;
  readonly availableOffline: boolean;
  readonly supportsBlobs: boolean;
  readonly rlsProtected: boolean;
  readonly backupStrategy: string;
  readonly failoverTarget: string | null;
  readonly domains: readonly string[];
}

export const STORAGE_TOPOLOGY_REGISTRY: readonly StorageBackendEntry[] = [
  {
    backendId: "supabase-postgres", type: "supabase-db", displayName: "Primary Database",
    description: "Supabase PostgreSQL — 198 tables, all structured domain data",
    replicationMode: "cloud-primary", encryption: ["at-rest-aes256", "in-transit-tls"],
    maxQuotaMB: null, tier: "hot", persistsAcrossSessions: true, availableOffline: false,
    supportsBlobs: false, rlsProtected: true, backupStrategy: "point-in-time-recovery",
    failoverTarget: null, domains: ["platform", "business", "finance", "concierge", "ai", "admin", "security"]
  },
  {
    backendId: "supabase-storage-bucket", type: "supabase-storage", displayName: "File Storage (user-files)",
    description: "Supabase Storage private bucket for user documents, avatars, exports",
    replicationMode: "cloud-primary", encryption: ["at-rest-aes256", "in-transit-tls"],
    maxQuotaMB: 1024, tier: "warm", persistsAcrossSessions: true, availableOffline: false,
    supportsBlobs: true, rlsProtected: true, backupStrategy: "bucket-versioning",
    failoverTarget: null, domains: ["business", "finance", "concierge"]
  },
  {
    backendId: "indexeddb-cache", type: "indexeddb", displayName: "IndexedDB Cache",
    description: "Browser IndexedDB for offline-capable data caching and draft persistence",
    replicationMode: "local-first", encryption: ["none"],
    maxQuotaMB: 50, tier: "hot", persistsAcrossSessions: true, availableOffline: true,
    supportsBlobs: true, rlsProtected: false, backupStrategy: "sync-on-reconnect",
    failoverTarget: "supabase-postgres", domains: ["platform", "business"]
  },
  {
    backendId: "localstorage-prefs", type: "localstorage", displayName: "Local Preferences",
    description: "Browser localStorage for UI preferences, theme, sidebar state",
    replicationMode: "local-first", encryption: ["none"],
    maxQuotaMB: 5, tier: "hot", persistsAcrossSessions: true, availableOffline: true,
    supportsBlobs: false, rlsProtected: false, backupStrategy: "none",
    failoverTarget: null, domains: ["platform"]
  },
  {
    backendId: "sessionstorage-temp", type: "sessionstorage", displayName: "Session Temp",
    description: "Browser sessionStorage for tab-scoped ephemeral state",
    replicationMode: "ephemeral", encryption: ["none"],
    maxQuotaMB: 5, tier: "hot", persistsAcrossSessions: false, availableOffline: true,
    supportsBlobs: false, rlsProtected: false, backupStrategy: "none",
    failoverTarget: null, domains: ["platform"]
  },
  {
    backendId: "nova-fs-virtual", type: "nova-fs", displayName: "NovaFS Virtual Filesystem",
    description: "Simulated file system overlay for OS-like file browsing experience",
    replicationMode: "write-through", encryption: ["in-transit-tls"],
    maxQuotaMB: 500, tier: "warm", persistsAcrossSessions: true, availableOffline: false,
    supportsBlobs: true, rlsProtected: true, backupStrategy: "supabase-mirror",
    failoverTarget: "supabase-storage-bucket", domains: ["platform", "business"]
  },
  {
    backendId: "memory-runtime", type: "memory", displayName: "In-Memory Runtime",
    description: "Volatile in-memory stores for event bus, service state, and caches",
    replicationMode: "ephemeral", encryption: ["none"],
    maxQuotaMB: 100, tier: "hot", persistsAcrossSessions: false, availableOffline: true,
    supportsBlobs: false, rlsProtected: false, backupStrategy: "none",
    failoverTarget: null, domains: ["platform", "ai"]
  },
] as const;

// ── Query Functions ────────────────────────────────────────────

export function getBackendById(id: string): StorageBackendEntry | undefined {
  return STORAGE_TOPOLOGY_REGISTRY.find((b) => b.backendId === id);
}

export function getBackendsByType(type: StorageBackendType): readonly StorageBackendEntry[] {
  return STORAGE_TOPOLOGY_REGISTRY.filter((b) => b.type === type);
}

export function getOfflineCapableBackends(): readonly StorageBackendEntry[] {
  return STORAGE_TOPOLOGY_REGISTRY.filter((b) => b.availableOffline);
}

export function getRLSProtectedBackends(): readonly StorageBackendEntry[] {
  return STORAGE_TOPOLOGY_REGISTRY.filter((b) => b.rlsProtected);
}

export function getBackendsByDomain(domain: string): readonly StorageBackendEntry[] {
  return STORAGE_TOPOLOGY_REGISTRY.filter((b) => b.domains.includes(domain));
}

export function getPersistentBackends(): readonly StorageBackendEntry[] {
  return STORAGE_TOPOLOGY_REGISTRY.filter((b) => b.persistsAcrossSessions);
}

export function getFailoverChain(backendId: string): readonly StorageBackendEntry[] {
  const chain: StorageBackendEntry[] = [];
  let current = getBackendById(backendId);
  while (current) {
    chain.push(current);
    current = current.failoverTarget ? getBackendById(current.failoverTarget) : undefined;
  }
  return chain;
}
