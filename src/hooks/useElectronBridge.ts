// ═══════════════════════════════════════════════════════════════
// SITA OS — Electron Bridge Hook
// Exposes Electron IPC methods to React with graceful no-ops
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import type { SystemInfo, DeepLinkPayload, UpdateStatus, ElectronBridgeAPI } from "@/packages/contracts/native/electron-ipc";

interface UpdateState {
  checking: boolean;
  available: boolean;
  downloaded: boolean;
  progress: { percent: number; bytesPerSecond: number; transferred: number; total: number } | null;
  error: string | null;
  info: { version: string; releaseDate?: string; releaseNotes?: string } | null;
  currentVersion: string;
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

    const bridge = window.electron as unknown as ElectronBridgeAPI;

    // Fetch system info
    bridge.getSystemInfo?.().then(setSystemInfo).catch(() => {});

    // Listen for deep links
    const cleanupDeepLink = bridge.onDeepLink?.((payload) => setDeepLink(payload));

    // Listen for update status
    const el = window.electron as unknown;
    const cleanupUpdate = el.onUpdateStatus?.((status: UpdateState) => setUpdateState(status));

    return () => {
      cleanupDeepLink?.();
      cleanupUpdate?.();
    };
  }, [electron]);

  const sendNotification = useCallback((title: string, body: string) => {
    if (!electron) return;
    (window.electron as unknown as ElectronBridgeAPI).sendNotification(title, body);
  }, [electron]);

  const checkForUpdates = useCallback(async (): Promise<UpdateStatus | null> => {
    if (!electron) return null;
    return (window.electron as unknown as ElectronBridgeAPI).checkForUpdates();
  }, [electron]);

  const downloadUpdate = useCallback(async (): Promise<{ success: boolean; reason?: string } | null> => {
    if (!electron) return null;
    return (window.electron as unknown).downloadUpdate();
  }, [electron]);

  const installUpdate = useCallback((): void => {
    if (!electron) return;
    (window.electron as unknown).installUpdate();
  }, [electron]);

  const windowControl = useCallback((action: "minimize" | "maximize" | "close" | "fullscreen" | "restore") => {
    if (!electron) return;
    (window.electron as unknown as ElectronBridgeAPI).windowControl(action);
  }, [electron]);

  const getCrashReports = useCallback(async () => {
    if (!electron) return null;
    return (window.electron as unknown).getCrashReports();
  }, [electron]);

  const clearCrashReports = useCallback(async () => {
    if (!electron) return null;
    return (window.electron as unknown).clearCrashReports();
  }, [electron]);

  const reportError = useCallback((error: { message: string; stack?: string; url?: string }) => {
    if (!electron) return;
    (window.electron as unknown).reportRendererError(error);
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
    platform: electron ? (window.electron as unknown)?.platform : null,
  };
}
