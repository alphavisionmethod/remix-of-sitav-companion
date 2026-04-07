// ═══════════════════════════════════════════════════════════════
// SITA OS — Electron Bridge Hook
// Exposes Electron IPC methods to React with graceful no-ops
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import type { SystemInfo, DeepLinkPayload, UpdateStatus } from "@/packages/contracts/native/electron-ipc";

interface UpdateState {
  checking: boolean;
  available: boolean;
  downloaded: boolean;
  progress: { percent: number; bytesPerSecond: number; transferred: number; total: number } | null;
  error: string | null;
  info: { version: string; releaseDate?: string; releaseNotes?: string } | null;
  currentVersion: string;
}

function getElectronBridge() {
  if (typeof window === "undefined") return null;
  const el = (window as unknown as Record<string, unknown>).electron;
  return el && typeof el === "object" ? (el as Record<string, unknown>) : null;
}

function isElectron(): boolean {
  return !!getElectronBridge();
}

export function useElectronBridge() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [deepLink, setDeepLink] = useState<DeepLinkPayload | null>(null);
  const [updateState, setUpdateState] = useState<UpdateState | null>(null);
  const electron = isElectron();

  useEffect(() => {
    if (!electron) return;
    const bridge = getElectronBridge()!;

    const getSystemInfo = bridge.getSystemInfo as (() => Promise<SystemInfo>) | undefined;
    const onDeepLink = bridge.onDeepLink as ((cb: (p: DeepLinkPayload) => void) => (() => void) | undefined) | undefined;
    const onUpdateStatus = bridge.onUpdateStatus as ((cb: (s: UpdateState) => void) => (() => void) | undefined) | undefined;

    getSystemInfo?.().then(setSystemInfo).catch(() => {});
    const cleanupDeepLink = onDeepLink?.((payload) => setDeepLink(payload));
    const cleanupUpdate = onUpdateStatus?.((status) => setUpdateState(status));

    return () => {
      cleanupDeepLink?.();
      cleanupUpdate?.();
    };
  }, [electron]);

  const sendNotification = useCallback((title: string, body: string) => {
    if (!electron) return;
    const fn = getElectronBridge()?.sendNotification as ((t: string, b: string) => void) | undefined;
    fn?.(title, body);
  }, [electron]);

  const checkForUpdates = useCallback(async (): Promise<UpdateStatus | null> => {
    if (!electron) return null;
    const fn = getElectronBridge()?.checkForUpdates as (() => Promise<UpdateStatus>) | undefined;
    return fn?.() ?? null;
  }, [electron]);

  const downloadUpdate = useCallback(async (): Promise<{ success: boolean; reason?: string } | null> => {
    if (!electron) return null;
    const fn = getElectronBridge()?.downloadUpdate as (() => Promise<{ success: boolean; reason?: string }>) | undefined;
    return fn?.() ?? null;
  }, [electron]);

  const installUpdate = useCallback((): void => {
    if (!electron) return;
    const fn = getElectronBridge()?.installUpdate as (() => void) | undefined;
    fn?.();
  }, [electron]);

  const windowControl = useCallback((action: "minimize" | "maximize" | "close" | "fullscreen" | "restore") => {
    if (!electron) return;
    const fn = getElectronBridge()?.windowControl as ((a: string) => void) | undefined;
    fn?.(action);
  }, [electron]);

  const getCrashReports = useCallback(async () => {
    if (!electron) return null;
    const fn = getElectronBridge()?.getCrashReports as (() => Promise<unknown[]>) | undefined;
    return fn?.() ?? null;
  }, [electron]);

  const clearCrashReports = useCallback(async () => {
    if (!electron) return null;
    const fn = getElectronBridge()?.clearCrashReports as (() => Promise<void>) | undefined;
    await fn?.();
    return null;
  }, [electron]);

  const reportError = useCallback((error: { message: string; stack?: string; url?: string }) => {
    if (!electron) return;
    const fn = getElectronBridge()?.reportRendererError as ((e: { message: string; stack?: string; url?: string }) => void) | undefined;
    fn?.(error);
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
    platform: electron ? (getElectronBridge()?.platform as string) ?? null : null,
  };
}
