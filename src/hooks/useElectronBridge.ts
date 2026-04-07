// ═══════════════════════════════════════════════════════════════
// SITA OS — Electron Bridge Hook
// Exposes Electron IPC methods to React with graceful no-ops
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import type { SystemInfo, DeepLinkPayload, UpdateStatus } from "@/packages/contracts/native/electron-ipc";

interface SitaElectronBridge {
  getSystemInfo?: () => Promise<SystemInfo>;
  onDeepLink?: (cb: (payload: DeepLinkPayload) => void) => (() => void) | undefined;
  onUpdateStatus?: (cb: (status: UpdateState) => void) => (() => void) | undefined;
  sendNotification?: (title: string, body: string) => void;
  checkForUpdates?: () => Promise<UpdateStatus>;
  downloadUpdate?: () => Promise<{ success: boolean; reason?: string }>;
  installUpdate?: () => void;
  windowControl?: (action: string) => void;
  getCrashReports?: () => Promise<unknown[]>;
  clearCrashReports?: () => Promise<void>;
  reportRendererError?: (error: { message: string; stack?: string; url?: string }) => void;
  getAppVersion?: () => Promise<string>;
  platform?: string;
}

interface UpdateState {
  checking: boolean;
  available: boolean;
  downloaded: boolean;
  progress: { percent: number; bytesPerSecond: number; transferred: number; total: number } | null;
  error: string | null;
  info: { version: string; releaseDate?: string; releaseNotes?: string } | null;
  currentVersion: string;
}

declare global {
  interface Window {
    electron?: SitaElectronBridge;
  }
}

function isElectron(): boolean {
  return typeof window !== "undefined" && !!window.electron;
}

export function useElectronBridge() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [deepLink, setDeepLink] = useState<DeepLinkPayload | null>(null);
  const [updateState, setUpdateState] = useState<UpdateState | null>(null);
  const electron = isElectron();

  useEffect(() => {
    if (!electron) return;

    const bridge = window.electron!;

    bridge.getSystemInfo?.().then(setSystemInfo).catch(() => {});
    const cleanupDeepLink = bridge.onDeepLink?.((payload) => setDeepLink(payload));
    const cleanupUpdate = bridge.onUpdateStatus?.((status: UpdateState) => setUpdateState(status));

    return () => {
      cleanupDeepLink?.();
      cleanupUpdate?.();
    };
  }, [electron]);

  const sendNotification = useCallback((title: string, body: string) => {
    if (!electron) return;
    window.electron!.sendNotification?.(title, body);
  }, [electron]);

  const checkForUpdates = useCallback(async (): Promise<UpdateStatus | null> => {
    if (!electron) return null;
    return window.electron!.checkForUpdates?.() ?? null;
  }, [electron]);

  const downloadUpdate = useCallback(async (): Promise<{ success: boolean; reason?: string } | null> => {
    if (!electron) return null;
    return window.electron!.downloadUpdate?.() ?? null;
  }, [electron]);

  const installUpdate = useCallback((): void => {
    if (!electron) return;
    window.electron!.installUpdate?.();
  }, [electron]);

  const windowControl = useCallback((action: "minimize" | "maximize" | "close" | "fullscreen" | "restore") => {
    if (!electron) return;
    window.electron!.windowControl?.(action);
  }, [electron]);

  const getCrashReports = useCallback(async () => {
    if (!electron) return null;
    return window.electron!.getCrashReports?.() ?? null;
  }, [electron]);

  const clearCrashReports = useCallback(async () => {
    if (!electron) return null;
    return window.electron!.clearCrashReports?.() ?? null;
  }, [electron]);

  const reportError = useCallback((error: { message: string; stack?: string; url?: string }) => {
    if (!electron) return;
    window.electron!.reportRendererError?.(error);
  }, [electron]);

  return {
    isElectron: electron,
    systemInfo,
    deepLink,
    updateState,
    sendNotification,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    windowControl,
    getCrashReports,
    clearCrashReports,
    reportError,
    platform: electron ? window.electron?.platform ?? null : null,
  };
}
