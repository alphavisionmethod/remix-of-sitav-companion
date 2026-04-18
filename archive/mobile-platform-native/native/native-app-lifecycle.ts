// ═══════════════════════════════════════════════════════════════
// SITA OS — Native App Lifecycle (Capacitor App plugin)
// Subscribes to appStateChange + appUrlOpen when present.
// On web, falls back to document.visibilitychange via adapters.
// ═══════════════════════════════════════════════════════════════

import { isCapacitorAvailable } from "./capacitor-bridge";

interface CapAppPlugin {
  addListener?: (event: string, fn: (...args: unknown[]) => void) => Promise<{ remove: () => Promise<void> }>;
}

function getAppPlugin(): CapAppPlugin | null {
  if (typeof window === "undefined") return null;
  const cap = (window as Window & {
    Capacitor?: { Plugins?: Record<string, unknown> };
  }).Capacitor;
  return (cap?.Plugins?.App as CapAppPlugin) ?? null;
}

export const nativeAppLifecycle = {
  isAvailable: () => isCapacitorAvailable() && !!getAppPlugin(),

  async subscribeStateChange(
    handler: (state: { isActive: boolean }) => void,
  ): Promise<() => void> {
    const app = getAppPlugin();
    if (!app?.addListener) return () => {};
    const sub = await app.addListener("appStateChange", (state) => {
      handler(state as { isActive: boolean });
    });
    return () => {
      void sub.remove();
    };
  },

  async subscribeUrlOpen(
    handler: (data: { url: string }) => void,
  ): Promise<() => void> {
    const app = getAppPlugin();
    if (!app?.addListener) return () => {};
    const sub = await app.addListener("appUrlOpen", (data) => {
      handler(data as { url: string });
    });
    return () => {
      void sub.remove();
    };
  },
};
