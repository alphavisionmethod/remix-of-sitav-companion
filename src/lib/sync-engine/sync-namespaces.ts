// ═══════════════════════════════════════════════════════════════
// SITA OS — Sync Namespace Registry
// Organized, policy-driven namespace model for all synced data
// ═══════════════════════════════════════════════════════════════

import type { EncryptionClass, SyncObjectType } from "./sync-object-model";

/** Conflict resolution strategy for a namespace */
export type ConflictStrategy =
  | "last-write-wins"
  | "merge-by-key"
  | "text-merge"
  | "manual"
  | "app-defined";

/** Sync priority determines scheduling order */
export type SyncPriority = "critical" | "high" | "medium" | "low" | "background";

/** Namespace definition */
export interface SyncNamespace {
  /** Dot-separated namespace path (e.g., "files.documents") */
  id: string;
  /** Human-readable label */
  displayName: string;
  /** Description of what this namespace contains */
  description: string;
  /** Which object types this namespace accepts */
  allowedTypes: SyncObjectType[];
  /** Default encryption class for objects in this namespace */
  defaultEncryptionClass: EncryptionClass;
  /** Conflict resolution strategy */
  conflictStrategy: ConflictStrategy;
  /** Sync priority */
  priority: SyncPriority;
  /** Whether this namespace supports selective sync (can be excluded per-device) */
  selectiveSyncAllowed: boolean;
  /** Whether on-demand file hydration is supported */
  onDemandHydration: boolean;
  /** Whether this namespace is enabled by default on new devices */
  enabledByDefault: boolean;
  /** Maximum object size in bytes (0 = unlimited) */
  maxObjectSizeBytes: number;
  /** Retention period for tombstones in ms */
  tombstoneRetentionMs: number;
  /** Whether real-time sync is enabled (vs background-only) */
  realtimeEnabled: boolean;
  /** App ID if this is an app-specific namespace */
  appId?: string;
  /** Policy flags */
  policyFlags: NamespacePolicyFlags;
}

/** Policy flags that restrict namespace behavior */
export interface NamespacePolicyFlags {
  /** Can be synced on metered connections */
  allowOnMetered: boolean;
  /** Can be synced on untrusted networks */
  allowOnUntrustedNetwork: boolean;
  /** Requires VPN for sync */
  requireVpn: boolean;
  /** Can be synced to web clients */
  allowWebClient: boolean;
  /** Can be synced to mobile clients */
  allowMobileClient: boolean;
  /** Admin can force-disable this namespace */
  adminOverridable: boolean;
  /** Guest users can access this namespace */
  allowGuest: boolean;
}

const defaultPolicyFlags: NamespacePolicyFlags = {
  allowOnMetered: true,
  allowOnUntrustedNetwork: true,
  requireVpn: false,
  allowWebClient: true,
  allowMobileClient: true,
  adminOverridable: true,
  allowGuest: false,
};

/** Built-in namespace definitions */
const BUILTIN_NAMESPACES: SyncNamespace[] = [
  // ─── Files ──────────────────────────────────
  {
    id: "files.documents",
    displayName: "Documents",
    description: "User documents, PDFs, spreadsheets, presentations",
    allowedTypes: ["file", "folder"],
    defaultEncryptionClass: "standard",
    conflictStrategy: "manual",
    priority: "medium",
    selectiveSyncAllowed: true,
    onDemandHydration: true,
    enabledByDefault: true,
    maxObjectSizeBytes: 5 * 1024 * 1024 * 1024, // 5 GB
    tombstoneRetentionMs: 30 * 24 * 60 * 60 * 1000,
    realtimeEnabled: true,
    policyFlags: { ...defaultPolicyFlags },
  },
  {
    id: "files.photos",
    displayName: "Photos",
    description: "User photos and images",
    allowedTypes: ["file", "folder"],
    defaultEncryptionClass: "standard",
    conflictStrategy: "last-write-wins",
    priority: "low",
    selectiveSyncAllowed: true,
    onDemandHydration: true,
    enabledByDefault: true,
    maxObjectSizeBytes: 2 * 1024 * 1024 * 1024,
    tombstoneRetentionMs: 60 * 24 * 60 * 60 * 1000,
    realtimeEnabled: false,
    policyFlags: { ...defaultPolicyFlags, allowOnMetered: false },
  },
  {
    id: "files.media",
    displayName: "Media",
    description: "Videos, audio, and large media files",
    allowedTypes: ["file", "folder"],
    defaultEncryptionClass: "standard",
    conflictStrategy: "last-write-wins",
    priority: "background",
    selectiveSyncAllowed: true,
    onDemandHydration: true,
    enabledByDefault: false,
    maxObjectSizeBytes: 10 * 1024 * 1024 * 1024,
    tombstoneRetentionMs: 30 * 24 * 60 * 60 * 1000,
    realtimeEnabled: false,
    policyFlags: { ...defaultPolicyFlags, allowOnMetered: false },
  },
  // ─── Settings ───────────────────────────────
  {
    id: "settings.ui.theme",
    displayName: "Theme & Appearance",
    description: "Visual theme, colors, wallpaper references, display preferences",
    allowedTypes: ["setting"],
    defaultEncryptionClass: "standard",
    conflictStrategy: "merge-by-key",
    priority: "high",
    selectiveSyncAllowed: false,
    onDemandHydration: false,
    enabledByDefault: true,
    maxObjectSizeBytes: 1024 * 1024,
    tombstoneRetentionMs: 7 * 24 * 60 * 60 * 1000,
    realtimeEnabled: true,
    policyFlags: { ...defaultPolicyFlags },
  },
  {
    id: "settings.network",
    displayName: "Network Settings",
    description: "Wi-Fi metadata, VPN preferences, proxy configuration",
    allowedTypes: ["setting"],
    defaultEncryptionClass: "encrypted-at-rest",
    conflictStrategy: "merge-by-key",
    priority: "medium",
    selectiveSyncAllowed: true,
    onDemandHydration: false,
    enabledByDefault: true,
    maxObjectSizeBytes: 512 * 1024,
    tombstoneRetentionMs: 7 * 24 * 60 * 60 * 1000,
    realtimeEnabled: true,
    policyFlags: { ...defaultPolicyFlags, allowOnUntrustedNetwork: false },
  },
  {
    id: "settings.notifications",
    displayName: "Notification Preferences",
    description: "Per-app notification rules, quiet hours, Calm schedules",
    allowedTypes: ["setting", "notification_state"],
    defaultEncryptionClass: "standard",
    conflictStrategy: "merge-by-key",
    priority: "high",
    selectiveSyncAllowed: false,
    onDemandHydration: false,
    enabledByDefault: true,
    maxObjectSizeBytes: 256 * 1024,
    tombstoneRetentionMs: 7 * 24 * 60 * 60 * 1000,
    realtimeEnabled: true,
    policyFlags: { ...defaultPolicyFlags },
  },
  {
    id: "settings.accessibility",
    displayName: "Accessibility",
    description: "Screen reader, font size, contrast, motion preferences",
    allowedTypes: ["setting"],
    defaultEncryptionClass: "standard",
    conflictStrategy: "merge-by-key",
    priority: "high",
    selectiveSyncAllowed: false,
    onDemandHydration: false,
    enabledByDefault: true,
    maxObjectSizeBytes: 128 * 1024,
    tombstoneRetentionMs: 7 * 24 * 60 * 60 * 1000,
    realtimeEnabled: true,
    policyFlags: { ...defaultPolicyFlags },
  },
  {
    id: "settings.input",
    displayName: "Language & Input",
    description: "Language, keyboard layouts, shortcuts, input methods",
    allowedTypes: ["setting"],
    defaultEncryptionClass: "standard",
    conflictStrategy: "merge-by-key",
    priority: "high",
    selectiveSyncAllowed: false,
    onDemandHydration: false,
    enabledByDefault: true,
    maxObjectSizeBytes: 256 * 1024,
    tombstoneRetentionMs: 7 * 24 * 60 * 60 * 1000,
    realtimeEnabled: true,
    policyFlags: { ...defaultPolicyFlags },
  },
  // ─── Session / Continuity ───────────────────
  {
    id: "session.desktop.workspace",
    displayName: "Desktop Workspace",
    description: "Open apps, window positions, workspace layouts",
    allowedTypes: ["session", "window_layout"],
    defaultEncryptionClass: "standard",
    conflictStrategy: "last-write-wins",
    priority: "critical",
    selectiveSyncAllowed: true,
    onDemandHydration: false,
    enabledByDefault: true,
    maxObjectSizeBytes: 2 * 1024 * 1024,
    tombstoneRetentionMs: 3 * 24 * 60 * 60 * 1000,
    realtimeEnabled: true,
    policyFlags: { ...defaultPolicyFlags, allowGuest: false },
  },
  {
    id: "session.browser.tabs",
    displayName: "Browser Tabs",
    description: "Open browser tabs, tab groups, history",
    allowedTypes: ["session"],
    defaultEncryptionClass: "standard",
    conflictStrategy: "last-write-wins",
    priority: "high",
    selectiveSyncAllowed: true,
    onDemandHydration: false,
    enabledByDefault: true,
    maxObjectSizeBytes: 1024 * 1024,
    tombstoneRetentionMs: 3 * 24 * 60 * 60 * 1000,
    realtimeEnabled: true,
    policyFlags: { ...defaultPolicyFlags },
  },
  // ─── Device ─────────────────────────────────
  {
    id: "device.preferences",
    displayName: "Device Preferences",
    description: "Per-device sync settings, power profile, network preferences",
    allowedTypes: ["device_preference", "sync_policy_override"],
    defaultEncryptionClass: "encrypted-at-rest",
    conflictStrategy: "last-write-wins",
    priority: "medium",
    selectiveSyncAllowed: false,
    onDemandHydration: false,
    enabledByDefault: true,
    maxObjectSizeBytes: 256 * 1024,
    tombstoneRetentionMs: 7 * 24 * 60 * 60 * 1000,
    realtimeEnabled: true,
    policyFlags: { ...defaultPolicyFlags },
  },
  {
    id: "device.presence",
    displayName: "Device Presence",
    description: "Online/offline status, active device, handoff targets",
    allowedTypes: ["presence_state"],
    defaultEncryptionClass: "standard",
    conflictStrategy: "last-write-wins",
    priority: "critical",
    selectiveSyncAllowed: false,
    onDemandHydration: false,
    enabledByDefault: true,
    maxObjectSizeBytes: 64 * 1024,
    tombstoneRetentionMs: 1 * 24 * 60 * 60 * 1000,
    realtimeEnabled: true,
    policyFlags: { ...defaultPolicyFlags },
  },
  // ─── System ─────────────────────────────────
  {
    id: "system.sync.preferences",
    displayName: "Sync Preferences",
    description: "Global sync behavior, bandwidth limits, schedule",
    allowedTypes: ["setting", "sync_policy_override"],
    defaultEncryptionClass: "standard",
    conflictStrategy: "last-write-wins",
    priority: "high",
    selectiveSyncAllowed: false,
    onDemandHydration: false,
    enabledByDefault: true,
    maxObjectSizeBytes: 128 * 1024,
    tombstoneRetentionMs: 7 * 24 * 60 * 60 * 1000,
    realtimeEnabled: true,
    policyFlags: { ...defaultPolicyFlags },
  },
  // ─── Apps (template) ────────────────────────
  {
    id: "app.com.nova.notes.state",
    displayName: "Nova Notes State",
    description: "Notes app state, recent files, editor position",
    allowedTypes: ["app_state", "app_setting"],
    defaultEncryptionClass: "standard",
    conflictStrategy: "text-merge",
    priority: "medium",
    selectiveSyncAllowed: true,
    onDemandHydration: false,
    enabledByDefault: true,
    maxObjectSizeBytes: 50 * 1024 * 1024,
    tombstoneRetentionMs: 14 * 24 * 60 * 60 * 1000,
    realtimeEnabled: true,
    appId: "com.nova.notes",
    policyFlags: { ...defaultPolicyFlags },
  },
];

// ─── Namespace Registry ───────────────────────────────────────

class NamespaceRegistry {
  private namespaces = new Map<string, SyncNamespace>();
  private listeners: Array<(ns: SyncNamespace, action: "register" | "update" | "remove") => void> = [];

  constructor() {
    for (const ns of BUILTIN_NAMESPACES) {
      this.namespaces.set(ns.id, ns);
    }
  }

  /** Get a namespace by ID */
  get(id: string): SyncNamespace | undefined {
    return this.namespaces.get(id);
  }

  /** Get all registered namespaces */
  getAll(): SyncNamespace[] {
    return Array.from(this.namespaces.values());
  }

  /** Get namespaces matching a prefix (e.g., "files.*", "settings.*") */
  getByPrefix(prefix: string): SyncNamespace[] {
    return this.getAll().filter((ns) => ns.id.startsWith(prefix));
  }

  /** Get namespaces for a specific app */
  getByApp(appId: string): SyncNamespace[] {
    return this.getAll().filter((ns) => ns.appId === appId);
  }

  /** Register a new namespace (e.g., from app manifest) */
  register(ns: SyncNamespace): void {
    this.namespaces.set(ns.id, ns);
    this.emit(ns, "register");
  }

  /** Register an app namespace from an app manifest */
  registerAppNamespace(appId: string, config: {
    namespaceSuffix: string;
    displayName: string;
    conflictStrategy?: ConflictStrategy;
    encryptionClass?: EncryptionClass;
    allowedTypes?: SyncObjectType[];
    maxSizeBytes?: number;
  }): SyncNamespace {
    const ns: SyncNamespace = {
      id: `app.${appId}.${config.namespaceSuffix}`,
      displayName: config.displayName,
      description: `App data for ${appId}`,
      allowedTypes: config.allowedTypes ?? ["app_state", "app_setting"],
      defaultEncryptionClass: config.encryptionClass ?? "standard",
      conflictStrategy: config.conflictStrategy ?? "last-write-wins",
      priority: "medium",
      selectiveSyncAllowed: true,
      onDemandHydration: false,
      enabledByDefault: true,
      maxObjectSizeBytes: config.maxSizeBytes ?? 50 * 1024 * 1024,
      tombstoneRetentionMs: 14 * 24 * 60 * 60 * 1000,
      realtimeEnabled: true,
      appId,
      policyFlags: { ...defaultPolicyFlags },
    };
    this.register(ns);
    return ns;
  }

  /** Update a namespace's configuration */
  update(id: string, patch: Partial<SyncNamespace>): boolean {
    const existing = this.namespaces.get(id);
    if (!existing) return false;
    const updated = { ...existing, ...patch, id: existing.id };
    this.namespaces.set(id, updated);
    this.emit(updated, "update");
    return true;
  }

  /** Remove a namespace */
  remove(id: string): boolean {
    const ns = this.namespaces.get(id);
    if (!ns) return false;
    this.namespaces.delete(id);
    this.emit(ns, "remove");
    return true;
  }

  /** Check if an object type is valid for a namespace */
  isTypeAllowed(namespaceId: string, type: string): boolean {
    const ns = this.namespaces.get(namespaceId);
    if (!ns) return false;
    return ns.allowedTypes.includes(type as any);
  }

  /** Get the conflict strategy for a namespace */
  getConflictStrategy(namespaceId: string): ConflictStrategy {
    return this.namespaces.get(namespaceId)?.conflictStrategy ?? "manual";
  }

  /** Get namespaces enabled by default */
  getDefaultEnabled(): SyncNamespace[] {
    return this.getAll().filter((ns) => ns.enabledByDefault);
  }

  /** Get namespaces that support selective sync */
  getSelectiveSyncable(): SyncNamespace[] {
    return this.getAll().filter((ns) => ns.selectiveSyncAllowed);
  }

  /** Subscribe to namespace changes */
  onChange(fn: (ns: SyncNamespace, action: "register" | "update" | "remove") => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private emit(ns: SyncNamespace, action: "register" | "update" | "remove") {
    for (const fn of this.listeners) fn(ns, action);
  }
}

/** Singleton namespace registry */
export const namespaceRegistry = new NamespaceRegistry();

export type { SyncNamespace, NamespacePolicyFlags };
