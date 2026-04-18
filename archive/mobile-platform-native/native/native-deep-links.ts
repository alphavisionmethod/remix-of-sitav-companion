// ═══════════════════════════════════════════════════════════════
// SITA OS — Native Deep-Link Resolver Bridge
// Subscribes to App.appUrlOpen and dispatches into the existing
// deep-link router (deep-link-contract.ts). Honest no-op on web.
// ═══════════════════════════════════════════════════════════════

import { isCapacitorAvailable, invokeCapacitorPlugin } from "./capacitor-bridge";

const PLUGIN = "App";

type DeepLinkHandler = (url: string) => void;

let handler: DeepLinkHandler | null = null;
let listening = false;

export const nativeDeepLinks = {
  isAvailable: () => isCapacitorAvailable(),

  /** Register the single dispatcher invoked when iOS opens sita:// or a Universal Link. */
  setHandler(fn: DeepLinkHandler) {
    handler = fn;
  },

  async startListening(): Promise<boolean> {
    if (!isCapacitorAvailable() || listening) return listening;
    try {
      await invokeCapacitorPlugin({
        pluginId: PLUGIN,
        method: "addListener",
        options: {
          eventName: "appUrlOpen",
          callback: (event: { url?: string }) => {
            if (event?.url && handler) handler(event.url);
          },
        },
      });
      listening = true;
      return true;
    } catch {
      return false;
    }
  },

  async stopListening(): Promise<void> {
    if (!isCapacitorAvailable() || !listening) return;
    try {
      await invokeCapacitorPlugin({ pluginId: PLUGIN, method: "removeAllListeners" });
    } finally {
      listening = false;
    }
  },
};
