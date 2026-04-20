// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime capability probe
// All tier + platform truth flows through src/runtimes/.
// ═══════════════════════════════════════════════════════════════

import { detectDesktopRuntime } from "@/runtimes/desktop/desktop-runtime-detection";
import { getDevicePlatform, isMobileSurface } from "@/runtimes/runtime-platform";

export interface RuntimeCapabilities {
  isElectron: boolean;
  isPwa: boolean;
  isMobile: boolean;
  isOnline: boolean;
  hasServiceWorker: boolean;
  hasNotifications: boolean;
  hasNativeAppsBridge: boolean;
  platform: "darwin" | "win32" | "linux" | "ios" | "android" | "web" | "unknown";
  surface: "desktop" | "mobile" | "pwa" | "electron";
}

export function probeRuntime(): RuntimeCapabilities {
  if (typeof window === "undefined") {
    return {
      isElectron: false,
      isPwa: false,
      isMobile: false,
      isOnline: true,
      hasServiceWorker: false,
      hasNotifications: false,
      hasNativeAppsBridge: false,
      platform: "unknown",
      surface: "desktop",
    };
  }

  const desktop = detectDesktopRuntime();
  const isElectron = desktop.isElectron;
  const isPwa = window.matchMedia?.("(display-mode: standalone)").matches ?? false;
  const isMobileUA = isMobileSurface();
  const hasNativeAppsBridge = !!window.sitaApps?.launchNativeApp;

  // Platform mapping: prefer desktop bridge truth, otherwise use the
  // registry's UA-based classifier and translate to legacy buckets.
  let platform: RuntimeCapabilities["platform"];
  if (isElectron && desktop.platform !== "unknown") {
    platform = desktop.platform;
  } else {
    const dp = getDevicePlatform();
    platform =
      dp === "macos" ? "darwin" :
      dp === "windows" ? "win32" :
      dp === "linux" ? "linux" :
      dp === "ios" ? "ios" :
      dp === "android" ? "android" :
      "web";
  }

  const surface: RuntimeCapabilities["surface"] = isElectron
    ? "electron"
    : isPwa
    ? "pwa"
    : isMobileUA
    ? "mobile"
    : "desktop";

  return {
    isElectron,
    isPwa,
    isMobile: isMobileUA,
    isOnline: navigator.onLine,
    hasServiceWorker: "serviceWorker" in navigator,
    hasNotifications: "Notification" in window,
    hasNativeAppsBridge,
    platform,
    surface,
  };
}
