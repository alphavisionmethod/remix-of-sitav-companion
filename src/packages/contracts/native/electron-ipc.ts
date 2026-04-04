// ═══════════════════════════════════════════════════════════════
// SITA OS — Electron IPC Contract
// Typed channel definitions shared between main and renderer
// ═══════════════════════════════════════════════════════════════

export type ElectronIPCChannel =
  | "system-info"
  | "deep-link"
  | "notifications"
  | "auto-update"
  | "tray-actions"
  | "window-control"
  | "app-version";

export interface SystemInfo {
  platform: string;
  arch: string;
  hostname: string;
  cpuCount: number;
  totalMemoryMB: number;
  freeMemoryMB: number;
  osVersion: string;
  electronVersion: string;
  appVersion: string;
}

export interface DeepLinkPayload {
  protocol: string;
  path: string;
  params: Record<string, string>;
}

export interface UpdateStatus {
  available: boolean;
  currentVersion: string;
  latestVersion?: string;
  downloadUrl?: string;
}

export interface TrayAction {
  id: string;
  label: string;
  accelerator?: string;
}

export interface WindowControlAction {
  type: "minimize" | "maximize" | "close" | "fullscreen" | "restore";
}

// IPC API exposed via contextBridge
export interface ElectronBridgeAPI {
  getSystemInfo: () => Promise<SystemInfo>;
  onDeepLink: (callback: (payload: DeepLinkPayload) => void) => () => void;
  sendNotification: (title: string, body: string) => void;
  checkForUpdates: () => Promise<UpdateStatus>;
  windowControl: (action: WindowControlAction["type"]) => void;
  getAppVersion: () => string;
  platform: string;
}
