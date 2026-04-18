// ═══════════════════════════════════════════════════════════════
// Nova SDK — React Context Provider
// Provides SDK access to all apps via useNovaSDK()
// Boots kernel subsystems on mount, wires sound hooks
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext, useMemo, useEffect, useRef } from "react";
import { AppRegistry, type RegisteredApp } from "@/platform/nova-sdk/core/registry";
import { NovaBridge } from "@/platform/nova-sdk/system/bridge";
import { NovaEvents } from "@/platform/nova-sdk/input/events";
import { lifecycleManager } from "@/platform/nova-sdk/runtime/lifecycle";
import { AppLoader, type AppBundle } from "@/platform/nova-sdk/runtime/loader";
import { NovaFS } from "@/platform/nova-sdk/system/filesystem";
import { NovaNotify } from "@/platform/nova-sdk/system/notifications";
import { SoundEngine } from "@/platform/runtime/sound-engine";
import { NovaKernel } from "@/platform/nova-sdk/kernel/boot";

interface NovaSDKContextType {
  registry: typeof AppRegistry;
  bridge: typeof NovaBridge;
  events: typeof NovaEvents;
  lifecycle: typeof lifecycleManager;
  loadApp: (bundle: AppBundle) => void;
  getApp: (id: string) => RegisteredApp | undefined;
  createFS: (permissions: string[]) => NovaFS;
  createNotify: (permissions: string[]) => NovaNotify;
}

const NovaSDKCtx = createContext<NovaSDKContextType | null>(null);

export function NovaSDKProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Boot kernel subsystems (now includes HAL + extensions)
    NovaKernel.boot();

    // Wire sound effects into bridge
    NovaBridge.on("sound:play", (payload) => {
      if (payload?.type === "click") SoundEngine.click();
    });

    // Wire window sound hooks
    NovaBridge.on("window:create", (payload) => {
      SoundEngine.windowOpen(payload?.x);
    });
    NovaBridge.on("window:close", (payload) => {
      SoundEngine.windowClose(payload?.x);
    });

    // Wire menu sound hooks
    NovaBridge.on("sound:menuOpen", () => SoundEngine.menuOpen());
    NovaBridge.on("sound:menuClose", () => SoundEngine.menuClose());
    NovaBridge.on("sound:tabSwitch", (payload) => SoundEngine.tabSwitch(payload?.x));
    NovaBridge.on("sound:toggle", (payload) => SoundEngine.toggle(payload?.x));
    NovaBridge.on("sound:success", (payload) => SoundEngine.success(payload?.x));
    NovaBridge.on("sound:warning", (payload) => SoundEngine.warning(payload?.x));
    NovaBridge.on("sound:dragDrop", (payload) => SoundEngine.dragDrop(payload?.x));

    // Wire file service handlers
    const defaultFS = new NovaFS(["files.read", "files.write"]);
    NovaBridge.on("file:open", (payload) => {
      if (payload?.path) return defaultFS.readFile(payload.path);
    });
    NovaBridge.on("file:save", (payload) => {
      if (payload?.path && payload?.data) return defaultFS.writeFile(payload.path, payload.data);
    });
    NovaBridge.on("file:list", (payload) => {
      if (payload?.path) return defaultFS.listDir(payload.path);
    });

    // Wire notification handler
    const defaultNotify = new NovaNotify(["system.notifications"]);
    NovaBridge.on("notification:send", (payload) => {
      if (payload) defaultNotify.send(payload);
    });

    // Wire theme handler
    NovaBridge.on("theme:get", () => {
      const isDark = document.documentElement.classList.contains("dark");
      return { theme: isDark ? "dark" : "light" };
    });
  }, []);

  const value = useMemo<NovaSDKContextType>(() => ({
    registry: AppRegistry,
    bridge: NovaBridge,
    events: NovaEvents,
    lifecycle: lifecycleManager,
    loadApp: (bundle) => AppLoader.load(bundle),
    getApp: (id) => AppRegistry.getApp(id),
    createFS: (permissions) => new NovaFS(permissions as any),
    createNotify: (permissions) => new NovaNotify(permissions as any),
  }), []);

  return <NovaSDKCtx.Provider value={value}>{children}</NovaSDKCtx.Provider>;
}

export function useNovaSDK(): NovaSDKContextType {
  const ctx = useContext(NovaSDKCtx);
  if (!ctx) throw new Error("useNovaSDK must be used within <NovaSDKProvider>");
  return ctx;
}
