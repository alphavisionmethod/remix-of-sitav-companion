// ═══════════════════════════════════════════════════════════════
// SITA OS — Electron Bridge Contract
// Authoritative typed bridge surface matching preload.cjs exactly
// 13 method groups across 6 categories
// ═══════════════════════════════════════════════════════════════

import type { SystemInfo, DeepLinkPayload, UpdateStatus } from "@/packages/contracts/native/electron-ipc";

// ── Bridge Method Groups ─────────────────────────────────────

export interface ElectronBridgeSurface {
  // ── 1. Platform Property ────────────────────────────────────
  readonly platform: string;

  // ── 2. System Info ──────────────────────────────────────────
  getSystemInfo: () => Promise<SystemInfo>;
  getAppVersion: () => Promise<string>;

  // ── 3. Window Control ───────────────────────────────────────
  windowControl: (action: "minimize" | "maximize" | "close" | "fullscreen" | "restore") => void;

  // ── 4. Notifications ────────────────────────────────────────
  sendNotification: (title: string, body: string) => void;

  // ── 5. Deep Links ───────────────────────────────────────────
  onDeepLink: (callback: (payload: DeepLinkPayload) => void) => () => void;

  // ── 6. Menu Actions ─────────────────────────────────────────
  onMenuAction: (callback: (action: string) => void) => () => void;

  // ── 7. Navigation ───────────────────────────────────────────
  onNavigate: (callback: (path: string) => void) => () => void;

  // ── 8. Auto-Updater ─────────────────────────────────────────
  checkForUpdates: () => Promise<UpdateStatus>;
  downloadUpdate: () => Promise<{ success: boolean; reason?: string }>;
  installUpdate: () => void;
  getUpdateStatus: () => Promise<UpdateStatusDetail>;
  onUpdateStatus: (callback: (status: UpdateStatusEvent) => void) => () => void;

  // ── 9. File System Bridge ───────────────────────────────────
  exportBackup: (data: unknown) => Promise<{ success: boolean; path?: string }>;
  importBackup: () => Promise<{ success: boolean; data?: unknown }>;
  saveFile: (options: SaveFileOptions) => Promise<{ success: boolean; path?: string }>;
  readFile: (options: ReadFileOptions) => Promise<{ success: boolean; data?: unknown }>;
  autoBackup: (data: unknown) => Promise<{ success: boolean }>;
  listBackups: () => Promise<BackupEntry[]>;

  // ── 10. Crash Reporter ──────────────────────────────────────
  getCrashReports: () => Promise<CrashReport[]>;
  clearCrashReports: () => Promise<void>;
  reportRendererError: (error: RendererError) => void;
}

// ── Supporting Types ─────────────────────────────────────────

export interface UpdateStatusDetail {
  checking: boolean;
  available: boolean;
  downloaded: boolean;
  error: string | null;
  version: string | null;
}

export interface UpdateStatusEvent {
  checking: boolean;
  available: boolean;
  downloaded: boolean;
  progress: { percent: number; bytesPerSecond: number; transferred: number; total: number } | null;
  error: string | null;
  info: { version: string; releaseDate?: string; releaseNotes?: string } | null;
  currentVersion: string;
}

export interface SaveFileOptions {
  data: string | ArrayBuffer;
  filename?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  defaultPath?: string;
}

export interface ReadFileOptions {
  filters?: Array<{ name: string; extensions: string[] }>;
  defaultPath?: string;
}

export interface BackupEntry {
  id: string;
  filename: string;
  path: string;
  size: number;
  createdAt: string;
  checksum?: string;
}

export interface CrashReport {
  id: string;
  date: string;
  type: string;
  message: string;
  stack?: string;
}

export interface RendererError {
  message: string;
  stack?: string;
  url?: string;
  componentStack?: string;
}

// ── Bridge Method Registry ───────────────────────────────────

export type BridgeMethodCategory = "system" | "window" | "notification" | "navigation" | "update" | "filesystem" | "diagnostics";

export interface BridgeMethodEntry {
  method: string;
  category: BridgeMethodCategory;
  direction: "renderer-to-host" | "host-to-renderer" | "bidirectional";
  returnsPromise: boolean;
  isListener: boolean;
  description: string;
}

export const BRIDGE_METHOD_REGISTRY: readonly BridgeMethodEntry[] = [
  { method: "platform", category: "system", direction: "renderer-to-host", returnsPromise: false, isListener: false, description: "OS platform identifier (property)" },
  { method: "getSystemInfo", category: "system", direction: "renderer-to-host", returnsPromise: true, isListener: false, description: "Retrieve full system info" },
  { method: "getAppVersion", category: "system", direction: "renderer-to-host", returnsPromise: true, isListener: false, description: "Get application version" },
  { method: "windowControl", category: "window", direction: "renderer-to-host", returnsPromise: false, isListener: false, description: "Control window state" },
  { method: "sendNotification", category: "notification", direction: "renderer-to-host", returnsPromise: false, isListener: false, description: "Send native notification" },
  { method: "onDeepLink", category: "navigation", direction: "host-to-renderer", returnsPromise: false, isListener: true, description: "Listen for deep link events" },
  { method: "onMenuAction", category: "navigation", direction: "host-to-renderer", returnsPromise: false, isListener: true, description: "Listen for menu action events" },
  { method: "onNavigate", category: "navigation", direction: "host-to-renderer", returnsPromise: false, isListener: true, description: "Listen for navigation commands" },
  { method: "checkForUpdates", category: "update", direction: "renderer-to-host", returnsPromise: true, isListener: false, description: "Check for available updates" },
  { method: "downloadUpdate", category: "update", direction: "renderer-to-host", returnsPromise: true, isListener: false, description: "Download available update" },
  { method: "installUpdate", category: "update", direction: "renderer-to-host", returnsPromise: false, isListener: false, description: "Install and restart" },
  { method: "getUpdateStatus", category: "update", direction: "renderer-to-host", returnsPromise: true, isListener: false, description: "Get current update status" },
  { method: "onUpdateStatus", category: "update", direction: "host-to-renderer", returnsPromise: false, isListener: true, description: "Listen for update status changes" },
  { method: "exportBackup", category: "filesystem", direction: "renderer-to-host", returnsPromise: true, isListener: false, description: "Export backup to disk" },
  { method: "importBackup", category: "filesystem", direction: "renderer-to-host", returnsPromise: true, isListener: false, description: "Import backup from disk" },
  { method: "saveFile", category: "filesystem", direction: "renderer-to-host", returnsPromise: true, isListener: false, description: "Save file to disk" },
  { method: "readFile", category: "filesystem", direction: "renderer-to-host", returnsPromise: true, isListener: false, description: "Read file from disk" },
  { method: "autoBackup", category: "filesystem", direction: "renderer-to-host", returnsPromise: true, isListener: false, description: "Trigger auto-backup" },
  { method: "listBackups", category: "filesystem", direction: "renderer-to-host", returnsPromise: true, isListener: false, description: "List available backups" },
  { method: "getCrashReports", category: "diagnostics", direction: "renderer-to-host", returnsPromise: true, isListener: false, description: "Retrieve crash reports" },
  { method: "clearCrashReports", category: "diagnostics", direction: "renderer-to-host", returnsPromise: true, isListener: false, description: "Clear crash reports" },
  { method: "reportRendererError", category: "diagnostics", direction: "renderer-to-host", returnsPromise: false, isListener: false, description: "Report renderer error" },
] as const;

/** Total bridge method count — must match preload.cjs exactly */
export const BRIDGE_METHOD_COUNT = BRIDGE_METHOD_REGISTRY.length; // 22 methods
