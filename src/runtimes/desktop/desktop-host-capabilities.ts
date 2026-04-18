// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Host Capabilities
// Maps every capability exposed by the Electron host
// ═══════════════════════════════════════════════════════════════

import { hasBridgeMethod } from "./desktop-runtime-detection";

export type CapabilityStatus = "available" | "unavailable" | "degraded" | "unknown";

export interface DesktopCapability {
  id: string;
  name: string;
  category: "filesystem" | "system" | "window" | "update" | "notification" | "navigation" | "diagnostics";
  bridgeMethod: string;
  description: string;
  webFallback: string | null;
  requiresPermission: boolean;
}

export const DESKTOP_CAPABILITIES: readonly DesktopCapability[] = [
  // ── Filesystem ─────────────────────────────────────────────
  { id: "fs.read", name: "Read File", category: "filesystem", bridgeMethod: "readFile", description: "Read files from user's local filesystem", webFallback: "File input element", requiresPermission: true },
  { id: "fs.write", name: "Save File", category: "filesystem", bridgeMethod: "saveFile", description: "Write files to user's local filesystem", webFallback: "Download blob", requiresPermission: true },
  { id: "fs.backup.export", name: "Export Backup", category: "filesystem", bridgeMethod: "exportBackup", description: "Export full application backup to disk", webFallback: null, requiresPermission: true },
  { id: "fs.backup.import", name: "Import Backup", category: "filesystem", bridgeMethod: "importBackup", description: "Import backup from disk", webFallback: null, requiresPermission: true },
  { id: "fs.backup.auto", name: "Auto Backup", category: "filesystem", bridgeMethod: "autoBackup", description: "Automatic scheduled backup to local disk", webFallback: null, requiresPermission: true },
  { id: "fs.backup.list", name: "List Backups", category: "filesystem", bridgeMethod: "listBackups", description: "List available local backups", webFallback: null, requiresPermission: false },

  // ── System ─────────────────────────────────────────────────
  { id: "system.info", name: "System Info", category: "system", bridgeMethod: "getSystemInfo", description: "OS platform, architecture, CPU, memory", webFallback: "navigator.userAgent + navigator.hardwareConcurrency", requiresPermission: false },
  { id: "system.version", name: "App Version", category: "system", bridgeMethod: "getAppVersion", description: "Current application version string", webFallback: "Build-time constant", requiresPermission: false },
  { id: "system.platform", name: "Platform ID", category: "system", bridgeMethod: "platform", description: "OS platform identifier", webFallback: "navigator.platform", requiresPermission: false },

  // ── Window ─────────────────────────────────────────────────
  { id: "window.control", name: "Window Control", category: "window", bridgeMethod: "windowControl", description: "Minimize, maximize, close, fullscreen, restore", webFallback: null, requiresPermission: false },

  // ── Update ─────────────────────────────────────────────────
  { id: "update.check", name: "Check Updates", category: "update", bridgeMethod: "checkForUpdates", description: "Check for application updates", webFallback: null, requiresPermission: false },
  { id: "update.download", name: "Download Update", category: "update", bridgeMethod: "downloadUpdate", description: "Download available update", webFallback: null, requiresPermission: false },
  { id: "update.install", name: "Install Update", category: "update", bridgeMethod: "installUpdate", description: "Install downloaded update and restart", webFallback: null, requiresPermission: false },
  { id: "update.status", name: "Update Status", category: "update", bridgeMethod: "getUpdateStatus", description: "Get current update status", webFallback: null, requiresPermission: false },
  { id: "update.events", name: "Update Events", category: "update", bridgeMethod: "onUpdateStatus", description: "Subscribe to update status changes", webFallback: null, requiresPermission: false },

  // ── Notification ───────────────────────────────────────────
  { id: "notification.send", name: "Native Notification", category: "notification", bridgeMethod: "sendNotification", description: "System-level notification with OS integration", webFallback: "Notification API", requiresPermission: false },

  // ── Navigation ─────────────────────────────────────────────
  { id: "nav.deeplink", name: "Deep Link", category: "navigation", bridgeMethod: "onDeepLink", description: "Receive custom protocol deep links", webFallback: null, requiresPermission: false },
  { id: "nav.menu", name: "Menu Actions", category: "navigation", bridgeMethod: "onMenuAction", description: "Receive native menu item actions", webFallback: null, requiresPermission: false },
  { id: "nav.navigate", name: "Host Navigation", category: "navigation", bridgeMethod: "onNavigate", description: "Receive navigation commands from host", webFallback: null, requiresPermission: false },

  // ── Diagnostics ────────────────────────────────────────────
  { id: "diag.crash.list", name: "List Crash Reports", category: "diagnostics", bridgeMethod: "getCrashReports", description: "Retrieve crash report history", webFallback: null, requiresPermission: false },
  { id: "diag.crash.clear", name: "Clear Crash Reports", category: "diagnostics", bridgeMethod: "clearCrashReports", description: "Clear stored crash reports", webFallback: null, requiresPermission: false },
  { id: "diag.error.report", name: "Report Error", category: "diagnostics", bridgeMethod: "reportRendererError", description: "Report renderer process error to main", webFallback: "console.error + error boundary", requiresPermission: false },
] as const;

/** Runtime probe: check which capabilities are actually available right now */
export function probeDesktopCapabilities(): Map<string, CapabilityStatus> {
  const result = new Map<string, CapabilityStatus>();
  for (const cap of DESKTOP_CAPABILITIES) {
    if (cap.bridgeMethod === "platform") {
      // Property, not method
      const bridge = typeof window !== "undefined" ? (window as unknown as Record<string, unknown>).electron : null;
      result.set(cap.id, bridge && typeof (bridge as Record<string, unknown>).platform === "string" ? "available" : "unavailable");
    } else {
      result.set(cap.id, hasBridgeMethod(cap.bridgeMethod) ? "available" : "unavailable");
    }
  }
  return result;
}

/** Get all capabilities by category */
export function getCapabilitiesByCategory(category: DesktopCapability["category"]): DesktopCapability[] {
  return DESKTOP_CAPABILITIES.filter((c) => c.category === category);
}

/** Get capabilities that have a web fallback */
export function getCapabilitiesWithWebFallback(): DesktopCapability[] {
  return DESKTOP_CAPABILITIES.filter((c) => c.webFallback !== null);
}

/** Get desktop-exclusive capabilities (no web fallback) */
export function getDesktopExclusiveCapabilities(): DesktopCapability[] {
  return DESKTOP_CAPABILITIES.filter((c) => c.webFallback === null);
}
