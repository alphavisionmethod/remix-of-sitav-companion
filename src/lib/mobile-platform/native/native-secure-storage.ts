// ═══════════════════════════════════════════════════════════════
// SITA OS — Native Secure Storage (Capacitor Preferences bridge)
// Wraps @capacitor/preferences when available, else returns null.
// Used as the real backing store by iOS Keychain / Android Keystore
// adapters once Capacitor is installed (`npx cap add ios|android`).
// ═══════════════════════════════════════════════════════════════

import { invokeCapacitorPlugin, isCapacitorAvailable } from "./capacitor-bridge";

const PLUGIN = "Preferences";

export const nativeSecureStorage = {
  isAvailable: () => isCapacitorAvailable(),

  async set(key: string, value: string): Promise<boolean> {
    if (!isCapacitorAvailable()) return false;
    const res = await invokeCapacitorPlugin({
      pluginId: PLUGIN,
      method: "set",
      options: { key, value },
    });
    return res !== null;
  },

  async get(key: string): Promise<string | null> {
    if (!isCapacitorAvailable()) return null;
    const res = await invokeCapacitorPlugin<{ value: string | null }>({
      pluginId: PLUGIN,
      method: "get",
      options: { key },
    });
    return res?.value ?? null;
  },

  async remove(key: string): Promise<boolean> {
    if (!isCapacitorAvailable()) return false;
    const res = await invokeCapacitorPlugin({
      pluginId: PLUGIN,
      method: "remove",
      options: { key },
    });
    return res !== null;
  },

  async clear(): Promise<boolean> {
    if (!isCapacitorAvailable()) return false;
    const res = await invokeCapacitorPlugin({
      pluginId: PLUGIN,
      method: "clear",
    });
    return res !== null;
  },
};
