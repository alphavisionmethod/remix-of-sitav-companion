// ═══════════════════════════════════════════════════════════════
// SITA OS — iOS Runtime Adapter
// Bridges the iOS host (Capacitor / native shell) to the contract.
// In web fallback mode, all calls return honest unsupported markers.
// ═══════════════════════════════════════════════════════════════

import type { MobilePlatformContract } from "../contracts/mobile-platform-contract";

export interface IOSRuntimeAdapter {
  describe(): MobilePlatformContract;
  isAvailable(): boolean;
}

export const iosRuntimeAdapter: IOSRuntimeAdapter = {
  isAvailable() {
    if (typeof window === "undefined") return false;
    const cap = (window as Window & { Capacitor?: { getPlatform?: () => string } }).Capacitor;
    return cap?.getPlatform?.() === "ios";
  },
  describe() {
    return {
      os: "ios",
      host: this.isAvailable() ? "capacitor" : "web-mobile",
      channel: "internal",
      appVersion: "0.0.0",
      osVersion: "unknown",
      deviceModel: null,
      buildNumber: "0",
      isPhysicalDevice: false,
      hasSecureKeystore: this.isAvailable(),
    };
  },
};
