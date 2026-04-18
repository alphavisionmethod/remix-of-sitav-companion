// ═══════════════════════════════════════════════════════════════
// Nova SDK — useNovaApp Convenience Hook
// Auto-registers app, creates FS/Notify, binds lifecycle
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef, useMemo } from "react";
import { AppRegistry } from "../core/registry";
import type { AppManifest } from "../core/manifest";
import { AppLoader } from "../runtime/loader";
import { lifecycleManager, type NovaAppLifecycle } from "../runtime/lifecycle";
import { NovaFS } from "../system/filesystem";
import { NovaNotify } from "../system/notifications";
import { NovaBridge } from "../system/bridge";
import type { ComponentType } from "react";

interface UseNovaAppOptions {
  manifest: AppManifest;
  component: ComponentType<any>;
  lifecycle?: NovaAppLifecycle;
}

interface UseNovaAppResult {
  fs: NovaFS;
  notify: NovaNotify;
  bridge: typeof NovaBridge;
  lifecycle: typeof lifecycleManager;
  appId: string;
  runtime: import("../runtime/managed-runtime").AppRuntime | undefined;
}

export function useNovaApp({ manifest, component, lifecycle }: UseNovaAppOptions): UseNovaAppResult {
  const registered = useRef(false);

  const fs = useMemo(
    () => new NovaFS(manifest.permissions as any),
    [manifest.id]
  );

  const notify = useMemo(
    () => new NovaNotify(manifest.permissions as any),
    [manifest.id]
  );

  useEffect(() => {
    if (registered.current) return;
    registered.current = true;

    AppLoader.load({ manifest, component, lifecycle });

    return () => {
      lifecycle?.onExit?.();
      AppLoader.unload(manifest.id);
      registered.current = false;
    };
  }, [manifest.id]);

  return {
    fs,
    notify,
    bridge: NovaBridge,
    lifecycle: lifecycleManager,
    appId: manifest.id,
    runtime: AppRegistry.getApp(manifest.id)?.runtime,
  };
}
