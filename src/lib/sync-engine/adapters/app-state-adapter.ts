// ═══════════════════════════════════════════════════════════════
// SITA OS — App State Sync Adapter
// Bridges app-specific state into the sync engine via SDK manifests
// ═══════════════════════════════════════════════════════════════

import { syncd } from "../syncd";
import type { ConflictStrategy } from "../sync-namespaces";
import { namespaceRegistry } from "../sync-namespaces";

/** App sync manifest declared by each app */
export interface AppSyncManifest {
  appId: string;
  displayName: string;
  namespaces: AppSyncNamespaceConfig[];
  conflictStrategy: ConflictStrategy;
  encryptionClass: "standard" | "encrypted-at-rest" | "e2ee";
  /** Maximum total sync payload size per app in bytes */
  maxPayloadBytes: number;
  /** Whether the app supports custom merge */
  supportsCustomMerge: boolean;
}

export interface AppSyncNamespaceConfig {
  suffix: string;
  displayName: string;
  objectTypes: ("app_state" | "app_setting")[];
}

/** App state entry managed by the adapter */
export interface AppStateEntry {
  appId: string;
  stateKey: string;
  value: unknown;
  syncObjectId: string;
  lastUpdatedAt: string;
}

class AppStateSyncAdapter {
  private registeredApps = new Map<string, AppSyncManifest>();
  private stateEntries = new Map<string, AppStateEntry>(); // "appId:key" -> entry
  private running = false;

  /** Start the adapter */
  start(): void {
    if (this.running) return;
    this.running = true;
    console.log("[AppStateSyncAdapter] Started");
  }

  /** Stop the adapter */
  stop(): void {
    this.running = false;
  }

  /** Register an app for sync */
  registerApp(manifest: AppSyncManifest): void {
    this.registeredApps.set(manifest.appId, manifest);

    // Register namespaces
    for (const nsCfg of manifest.namespaces) {
      namespaceRegistry.registerAppNamespace(manifest.appId, {
        namespaceSuffix: nsCfg.suffix,
        displayName: nsCfg.displayName,
        conflictStrategy: manifest.conflictStrategy,
        encryptionClass: manifest.encryptionClass,
        allowedTypes: nsCfg.objectTypes,
        maxSizeBytes: manifest.maxPayloadBytes,
      });
    }

    console.log(`[AppStateSyncAdapter] Registered app: ${manifest.appId}`);
  }

  /** Unregister an app */
  unregisterApp(appId: string): void {
    this.registeredApps.delete(appId);
    // Remove state entries
    for (const [key, entry] of this.stateEntries) {
      if (entry.appId === appId) {
        this.stateEntries.delete(key);
      }
    }
  }

  /** Push app state to sync */
  pushState(appId: string, stateKey: string, value: unknown): string | null {
    if (!this.running) return null;

    const manifest = this.registeredApps.get(appId);
    if (!manifest) {
      console.warn(`[AppStateSyncAdapter] App ${appId} not registered for sync`);
      return null;
    }

    const compositeKey = `${appId}:${stateKey}`;
    const existing = this.stateEntries.get(compositeKey);
    const namespace = `app.${appId}.state`;

    const obj = syncd.upsertObject({
      id: existing?.syncObjectId,
      type: "app_state",
      namespace,
      payload: { key: stateKey, value, appId },
      metadata: { appId, stateKey },
    });

    this.stateEntries.set(compositeKey, {
      appId,
      stateKey,
      value,
      syncObjectId: obj.id,
      lastUpdatedAt: new Date().toISOString(),
    });

    return obj.id;
  }

  /** Push app setting to sync */
  pushSetting(appId: string, settingKey: string, value: unknown): string | null {
    if (!this.running) return null;

    const manifest = this.registeredApps.get(appId);
    if (!manifest) return null;

    const compositeKey = `${appId}:setting:${settingKey}`;
    const existing = this.stateEntries.get(compositeKey);
    const namespace = `app.${appId}.settings`;

    const obj = syncd.upsertObject({
      id: existing?.syncObjectId,
      type: "app_setting",
      namespace,
      payload: { key: settingKey, value, appId },
      metadata: { appId, settingKey },
    });

    this.stateEntries.set(compositeKey, {
      appId,
      stateKey: `setting:${settingKey}`,
      value,
      syncObjectId: obj.id,
      lastUpdatedAt: new Date().toISOString(),
    });

    return obj.id;
  }

  /** Get synced state for an app */
  getState(appId: string, stateKey: string): unknown {
    return this.stateEntries.get(`${appId}:${stateKey}`)?.value;
  }

  /** Get all state entries for an app */
  getAppStates(appId: string): AppStateEntry[] {
    return Array.from(this.stateEntries.values()).filter(e => e.appId === appId);
  }

  /** Get all registered apps */
  getRegisteredApps(): AppSyncManifest[] {
    return Array.from(this.registeredApps.values());
  }

  /** Check if an app is registered */
  isRegistered(appId: string): boolean {
    return this.registeredApps.has(appId);
  }

  /** Apply a remote state change to the local app */
  applyRemoteState(appId: string, stateKey: string, value: unknown): boolean {
    const manifest = this.registeredApps.get(appId);
    if (!manifest) return false;

    const compositeKey = `${appId}:${stateKey}`;
    const existing = this.stateEntries.get(compositeKey);
    if (existing) {
      existing.value = value;
      existing.lastUpdatedAt = new Date().toISOString();
    }
    return true;
  }

  /** Get total sync payload size for an app */
  getAppSyncSize(appId: string): number {
    let total = 0;
    for (const entry of this.stateEntries.values()) {
      if (entry.appId === appId) {
        total += JSON.stringify(entry.value).length;
      }
    }
    return total;
  }
}

/** Singleton app state sync adapter */
export const appStateSyncAdapter = new AppStateSyncAdapter();
