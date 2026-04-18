// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Fallbacks
// Graceful degradation for each desktop-only capability
// ═══════════════════════════════════════════════════════════════

import { isElectronRuntime, hasBridgeMethod } from "./desktop-runtime-detection";

export type FallbackStrategy = "web-api" | "no-op" | "cloud-alternative" | "ui-degraded" | "download-blob";

export interface FallbackDefinition {
  capabilityId: string;
  bridgeMethod: string;
  strategy: FallbackStrategy;
  description: string;
  implementation: string;
}

export const DESKTOP_FALLBACKS: readonly FallbackDefinition[] = [
  // ── Filesystem ─────────────────────────────────────────────
  { capabilityId: "fs.read", bridgeMethod: "readFile", strategy: "web-api", description: "Use <input type='file'> element for file selection", implementation: "FileReader API with drag-and-drop support" },
  { capabilityId: "fs.write", bridgeMethod: "saveFile", strategy: "download-blob", description: "Create Blob and trigger download via anchor tag", implementation: "URL.createObjectURL + a.download" },
  { capabilityId: "fs.backup.export", bridgeMethod: "exportBackup", strategy: "download-blob", description: "Serialize state to JSON blob and download", implementation: "JSON.stringify + Blob download" },
  { capabilityId: "fs.backup.import", bridgeMethod: "importBackup", strategy: "web-api", description: "Upload backup via file input", implementation: "FileReader API" },
  { capabilityId: "fs.backup.auto", bridgeMethod: "autoBackup", strategy: "cloud-alternative", description: "Rely on cloud persistence instead of local auto-backup", implementation: "Supabase auto-sync" },
  { capabilityId: "fs.backup.list", bridgeMethod: "listBackups", strategy: "no-op", description: "Return empty array on web — no local backups available", implementation: "Return []" },

  // ── System ─────────────────────────────────────────────────
  { capabilityId: "system.info", bridgeMethod: "getSystemInfo", strategy: "web-api", description: "Partial system info from navigator APIs", implementation: "navigator.userAgent + navigator.hardwareConcurrency + navigator.deviceMemory" },
  { capabilityId: "system.version", bridgeMethod: "getAppVersion", strategy: "web-api", description: "Return build-time version from Vite env", implementation: "import.meta.env.VITE_APP_VERSION || 'web'" },
  { capabilityId: "system.platform", bridgeMethod: "platform", strategy: "web-api", description: "Use navigator.platform for basic platform detection", implementation: "navigator.platform" },

  // ── Window ─────────────────────────────────────────────────
  { capabilityId: "window.control", bridgeMethod: "windowControl", strategy: "no-op", description: "Web cannot control browser window chrome", implementation: "No-op function" },

  // ── Update ─────────────────────────────────────────────────
  { capabilityId: "update.check", bridgeMethod: "checkForUpdates", strategy: "no-op", description: "Web auto-deploys via CDN; no update check needed", implementation: "Return null" },
  { capabilityId: "update.download", bridgeMethod: "downloadUpdate", strategy: "no-op", description: "Not applicable for web", implementation: "Return null" },
  { capabilityId: "update.install", bridgeMethod: "installUpdate", strategy: "no-op", description: "Not applicable for web", implementation: "No-op" },
  { capabilityId: "update.status", bridgeMethod: "getUpdateStatus", strategy: "no-op", description: "Not applicable for web", implementation: "Return null" },
  { capabilityId: "update.events", bridgeMethod: "onUpdateStatus", strategy: "no-op", description: "Not applicable for web", implementation: "No-op, return no-op cleanup" },

  // ── Notification ───────────────────────────────────────────
  { capabilityId: "notification.send", bridgeMethod: "sendNotification", strategy: "web-api", description: "Use Web Notification API with permission request", implementation: "new Notification(title, { body })" },

  // ── Navigation ─────────────────────────────────────────────
  { capabilityId: "nav.deeplink", bridgeMethod: "onDeepLink", strategy: "no-op", description: "Web uses URL routing natively — no deep link handler needed", implementation: "No-op, return no-op cleanup" },
  { capabilityId: "nav.menu", bridgeMethod: "onMenuAction", strategy: "no-op", description: "Web has no native menu bar", implementation: "No-op, return no-op cleanup" },
  { capabilityId: "nav.navigate", bridgeMethod: "onNavigate", strategy: "no-op", description: "Web uses React Router directly", implementation: "No-op, return no-op cleanup" },

  // ── Diagnostics ────────────────────────────────────────────
  { capabilityId: "diag.crash.list", bridgeMethod: "getCrashReports", strategy: "no-op", description: "No local crash reports on web", implementation: "Return null" },
  { capabilityId: "diag.crash.clear", bridgeMethod: "clearCrashReports", strategy: "no-op", description: "Nothing to clear on web", implementation: "No-op" },
  { capabilityId: "diag.error.report", bridgeMethod: "reportRendererError", strategy: "web-api", description: "Log to console and error tracking service", implementation: "console.error + optional Sentry/LogRocket" },
] as const;

/**
 * Execute a desktop capability with automatic fallback.
 * If running in Electron and bridge method exists, calls bridge.
 * Otherwise, returns null (caller should use web fallback).
 */
export async function withDesktopFallback<T>(
  bridgeMethod: string,
  electronCall: () => Promise<T> | T,
  webFallback: () => Promise<T> | T
): Promise<T> {
  if (isElectronRuntime() && hasBridgeMethod(bridgeMethod)) {
    return electronCall();
  }
  return webFallback();
}

/** Get fallback definition for a capability */
export function getFallbackForCapability(capabilityId: string): FallbackDefinition | undefined {
  return DESKTOP_FALLBACKS.find((f) => f.capabilityId === capabilityId);
}

/** Get all capabilities using a specific fallback strategy */
export function getCapabilitiesByFallbackStrategy(strategy: FallbackStrategy): FallbackDefinition[] {
  return DESKTOP_FALLBACKS.filter((f) => f.strategy === strategy);
}
