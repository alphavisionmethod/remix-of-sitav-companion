// ═══════════════════════════════════════════════════════════════
// SITA OS — Electron Bridge Hook
// Exposes Electron IPC methods to React with graceful no-ops
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import type { SystemInfo, DeepLinkPayload, UpdateStatus, ElectronBridgeAPI } from "@/packages/contracts/native/electron-ipc";

function isElectron(): boolean {
  return typeof window !== "undefined" && !!window.electron;
}

export function useElectronBridge() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [deepLink, setDeepLink] = useState<DeepLinkPayload | null>(null);
  const electron = isElectron();

  useEffect(() => {
    if (!electron) return;

    const bridge = window.electron as unknown as ElectronBridgeAPI;

    // Fetch system info
    bridge.getSystemInfo?.().then(setSystemInfo).catch(() => {});

    // Listen for deep links
    const cleanup = bridge.onDeepLink?.((payload) => setDeepLink(payload));
    return () => cleanup?.();
  }, [electron]);

  const sendNotification = useCallback((title: string, body: string) => {
    if (!electron) return;
    (window.electron as unknown as ElectronBridgeAPI).sendNotification(title, body);
  }, [electron]);

  const checkForUpdates = useCallback(async (): Promise<UpdateStatus | null> => {
    if (!electron) return null;
    return (window.electron as unknown as ElectronBridgeAPI).checkForUpdates();
  }, [electron]);

  const windowControl = useCallback((action: "minimize" | "maximize" | "close" | "fullscreen" | "restore") => {
    if (!electron) return;
    (window.electron as unknown as ElectronBridgeAPI).windowControl(action);
  }, [electron]);

  return {
    isElectron: electron,
    systemInfo,
    deepLink,
    sendNotification,
    checkForUpdates,
    windowControl,
    platform: electron ? (window.electron as any)?.platform : null,
  };
}
