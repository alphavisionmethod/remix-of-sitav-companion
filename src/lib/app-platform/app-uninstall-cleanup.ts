// ═══════════════════════════════════════════════════════════════
// SITA OS — App Uninstall Cleanup
// Handles data purging, crash state removal, and permission
// revocation on app removal.
// ═══════════════════════════════════════════════════════════════

import { declineAppRecovery } from "./app-recovery-manager";
import { clearAppEntries, recordRevocation, getEffectiveGrants } from "./app-permission-ledger";
import type { TrustTier } from "./app-trust-tier-policy";

export interface CleanupResult {
  appId: string;
  localStorageKeysRemoved: number;
  crashStateCleared: boolean;
  permissionsRevoked: number;
  permissionLedgerEntriesRemoved: number;
  completedAt: string;
}

/** Remove all localStorage keys for an app matching the `sita-app-state:{appId}:*` pattern. */
export function cleanupAppData(appId: string): number {
  const prefix = `sita-app-state:${appId}:`;
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  for (const key of keysToRemove) {
    localStorage.removeItem(key);
  }
  return keysToRemove.length;
}

/** Clear crash/recovery state for an app. */
export function cleanupCrashState(appId: string): boolean {
  try {
    declineAppRecovery(appId);
    return true;
  } catch {
    return false;
  }
}

/** Revoke all active permissions and log to the permission ledger. */
export function cleanupPermissions(appId: string, trustTier: TrustTier): number {
  const grants = getEffectiveGrants(appId);
  let revoked = 0;
  for (const [key, isGranted] of Object.entries(grants)) {
    if (isGranted) {
      recordRevocation(appId, key, "system:uninstall", trustTier, "App uninstalled");
      revoked++;
    }
  }
  return revoked;
}

/** Full cleanup sequence for app removal. */
export function performFullCleanup(appId: string, trustTier: TrustTier): CleanupResult {
  const localStorageKeysRemoved = cleanupAppData(appId);
  const crashStateCleared = cleanupCrashState(appId);
  const permissionsRevoked = cleanupPermissions(appId, trustTier);
  const permissionLedgerEntriesRemoved = clearAppEntries(appId);

  return {
    appId,
    localStorageKeysRemoved,
    crashStateCleared,
    permissionsRevoked,
    permissionLedgerEntriesRemoved,
    completedAt: new Date().toISOString(),
  };
}