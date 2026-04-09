// ═══════════════════════════════════════════════════════════════
// SITA OS — Hardware Capability Service
// Detects device capabilities for setup orchestration
// ═══════════════════════════════════════════════════════════════

import type { CapabilityProfileFull, HardwareWarning } from "@/packages/contracts/specialized/setup-data-models";

export class HardwareCapabilityService {
  async detectCapabilities(): Promise<CapabilityProfileFull> {
    const warnings: HardwareWarning[] = [];

    const hasCamera = !!(navigator.mediaDevices?.getUserMedia);
    const hasMicrophone = hasCamera;
    const hasBiometric = "credentials" in navigator && "PublicKeyCredential" in window;
    const hasGeolocation = "geolocation" in navigator;
    const hasWifi = (navigator as any).connection?.type === "wifi" || true;
    const hasBattery = "getBattery" in navigator;

    let batteryLevel: number | null = null;
    if (hasBattery) {
      try {
        const battery = await (navigator as any).getBattery();
        batteryLevel = Math.round(battery.level * 100);
        if (batteryLevel < 20 && !battery.charging) {
          warnings.push({
            code: "LOW_BATTERY",
            severity: "warning",
            message: "Battery level is low",
            recommendation: "Connect to power before continuing setup",
          });
        }
      } catch { /* battery API not available */ }
    }

    const screenWidth = window.screen.width;
    const screenSize = screenWidth < 768 ? "small" : screenWidth < 1200 ? "medium" : "large" as const;
    const displayClass = screenWidth < 600 ? "phone" : screenWidth < 1024 ? "tablet" : screenWidth < 1600 ? "laptop" : "desktop" as const;
    const deviceClass = screenWidth < 600 ? "mobile" : screenWidth < 1024 ? "tablet" : "desktop" as const;

    const conn = (navigator as any).connection;
    const connectionType = conn?.effectiveType === "4g" || conn?.effectiveType === "3g" ? "fast" : conn?.effectiveType === "2g" ? "slow" : navigator.onLine ? "fast" : "offline" as const;

    const inputModes: CapabilityProfileFull["inputModes"] = [];
    if (window.matchMedia("(pointer: coarse)").matches) inputModes.push("touch");
    if (window.matchMedia("(pointer: fine)").matches) inputModes.push("mouse");
    if ("keyboard" in navigator || !window.matchMedia("(pointer: coarse)").matches) inputModes.push("keyboard");

    const performanceTier = navigator.hardwareConcurrency >= 8 ? "high" : navigator.hardwareConcurrency >= 4 ? "medium" : "low" as const;

    return {
      hasCamera, hasBiometric, hasGeolocation, screenSize, connectionType,
      storageAvailable: "storage" in navigator,
      notificationsSupported: "Notification" in window,
      performanceTier,
      hasTPM: false, // not detectable from browser
      hasSecureEnclave: false, // not detectable from browser
      biometricTypes: hasBiometric ? ["fingerprint"] : [],
      hasMicrophone, hasBattery, batteryLevel, hasCellular: conn?.type === "cellular",
      hasEthernet: conn?.type === "ethernet", hasWifi, displayClass, inputModes, deviceClass,
      supportsReducedEffectsRecommendation: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      hardwareWarnings: warnings,
    };
  }

  getPerformanceTier(): "low" | "medium" | "high" {
    return navigator.hardwareConcurrency >= 8 ? "high" : navigator.hardwareConcurrency >= 4 ? "medium" : "low";
  }

  getInputModes(): string[] {
    const modes: string[] = [];
    if (window.matchMedia("(pointer: coarse)").matches) modes.push("touch");
    if (window.matchMedia("(pointer: fine)").matches) modes.push("mouse");
    modes.push("keyboard");
    return modes;
  }

  getHardwareWarnings(profile: CapabilityProfileFull): HardwareWarning[] {
    return profile.hardwareWarnings;
  }
}

export const hardwareCapabilityService = new HardwareCapabilityService();
