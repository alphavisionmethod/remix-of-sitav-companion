// ═══════════════════════════════════════════════════════════════
// SITA OS — Sync Object Model
// Versioned sync objects for the distributed sync ecosystem
// ═══════════════════════════════════════════════════════════════

/** All supported sync object types */
export type SyncObjectType =
  | "file" | "folder" | "setting" | "app_setting" | "app_state"
  | "session" | "window_layout" | "notification_state"
  | "device_preference" | "sync_policy_override"
  | "presence_state" | "clipboard_item" | "shared_item";

/** Encryption class determines how data is secured in transit/at rest */
export type EncryptionClass =
  | "standard"           // Server-visible, normal sync
  | "encrypted-at-rest"  // Encrypted on server storage only
  | "e2ee"               // End-to-end encrypted, server sees ciphertext only
  | "device-bound"       // Encrypted with device-specific key, not portable
  | "non-syncable";      // Never leaves the device

/** Sync object lifecycle state */
export type SyncObjectState =
  | "active" | "tombstoned" | "pending-create" | "pending-update"
  | "pending-delete" | "conflict" | "archived";

/** Content reference — either inline data or blob pointer */
export interface ContentRef {
  type: "inline" | "blob";
  /** For inline: the actual data; for blob: null */
  inlineData?: unknown;
  /** Blob storage key */
  blobRef?: string;
  /** Content size in bytes */
  sizeBytes: number;
  /** SHA-256 content hash for integrity */
  contentHash: string;
  /** MIME type if applicable */
  mimeType?: string;
  /** Compression algorithm used */
  compression?: "none" | "gzip" | "brotli" | "lz4";
}

/** Version vector entry for conflict detection */
export interface VersionVectorEntry {
  deviceId: string;
  counter: number;
  timestamp: string;
}

/** The core versioned sync object — every synced entity in the ecosystem */
export interface SyncObject<T = unknown> {
  /** Stable globally unique object ID */
  id: string;
  /** Owner user ID */
  userId: string;
  /** Object type classification */
  type: SyncObjectType;
  /** Hierarchical namespace (e.g., "files.documents", "settings.ui.theme") */
  namespace: string;
  /** Monotonically increasing version number */
  version: number;
  /** Version vector for distributed conflict detection */
  versionVector: VersionVectorEntry[];
  /** ISO timestamp of last modification */
  updatedAt: string;
  /** ISO timestamp of creation */
  createdAt: string;
  /** Device that originated this version */
  originDeviceId: string;
  /** Whether this object has been soft-deleted */
  deleted: boolean;
  /** Tombstone timestamp if deleted */
  tombstonedAt?: string;
  /** Encryption class governing this object */
  encryptionClass: EncryptionClass;
  /** Object lifecycle state */
  state: SyncObjectState;
  /** Arbitrary metadata (tags, labels, app-specific) */
  metadata: Record<string, unknown>;
  /** Content reference — inline data or blob pointer */
  contentRef?: ContentRef;
  /** Typed payload for structured objects (settings, state, etc.) */
  payload?: T;
  /** Parent object ID for hierarchical structures (folders) */
  parentId?: string;
  /** Content hash of the full object for integrity verification */
  objectHash: string;
  /** Conflict parent version if this was created from conflict resolution */
  conflictParentVersion?: number;
  /** ACL / sharing permissions if shared */
  permissions?: SyncObjectPermissions;
}

/** Permissions model for shared objects */
export interface SyncObjectPermissions {
  owner: string;
  readers: string[];
  writers: string[];
  publicRead: boolean;
  publicWrite: boolean;
  shareLink?: string;
  expiresAt?: string;
}

/** Sync object change event emitted by the sync daemon */
export interface SyncChangeEvent {
  changeId: string;
  objectId: string;
  userId: string;
  changeType: "create" | "update" | "delete" | "move" | "rename" | "conflict-resolved";
  fromVersion: number;
  toVersion: number;
  originDeviceId: string;
  namespace: string;
  timestamp: string;
  /** Delta reference if available */
  deltaRef?: string;
  /** Full content reference if delta not available */
  fullRef?: string;
}

/** Checkpoint for resumable sync */
export interface SyncCheckpoint {
  userId: string;
  deviceId: string;
  lastChangeId: string;
  lastVersion: number;
  namespace?: string;
  updatedAt: string;
}

// ─── Factory & Helpers ────────────────────────────────────────

let _idCounter = 0;

/** Generate a unique sync object ID */
export function generateSyncId(): string {
  _idCounter++;
  return `sobj_${Date.now()}_${_idCounter}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Compute a simple hash for an object (SHA-256 placeholder using string hash) */
export function computeObjectHash(obj: Record<string, unknown>): string {
  const str = JSON.stringify(obj, Object.keys(obj).sort());
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return `h_${Math.abs(hash).toString(16).padStart(8, "0")}`;
}

/** Create a new sync object with defaults */
export function createSyncObject<T = unknown>(
  params: Pick<SyncObject<T>, "userId" | "type" | "namespace"> &
    Partial<SyncObject<T>> & { deviceId: string }
): SyncObject<T> {
  const now = new Date().toISOString();
  const id = params.id ?? generateSyncId();
  const obj: SyncObject<T> = {
    id,
    userId: params.userId,
    type: params.type,
    namespace: params.namespace,
    version: params.version ?? 1,
    versionVector: params.versionVector ?? [
      { deviceId: params.deviceId, counter: 1, timestamp: now },
    ],
    updatedAt: now,
    createdAt: params.createdAt ?? now,
    originDeviceId: params.deviceId,
    deleted: false,
    encryptionClass: params.encryptionClass ?? "standard",
    state: params.state ?? "active",
    metadata: params.metadata ?? {},
    payload: params.payload,
    contentRef: params.contentRef,
    parentId: params.parentId,
    objectHash: "",
    permissions: params.permissions,
  };
  obj.objectHash = computeObjectHash(obj as unknown as Record<string, unknown>);
  return obj;
}

/** Apply a tombstone to a sync object */
export function tombstoneSyncObject<T>(obj: SyncObject<T>, deviceId: string): SyncObject<T> {
  const now = new Date().toISOString();
  return {
    ...obj,
    deleted: true,
    tombstonedAt: now,
    state: "tombstoned",
    version: obj.version + 1,
    updatedAt: now,
    originDeviceId: deviceId,
    versionVector: incrementVersionVector(obj.versionVector, deviceId),
    objectHash: computeObjectHash({ ...obj, deleted: true } as unknown as Record<string, unknown>),
  };
}

/** Increment the version vector for a specific device */
export function incrementVersionVector(
  vector: VersionVectorEntry[],
  deviceId: string
): VersionVectorEntry[] {
  const now = new Date().toISOString();
  const existing = vector.find((v) => v.deviceId === deviceId);
  if (existing) {
    return vector.map((v) =>
      v.deviceId === deviceId
        ? { ...v, counter: v.counter + 1, timestamp: now }
        : v
    );
  }
  return [...vector, { deviceId, counter: 1, timestamp: now }];
}

/** Compare two version vectors: -1 = a < b, 0 = concurrent, 1 = a > b */
export function compareVersionVectors(
  a: VersionVectorEntry[],
  b: VersionVectorEntry[]
): -1 | 0 | 1 {
  const aMap = new Map(a.map((v) => [v.deviceId, v.counter]));
  const bMap = new Map(b.map((v) => [v.deviceId, v.counter]));
  const allDevices = new Set([...aMap.keys(), ...bMap.keys()]);

  let aGreater = false;
  let bGreater = false;

  for (const dev of allDevices) {
    const ac = aMap.get(dev) ?? 0;
    const bc = bMap.get(dev) ?? 0;
    if (ac > bc) aGreater = true;
    if (bc > ac) bGreater = true;
  }

  if (aGreater && !bGreater) return 1;
  if (bGreater && !aGreater) return -1;
  return 0; // concurrent — conflict
}

/** Check if an object is a tombstone past the retention period */
export function isTombstoneExpired(obj: SyncObject, retentionMs: number = 30 * 24 * 60 * 60 * 1000): boolean {
  if (!obj.tombstonedAt) return false;
  return Date.now() - new Date(obj.tombstonedAt).getTime() > retentionMs;
}

/** Type guard for sync object types */
export function isSyncObjectType(type: string): type is SyncObjectType {
  return [
    "file", "folder", "setting", "app_setting", "app_state",
    "session", "window_layout", "notification_state",
    "device_preference", "sync_policy_override",
    "presence_state", "clipboard_item", "shared_item",
  ].includes(type);
}
