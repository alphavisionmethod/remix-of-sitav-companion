// ═══════════════════════════════════════════════════════════════
// SITA OS — Settings Sync Adapter
// Per-setting syncability, merge strategies, policy locks
// ═══════════════════════════════════════════════════════════════

import { syncd } from "../syncd";

/** Merge strategy for individual settings */
export type SettingMergeStrategy = "last-write-wins" | "local-override" | "remote-override" | "merge-by-key";

/** Per-setting sync configuration */
export interface SettingSyncConfig {
  key: string;
  displayName: string;
  category: string;
  /** Whether this setting is syncable */
  syncable: boolean;
  /** Merge strategy when conflicts occur */
  mergeStrategy: SettingMergeStrategy;
  /** Whether admin policy can lock this setting */
  policyLockable: boolean;
  /** Whether this setting is currently policy-locked */
  policyLocked: boolean;
  /** Whether user has a local override active */
  localOverride: boolean;
  /** Namespace for syncing */
  namespace: string;
}

/** Settings snapshot for sync */
export interface SettingsSnapshot {
  theme: string;
  colorScheme: "light" | "dark" | "auto";
  wallpaperRef?: string;
  language: string;
  locale: string;
  fontSize: number;
  fontFamily: string;
  shortcuts: Record<string, string>;
  calmSchedule: CalmSchedule;
  notificationPrefs: NotificationPrefs;
  accessibilityPrefs: AccessibilityPrefs;
  appPrefs: Record<string, Record<string, unknown>>;
}

export interface CalmSchedule {
  enabled: boolean;
  startTime: string; // HH:MM
  endTime: string;
  days: number[]; // 0=Sun, 6=Sat
  allowedApps: string[];
  allowAlarms: boolean;
}

export interface NotificationPrefs {
  globalEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  badgesEnabled: boolean;
  previewsEnabled: boolean;
  perApp: Record<string, { enabled: boolean; sound: boolean; banner: boolean }>;
}

export interface AccessibilityPrefs {
  screenReaderEnabled: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  colorFilters: "none" | "grayscale" | "protanopia" | "deuteranopia" | "tritanopia";
  stickyKeys: boolean;
  cursorSize: "normal" | "large" | "extra-large";
}

// ─── Default Sync Configs ─────────────────────────────────────

const DEFAULT_SETTING_CONFIGS: SettingSyncConfig[] = [
  { key: "theme", displayName: "Theme", category: "Appearance", syncable: true, mergeStrategy: "last-write-wins",
    policyLockable: true, policyLocked: false, localOverride: false, namespace: "settings.ui.theme" },
  { key: "colorScheme", displayName: "Color Scheme", category: "Appearance", syncable: true, mergeStrategy: "last-write-wins",
    policyLockable: true, policyLocked: false, localOverride: false, namespace: "settings.ui.theme" },
  { key: "wallpaperRef", displayName: "Wallpaper", category: "Appearance", syncable: true, mergeStrategy: "last-write-wins",
    policyLockable: false, policyLocked: false, localOverride: false, namespace: "settings.ui.theme" },
  { key: "language", displayName: "Language", category: "Language & Input", syncable: true, mergeStrategy: "last-write-wins",
    policyLockable: true, policyLocked: false, localOverride: false, namespace: "settings.input" },
  { key: "shortcuts", displayName: "Keyboard Shortcuts", category: "Language & Input", syncable: true, mergeStrategy: "merge-by-key",
    policyLockable: false, policyLocked: false, localOverride: false, namespace: "settings.input" },
  { key: "calmSchedule", displayName: "Calm Schedule", category: "Notifications", syncable: true, mergeStrategy: "last-write-wins",
    policyLockable: true, policyLocked: false, localOverride: false, namespace: "settings.notifications" },
  { key: "notificationPrefs", displayName: "Notification Preferences", category: "Notifications", syncable: true, mergeStrategy: "merge-by-key",
    policyLockable: true, policyLocked: false, localOverride: false, namespace: "settings.notifications" },
  { key: "accessibilityPrefs", displayName: "Accessibility", category: "Accessibility", syncable: true, mergeStrategy: "last-write-wins",
    policyLockable: false, policyLocked: false, localOverride: false, namespace: "settings.accessibility" },
  { key: "appPrefs", displayName: "App Preferences", category: "Apps", syncable: true, mergeStrategy: "merge-by-key",
    policyLockable: false, policyLocked: false, localOverride: false, namespace: "settings.ui.theme" },
];

class SettingsSyncAdapter {
  private configs = new Map<string, SettingSyncConfig>();
  private currentSnapshot: Partial<SettingsSnapshot> = {};
  private objectIds = new Map<string, string>(); // setting key -> sync object ID
  private running = false;

  constructor() {
    for (const cfg of DEFAULT_SETTING_CONFIGS) {
      this.configs.set(cfg.key, cfg);
    }
  }

  /** Start syncing settings */
  start(): void {
    if (this.running) return;
    this.running = true;
    console.log("[SettingsSyncAdapter] Started");
  }

  /** Stop syncing settings */
  stop(): void {
    this.running = false;
  }

  /** Push a setting change to sync */
  pushSettingChange(key: string, value: unknown): void {
    if (!this.running) return;

    const config = this.configs.get(key);
    if (!config || !config.syncable || config.policyLocked) return;
    if (config.localOverride) return;

    (this.currentSnapshot as any)[key] = value;

    const existingId = this.objectIds.get(key);
    const obj = syncd.upsertObject({
      id: existingId,
      type: "setting",
      namespace: config.namespace,
      payload: { key, value, category: config.category },
      metadata: { settingKey: key, mergeStrategy: config.mergeStrategy },
    });

    if (!existingId) {
      this.objectIds.set(key, obj.id);
    }
  }

  /** Apply a remote setting change locally */
  applyRemoteChange(key: string, value: unknown): boolean {
    const config = this.configs.get(key);
    if (!config) return false;
    if (config.localOverride || config.policyLocked) return false;

    (this.currentSnapshot as any)[key] = value;
    return true;
  }

  /** Set a local override for a setting */
  setLocalOverride(key: string, enabled: boolean): void {
    const config = this.configs.get(key);
    if (config) config.localOverride = enabled;
  }

  /** Set a policy lock for a setting */
  setPolicyLock(key: string, locked: boolean): void {
    const config = this.configs.get(key);
    if (config && config.policyLockable) config.policyLocked = locked;
  }

  /** Get sync configuration for a setting */
  getConfig(key: string): SettingSyncConfig | undefined {
    return this.configs.get(key);
  }

  /** Get all sync configurations */
  getAllConfigs(): SettingSyncConfig[] {
    return Array.from(this.configs.values());
  }

  /** Get syncable settings only */
  getSyncableConfigs(): SettingSyncConfig[] {
    return this.getAllConfigs().filter(c => c.syncable && !c.policyLocked);
  }

  /** Export all settings as a portable snapshot */
  exportSnapshot(): Partial<SettingsSnapshot> {
    return { ...this.currentSnapshot };
  }

  /** Import settings from a snapshot */
  importSnapshot(snapshot: Partial<SettingsSnapshot>): number {
    let imported = 0;
    for (const [key, value] of Object.entries(snapshot)) {
      const config = this.configs.get(key);
      if (config && config.syncable && !config.policyLocked) {
        (this.currentSnapshot as any)[key] = value;
        this.pushSettingChange(key, value);
        imported++;
      }
    }
    return imported;
  }

  /** Register a custom setting for sync */
  registerSetting(config: SettingSyncConfig): void {
    this.configs.set(config.key, config);
  }

  /** Get the current snapshot */
  getCurrentSnapshot(): Partial<SettingsSnapshot> {
    return { ...this.currentSnapshot };
  }
}

/** Singleton settings sync adapter */
export const settingsSyncAdapter = new SettingsSyncAdapter();
