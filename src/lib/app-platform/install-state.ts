// ═══════════════════════════════════════════════════════════════
// SITA OS — Install state derivation helpers
// ═══════════════════════════════════════════════════════════════

export type InstallStatus =
  | "not_installed"
  | "installing"
  | "installed"
  | "updating"
  | "update_available"
  | "uninstalling"
  | "blocked";

export interface InstalledAppRow {
  app_id: string;
  install_status: InstallStatus;
  enabled: boolean;
  pinned: boolean;
  favorite: boolean;
  pinned_order: number;
  launch_count: number;
  last_launched_at: string | null;
  version_installed: string | null;
}

export interface CatalogAppRow {
  app_id: string;
  latest_version: string;
  installability: "installable" | "preinstalled" | "unavailable" | "desktop_only";
}

export function deriveInstallStatus(
  catalog: CatalogAppRow,
  installed: InstalledAppRow | undefined,
): InstallStatus {
  if (!installed) {
    return catalog.installability === "preinstalled" ? "installed" : "not_installed";
  }
  if (
    installed.install_status === "installed" &&
    installed.version_installed &&
    installed.version_installed !== catalog.latest_version
  ) {
    return "update_available";
  }
  return installed.install_status;
}

export function isLaunchable(status: InstallStatus): boolean {
  return status === "installed" || status === "update_available" || status === "updating";
}
