// ═══════════════════════════════════════════════════════════════
// SITA OS — Native Background Runner Bridge
// Wraps @capacitor/background-runner. Schedules an "app-refresh"
// task that pings the health edge function so push-deferred surfaces
// stay fresh. Honest no-op when Capacitor isn't available.
// ═══════════════════════════════════════════════════════════════

import { isCapacitorAvailable, invokeCapacitorPlugin, getCapacitorPlatform } from "./capacitor-bridge";

const PLUGIN = "BackgroundRunner";
const TASK_ID = "app.lovable.sita-os.refresh";

export const nativeBackgroundRunner = {
  isAvailable: () => isCapacitorAvailable(),

  async registerRefreshTask(): Promise<{ scheduled: boolean; reason?: string }> {
    if (!isCapacitorAvailable()) {
      return { scheduled: false, reason: "capacitor-unavailable" };
    }
    const platform = getCapacitorPlatform();
    if (platform !== "ios" && platform !== "android") {
      return { scheduled: false, reason: "unsupported-platform" };
    }

    try {
      await invokeCapacitorPlugin({
        pluginId: PLUGIN,
        method: "dispatchEvent",
        options: { label: TASK_ID, event: "register", details: { interval: 15 } },
      });
      return { scheduled: true };
    } catch (err) {
      return {
        scheduled: false,
        reason: err instanceof Error ? err.message : "register-failed",
      };
    }
  },

  async unregisterRefreshTask(): Promise<boolean> {
    if (!isCapacitorAvailable()) return false;
    try {
      await invokeCapacitorPlugin({
        pluginId: PLUGIN,
        method: "dispatchEvent",
        options: { label: TASK_ID, event: "unregister", details: {} },
      });
      return true;
    } catch {
      return false;
    }
  },
};
