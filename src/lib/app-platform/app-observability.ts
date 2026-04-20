// ═══════════════════════════════════════════════════════════════
// SITA OS — App Observability
// Per-app and system-wide health metrics and diagnostics.
// ═══════════════════════════════════════════════════════════════

import { appInstallRegistry, type InstallRecord, type AppHealthSummary, type SystemHealthSummary } from "./app-install-registry";
import { appLifecycleManager, type LifecycleReceipt } from "./app-lifecycle-manager";
import { getHistory, type PermissionLedgerEntry } from "./app-permission-ledger";
import { getRecoveryOffer } from "./app-recovery-manager";

export interface AppMetrics {
  appId: string;
  launchCount: number;
  crashCount: number;
  lastLaunchedAt: string | null;
  installedAt: string | null;
  timeSinceInstallMs: number | null;
  permissionGrantCount: number;
  permissionDenyCount: number;
  lifecycleEventCount: number;
  currentState: string;
  hasRecoveryOffer: boolean;
}

export interface AppDiagnostics {
  appId: string;
  metrics: AppMetrics;
  recentLifecycleEvents: LifecycleReceipt[];
  permissionHistory: PermissionLedgerEntry[];
  installRecord: InstallRecord | null;
  healthSummary: AppHealthSummary | null;
  collectedAt: string;
}

/** Get metrics for a single app. */
export function getAppMetrics(appId: string, record: InstallRecord | null): AppMetrics {
  const receipts = appLifecycleManager.getReceipts(appId);
  const permHistory = getHistory(appId);
  const recovery = getRecoveryOffer(appId);
  const { state } = appLifecycleManager.getLifecycleStatus(appId);

  return {
    appId,
    launchCount: record?.launchCount ?? 0,
    crashCount: recovery?.crashCount ?? 0,
    lastLaunchedAt: record?.lastLaunchedAt ?? null,
    installedAt: record?.installedAt ?? null,
    timeSinceInstallMs: record?.installedAt
      ? Date.now() - new Date(record.installedAt).getTime()
      : null,
    permissionGrantCount: permHistory.filter(e => e.action === "grant").length,
    permissionDenyCount: permHistory.filter(e => e.action === "deny").length,
    lifecycleEventCount: receipts.length,
    currentState: state,
    hasRecoveryOffer: !!recovery,
  };
}

/** Get system-wide health summary. */
export function getSystemHealth(records: InstallRecord[]): SystemHealthSummary {
  return appInstallRegistry.getSystemHealth(records);
}

/** Export full diagnostics for a single app. */
export function exportDiagnostics(appId: string, record: InstallRecord | null): AppDiagnostics {
  const metrics = getAppMetrics(appId, record);
  const recentLifecycleEvents = appLifecycleManager.getReceipts(appId).slice(-50);
  const permissionHistory = getHistory(appId);
  const healthSummary = record
    ? appInstallRegistry.getAppHealth(appId, record)
    : null;

  return {
    appId,
    metrics,
    recentLifecycleEvents,
    permissionHistory,
    installRecord: record,
    healthSummary,
    collectedAt: new Date().toISOString(),
  };
}