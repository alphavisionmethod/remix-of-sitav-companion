// ═══════════════════════════════════════════════════════════════
// SITA OS — Android Runtime Adapter
// ═══════════════════════════════════════════════════════════════

import type { MobilePlatformContract } from "../contracts/mobile-platform-contract";

export interface AndroidRuntimeAdapter {
  describe(): MobilePlatformContract;
  isAvailable(): boolean;
}

export const androidRuntimeAdapter: AndroidRuntimeAdapter = {
  isAvailable() {
    if (typeof window === "undefined") return false;
    const cap = (window as Window & { Capacitor?: { getPlatform?: () => string } }).Capacitor;
    return cap?.getPlatform?.() === "android";
  },
  describe() {
    return {
      os: "android",
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
