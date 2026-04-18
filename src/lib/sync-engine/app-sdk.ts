// ═══════════════════════════════════════════════════════════════
// SITA OS — App Sync SDK
// Developer API for apps to integrate with the sync engine
// ═══════════════════════════════════════════════════════════════

import { syncd } from "./syncd";
import { appStateSyncAdapter, type AppSyncManifest } from "./adapters/app-state-adapter";
import { conflictResolver, type AppMergeHandler } from "./conflict-resolver";
import type { SyncObject, SyncChangeEvent } from "./sync-object-model";
import type { ConflictStrategy } from "./sync-namespaces";

/** SDK registration result */
export interface SyncSDKRegistration {
  appId: string;
  namespaces: string[];
  registeredAt: string;
  status: "active" | "suspended" | "error";
}

/** Sync status for UI hooks */
export interface AppSyncStatus {
  appId: string;
  isSyncing: boolean;
  lastSyncAt: string | null;
  pendingChanges: number;
  conflicts: number;
  objectCount: number;
  totalSizeBytes: number;
}

/** SDK interface for app developers */
class SyncAppSDK {
  private registrations = new Map<string, SyncSDKRegistration>();
  private changeListeners = new Map<string, Array<(event: SyncChangeEvent) => void>>();

  /** Register an app for sync using its manifest */
  register(manifest: AppSyncManifest): SyncSDKRegistration {
    appStateSyncAdapter.registerApp(manifest);

    if (manifest.supportsCustomMerge) {
      // Apps can register custom merge later via registerMergeHandler
    }

    const reg: SyncSDKRegistration = {
      appId: manifest.appId,
      namespaces: manifest.namespaces.map(ns => `app.${manifest.appId}.${ns.suffix}`),
      registeredAt: new Date().toISOString(),
      status: "active",
    };

    this.registrations.set(manifest.appId, reg);

    // Wire up change notifications
    const unsubscribe = syncd.onSyncEvent((event) => {
      if (event.namespace.startsWith(`app.${manifest.appId}.`)) {
        const listeners = this.changeListeners.get(manifest.appId) ?? [];
        for (const listener of listeners) listener(event);
      }
    });

    return reg;
  }

  /** Unregister an app */
  unregister(appId: string): void {
    appStateSyncAdapter.unregisterApp(appId);
    this.registrations.delete(appId);
    this.changeListeners.delete(appId);
  }

  /** Save app state to sync */
  saveState(appId: string, key: string, value: unknown): string | null {
    return appStateSyncAdapter.pushState(appId, key, value);
  }

  /** Save app setting to sync */
  saveSetting(appId: string, key: string, value: unknown): string | null {
    return appStateSyncAdapter.pushSetting(appId, key, value);
  }

  /** Get synced state */
  getState(appId: string, key: string): unknown {
    return appStateSyncAdapter.getState(appId, key);
  }

  /** Get all synced state for an app */
  getAllState(appId: string): Record<string, unknown> {
    const entries = appStateSyncAdapter.getAppStates(appId);
    const result: Record<string, unknown> = {};
    for (const entry of entries) result[entry.stateKey] = entry.value;
    return result;
  }

  /** Register a custom merge handler for conflict resolution */
  registerMergeHandler(appId: string, handler: AppMergeHandler): void {
    conflictResolver.registerAppMergeHandler(appId, handler);
  }

  /** Subscribe to sync changes for an app */
  onChange(appId: string, handler: (event: SyncChangeEvent) => void): () => void {
    if (!this.changeListeners.has(appId)) this.changeListeners.set(appId, []);
    this.changeListeners.get(appId)!.push(handler);
    return () => {
      const listeners = this.changeListeners.get(appId) ?? [];
      this.changeListeners.set(appId, listeners.filter(l => l !== handler));
    };
  }

  /** Get sync status for UI display */
  getSyncStatus(appId: string): AppSyncStatus {
    const states = appStateSyncAdapter.getAppStates(appId);
    const objects = syncd.queryObjects({ namespacePrefix: `app.${appId}.`, deleted: false });
    const conflicts = conflictResolver.getPendingConflicts().filter(c => c.namespace.startsWith(`app.${appId}.`));

    return {
      appId,
      isSyncing: syncd.getStatus().pendingPush > 0,
      lastSyncAt: syncd.getStatus().lastSyncAt,
      pendingChanges: syncd.getPushQueue().filter(j => j.namespace.startsWith(`app.${appId}.`)).length,
      conflicts: conflicts.length,
      objectCount: objects.length,
      totalSizeBytes: appStateSyncAdapter.getAppSyncSize(appId),
    };
  }

  /** Check if an app is registered */
  isRegistered(appId: string): boolean {
    return this.registrations.has(appId);
  }

  /** Get all registrations */
  getRegistrations(): SyncSDKRegistration[] {
    return Array.from(this.registrations.values());
  }
}

/** Singleton App Sync SDK */
export const syncAppSDK = new SyncAppSDK();
