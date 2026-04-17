// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Service: Sync Topology Registry
// Layer 3 · cross-device, offline-online state convergence
// Companion doc: docs/architecture/SYNC_AND_CONTINUITY_MODEL.md
// ═══════════════════════════════════════════════════════════════

export type SyncDirection = "client-to-cloud" | "cloud-to-client" | "bidirectional";
export type SyncTransport = "supabase-realtime" | "supabase-rest" | "sync-edge-fn" | "ws-multiplex";
export type SyncConflictStrategy =
  | "last-write-wins"
  | "owner-wins"
  | "server-wins"
  | "client-wins"
  | "merge-crdt"
  | "manual-resolve";

export type DegradedNetworkPolicy =
  | "queue-and-retry"
  | "drop-stale"
  | "block-writes"
  | "fall-back-to-cache";

export interface SyncNamespaceEntry {
  readonly namespace: string;             // logical sync namespace (e.g. "files", "approvals")
  readonly displayName: string;
  readonly direction: SyncDirection;
  readonly transport: SyncTransport;
  readonly tables: readonly string[];     // db tables / storage buckets in scope
  readonly conflictStrategy: SyncConflictStrategy;
  readonly degradedPolicy: DegradedNetworkPolicy;
  readonly maxOfflineQueueItems: number;
  readonly replayWindowDays: number;
  readonly tierAvailability: { readonly web: boolean; readonly desktop: boolean; readonly appliance: boolean; readonly mobile: boolean };
  readonly killSwitchTarget: string | null;
}

export const SYNC_TOPOLOGY_REGISTRY: readonly SyncNamespaceEntry[] = [
  {
    namespace: "files",
    displayName: "Files & Storage",
    direction: "bidirectional",
    transport: "supabase-realtime",
    tables: ["file_metadata", "user-files (storage)"],
    conflictStrategy: "server-wins",
    degradedPolicy: "queue-and-retry",
    maxOfflineQueueItems: 256,
    replayWindowDays: 14,
    tierAvailability: { web: true, desktop: true, appliance: true, mobile: true },
    killSwitchTarget: "sync-kill",
  },
  {
    namespace: "approvals",
    displayName: "Approval Queue",
    direction: "bidirectional",
    transport: "supabase-realtime",
    tables: ["ai_workforce_approval_queue", "ai_workforce_recommendations"],
    conflictStrategy: "server-wins",
    degradedPolicy: "block-writes",
    maxOfflineQueueItems: 16,
    replayWindowDays: 30,
    tierAvailability: { web: true, desktop: true, appliance: true, mobile: true },
    killSwitchTarget: null,
  },
  {
    namespace: "boardroom",
    displayName: "Boardroom Items",
    direction: "bidirectional",
    transport: "supabase-realtime",
    tables: ["boardroom_items", "boardroom_decisions", "boardroom_minutes"],
    conflictStrategy: "owner-wins",
    degradedPolicy: "queue-and-retry",
    maxOfflineQueueItems: 64,
    replayWindowDays: 30,
    tierAvailability: { web: true, desktop: true, appliance: true, mobile: true },
    killSwitchTarget: null,
  },
  {
    namespace: "advisor.memory",
    displayName: "Advisor Memory",
    direction: "bidirectional",
    transport: "sync-edge-fn",
    tables: ["advisor_memories", "advisor_board_memory", "advisor_knowledge"],
    conflictStrategy: "merge-crdt",
    degradedPolicy: "queue-and-retry",
    maxOfflineQueueItems: 128,
    replayWindowDays: 14,
    tierAvailability: { web: true, desktop: true, appliance: true, mobile: true },
    killSwitchTarget: "advisor-kill",
  },
  {
    namespace: "settings",
    displayName: "User Settings",
    direction: "bidirectional",
    transport: "supabase-rest",
    tables: ["user_settings", "user_preferences"],
    conflictStrategy: "last-write-wins",
    degradedPolicy: "queue-and-retry",
    maxOfflineQueueItems: 32,
    replayWindowDays: 7,
    tierAvailability: { web: true, desktop: true, appliance: true, mobile: true },
    killSwitchTarget: null,
  },
  {
    namespace: "notifications.delivery",
    displayName: "Notification Delivery",
    direction: "cloud-to-client",
    transport: "ws-multiplex",
    tables: ["notifications", "notification_deliveries"],
    conflictStrategy: "server-wins",
    degradedPolicy: "drop-stale",
    maxOfflineQueueItems: 64,
    replayWindowDays: 3,
    tierAvailability: { web: true, desktop: true, appliance: true, mobile: true },
    killSwitchTarget: "notifications-kill",
  },
  {
    namespace: "audit",
    displayName: "Audit & Receipts",
    direction: "client-to-cloud",
    transport: "supabase-rest",
    tables: ["admin_action_audit", "ai_inference_receipts", "flagship_loop_completions"],
    conflictStrategy: "server-wins",
    degradedPolicy: "queue-and-retry",
    maxOfflineQueueItems: 1024,
    replayWindowDays: 90,
    tierAvailability: { web: true, desktop: true, appliance: true, mobile: true },
    killSwitchTarget: null,
  },
  {
    namespace: "device.heartbeat",
    displayName: "Device Heartbeat",
    direction: "client-to-cloud",
    transport: "ws-multiplex",
    tables: ["runtime_agents"],
    conflictStrategy: "server-wins",
    degradedPolicy: "drop-stale",
    maxOfflineQueueItems: 4,
    replayWindowDays: 1,
    tierAvailability: { web: false, desktop: true, appliance: true, mobile: true },
    killSwitchTarget: null,
  },
] as const;

export function getSyncNamespace(namespace: string): SyncNamespaceEntry | undefined {
  return SYNC_TOPOLOGY_REGISTRY.find((s) => s.namespace === namespace);
}

export function syncNamespacesForTier(tier: "web" | "desktop" | "appliance" | "mobile"): readonly SyncNamespaceEntry[] {
  return SYNC_TOPOLOGY_REGISTRY.filter((s) => s.tierAvailability[tier]);
}

export type SyncState =
  | "synced"
  | "syncing"
  | "queued"
  | "conflict"
  | "degraded"
  | "offline"
  | "error";

export const SYNC_STATE_TRANSITIONS: ReadonlyArray<{ from: SyncState; to: SyncState; reason: string }> = [
  { from: "synced",   to: "syncing",  reason: "local change pending" },
  { from: "syncing",  to: "synced",   reason: "delivered + ack" },
  { from: "syncing",  to: "conflict", reason: "concurrent server change" },
  { from: "syncing",  to: "queued",   reason: "transient failure" },
  { from: "queued",   to: "syncing",  reason: "retry attempt" },
  { from: "queued",   to: "degraded", reason: "queue threshold exceeded" },
  { from: "degraded", to: "syncing",  reason: "network restored" },
  { from: "syncing",  to: "offline",  reason: "network lost" },
  { from: "offline",  to: "queued",   reason: "buffer for later" },
  { from: "offline",  to: "syncing",  reason: "network restored" },
  { from: "conflict", to: "synced",   reason: "resolution applied" },
  { from: "conflict", to: "error",    reason: "resolution rejected" },
] as const;

export function canSyncTransition(from: SyncState, to: SyncState): boolean {
  return SYNC_STATE_TRANSITIONS.some((t) => t.from === from && t.to === to);
}
