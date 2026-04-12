// ═══════════════════════════════════════════════════════════════
// Nova SDK — React Context Provider
// Provides SDK access to all apps via useNovaSDK()
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext, useMemo, useEffect, useRef } from "react";
import { AppRegistry, type RegisteredApp } from "@/lib/nova-sdk/core/registry";
import { NovaBridge } from "@/lib/nova-sdk/system/bridge";
import { NovaEvents } from "@/lib/nova-sdk/input/events";
import { lifecycleManager } from "@/lib/nova-sdk/runtime/lifecycle";
import { AppLoader, type AppBundle } from "@/lib/nova-sdk/runtime/loader";
import { NovaFS } from "@/lib/nova-sdk/system/filesystem";
import { NovaNotify } from "@/lib/nova-sdk/system/notifications";
import { SoundEngine } from "@/lib/sound-engine";

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

    // Wire sound effects into bridge
    NovaBridge.on("sound:play", (payload) => {
      if (payload?.type === "click") SoundEngine.click();
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
