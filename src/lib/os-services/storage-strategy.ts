// ═══════════════════════════════════════════════════════════════
// SITA OS — Storage Strategy
// 4-class storage model with integrity and durability rules
// ═══════════════════════════════════════════════════════════════

export type StorageClass = 'system-config' | 'state' | 'secrets' | 'telemetry';
export type Durability = 'persistent' | 'session' | 'ephemeral';
export type Integrity = 'signed' | 'checksummed' | 'encrypted' | 'plain';

export interface StorageEntry {
  key: string;
  storageClass: StorageClass;
  value: unknown;
  durability: Durability;
  integrity: Integrity;
  version: number;
  updatedAt: number;
  checksum?: string;
  expiresAt?: number;
  owner?: string;
}

export interface StorageClassPolicy {
  storageClass: StorageClass;
  durability: Durability;
  integrity: Integrity;
  allowMutation: boolean;
  requiresAuth: boolean;
  maxEntries: number;
  maxSizeBytes: number;
  auditWrites: boolean;
  description: string;
}

const POLICIES: Record<StorageClass, StorageClassPolicy> = {
  'system-config': {
    storageClass: 'system-config', durability: 'persistent', integrity: 'signed',
    allowMutation: false, requiresAuth: true, maxEntries: 500, maxSizeBytes: 1_048_576,
    auditWrites: true, description: 'Immutable system configuration — service configs, policy defaults, hardware profiles, startup units, feature flags',
  },
  'state': {
    storageClass: 'state', durability: 'persistent', integrity: 'checksummed',
    allowMutation: true, requiresAuth: false, maxEntries: 10_000, maxSizeBytes: 10_485_760,
    auditWrites: false, description: 'Mutable runtime state — network state, paired devices, onboarding progress, update jobs, crash counters',
  },
  'secrets': {
    storageClass: 'secrets', durability: 'persistent', integrity: 'encrypted',
    allowMutation: true, requiresAuth: true, maxEntries: 200, maxSizeBytes: 524_288,
    auditWrites: true, description: 'Encrypted secret store — API keys, tokens, certificates, credentials',
  },
  'telemetry': {
    storageClass: 'telemetry', durability: 'session', integrity: 'plain',
    allowMutation: false, requiresAuth: false, maxEntries: 50_000, maxSizeBytes: 52_428_800,
    auditWrites: false, description: 'Append-only telemetry — structured logs, crash dumps, metrics, traces, audit chain',
  },
};

function simpleChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  }
  return hash.toString(16);
}

class StorageStrategyManager {
  private stores = new Map<StorageClass, Map<string, StorageEntry>>();

  constructor() {
    (Object.keys(POLICIES) as StorageClass[]).forEach(sc => this.stores.set(sc, new Map()));
  }

  getPolicy(sc: StorageClass): StorageClassPolicy { return POLICIES[sc]; }
  allPolicies(): StorageClassPolicy[] { return Object.values(POLICIES); }

  write(sc: StorageClass, key: string, value: unknown, owner?: string): boolean {
    const policy = POLICIES[sc];
    const store = this.stores.get(sc)!;

    if (!policy.allowMutation && store.has(key)) return false;
    if (store.size >= policy.maxEntries) return false;

    const serialized = JSON.stringify(value);
    const entry: StorageEntry = {
      key, storageClass: sc, value, durability: policy.durability,
      integrity: policy.integrity, version: (store.get(key)?.version ?? 0) + 1,
      updatedAt: Date.now(), checksum: simpleChecksum(serialized), owner,
    };
    store.set(key, entry);
    return true;
  }

  read(sc: StorageClass, key: string): StorageEntry | undefined {
    return this.stores.get(sc)?.get(key);
  }

  delete(sc: StorageClass, key: string): boolean {
    return this.stores.get(sc)?.delete(key) ?? false;
  }

  listKeys(sc: StorageClass): string[] {
    return [...(this.stores.get(sc)?.keys() ?? [])];
  }

  stats(): Record<StorageClass, { entries: number; policy: string }> {
    const result = {} as Record<StorageClass, { entries: number; policy: string }>;
    for (const [sc, store] of this.stores) {
      result[sc] = { entries: store.size, policy: POLICIES[sc].description };
    }
    return result;
  }

  /** Verify integrity of an entry */
  verify(entry: StorageEntry): boolean {
    if (!entry.checksum) return true;
    return simpleChecksum(JSON.stringify(entry.value)) === entry.checksum;
  }
}

export const storageStrategy = new StorageStrategyManager();
