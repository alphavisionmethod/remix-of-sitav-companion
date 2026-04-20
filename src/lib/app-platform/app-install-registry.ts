// ═══════════════════════════════════════════════════════════════
// SITA OS — App Install Registry
// Unified query surface wrapping catalog, install, and recovery
// services into a single source of truth.
// ═══════════════════════════════════════════════════════════════

import { catalogService, type CatalogApp } from "@/lib/services/app-store/catalog.service";
import { installService, type InstalledAppRow } from "@/lib/services/app-store/install.service";
import { getRecoveryOffer, listPendingRecoveries, type AppRecoveryOffer } from "./app-recovery-manager";
import { getEffectiveGrants } from "./app-permission-ledger";
import type { InstallStatus } from "./install-state";

export interface InstallRecord {
  appId: string;
  slug: string;
  name: string;
  publisher: string | null;
  appType: string;
  trustLevel: string;
  installStatus: InstallStatus;
  versionInstalled: string | null;
  latestVersion: string;
  installedAt: string | null;
  lastLaunchedAt: string | null;
  launchCount: number;
  enabled: boolean;
  pinned: boolean;
  favorite: boolean;
  permissions: Record<string, boolean>;
  recoveryOffer: AppRecoveryOffer | null;
  sourceChannel: string | null;
}

export interface AppHealthSummary {
  appId: string;
  installStatus: InstallStatus;
  crashCount: number;
  hasRecoveryOffer: boolean;
  canRestore: boolean;
  lastLaunchedAt: string | null;
  isUpdateAvailable: boolean;
  isEnabled: boolean;
}

export interface SystemHealthSummary {
  totalInstalled: number;
  totalCrashed: number;
  totalRecovering: number;
  totalBlocked: number;
  totalUpdateAvailable: number;
  totalEnabled: number;
  totalDisabled: number;
}

/** Build a full install record by merging catalog, install, and recovery data. */
function mergeRecord(
  catalog: CatalogApp,
  installed: InstalledAppRow | undefined,
): InstallRecord {
  const recovery = getRecoveryOffer(catalog.app_id);
  const effectivePerms = getEffectiveGrants(catalog.app_id);

  const installStatus: InstallStatus = installed
    ? (installed.install_status as InstallStatus)
    : catalog.installability === "preinstalled"
      ? "installed"
      : "not_installed";

  return {
    appId: catalog.app_id,
    slug: catalog.slug,
    name: catalog.name,
    publisher: catalog.publisher,
    appType: catalog.app_type,
    trustLevel: catalog.trust_level,
    installStatus,
    versionInstalled: installed?.version_installed ?? null,
    latestVersion: catalog.latest_version,
    installedAt: installed?.installed_at ?? null,
    lastLaunchedAt: installed?.last_launched_at ?? null,
    launchCount: installed?.launch_count ?? 0,
    enabled: installed?.enabled ?? true,
    pinned: installed?.pinned ?? false,
    favorite: installed?.favorite ?? false,
    permissions: effectivePerms,
    recoveryOffer: recovery,
    sourceChannel: installed?.source_channel ?? null,
  };
}

export const appInstallRegistry = {
  /** Get a full install record for a single app by ID. */
  async getInstallRecord(appId: string, userId: string): Promise<InstallRecord | null> {
    const [catalogApps, installedApps] = await Promise.all([
      catalogService.list({ search: appId, limit: 100 }),
      installService.listForUser(userId),
    ]);
    const catalog = catalogApps.find(a => a.app_id === appId);
    if (!catalog) return null;
    const installed = installedApps.find(a => a.app_id === appId);
    return mergeRecord(catalog, installed);
  },

  /** List all installed apps with health and recovery status. */
  async listInstalled(userId: string): Promise<InstallRecord[]> {
    const [catalogApps, installedApps] = await Promise.all([
      catalogService.list({}),
      installService.listForUser(userId),
    ]);

    const catalogMap = new Map(catalogApps.map(a => [a.app_id, a]));
    const records: InstallRecord[] = [];

    for (const inst of installedApps) {
      const catalog = catalogMap.get(inst.app_id);
      if (catalog) {
        records.push(mergeRecord(catalog, inst));
      }
    }

    // Add preinstalled apps not in installed list
    for (const cat of catalogApps) {
      if (cat.installability === "preinstalled" && !installedApps.some(i => i.app_id === cat.app_id)) {
        records.push(mergeRecord(cat, undefined));
      }
    }

    return records;
  },

  /** Get health summary for a single app. */
  getAppHealth(appId: string, record: InstallRecord): AppHealthSummary {
    const recovery = record.recoveryOffer;
    return {
      appId,
      installStatus: record.installStatus,
      crashCount: recovery?.crashCount ?? 0,
      hasRecoveryOffer: !!recovery,
      canRestore: recovery?.canRestore ?? false,
      lastLaunchedAt: record.lastLaunchedAt,
      isUpdateAvailable: record.versionInstalled !== null && record.versionInstalled !== record.latestVersion,
      isEnabled: record.enabled,
    };
  },

  /** Get system-wide health summary. */
  getSystemHealth(records: InstallRecord[]): SystemHealthSummary {
    const recoveries = listPendingRecoveries();
    const crashedIds = new Set(recoveries.map(r => r.appId));

    return {
      totalInstalled: records.filter(r => r.installStatus === "installed" || r.installStatus === "update_available").length,
      totalCrashed: records.filter(r => crashedIds.has(r.appId)).length,
      totalRecovering: records.filter(r => r.installStatus === "recovering").length,
      totalBlocked: records.filter(r => r.installStatus === "blocked").length,
      totalUpdateAvailable: records.filter(r => r.versionInstalled !== null && r.versionInstalled !== r.latestVersion).length,
      totalEnabled: records.filter(r => r.enabled).length,
      totalDisabled: records.filter(r => !r.enabled).length,
    };
  },
};