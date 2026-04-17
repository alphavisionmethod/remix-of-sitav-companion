// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime capability probe
// ═══════════════════════════════════════════════════════════════

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

declare global {
  interface Window {
    electron?: { platform?: string };
    sitaApps?: {
      launchNativeApp?: (id: string) => Promise<unknown>;
      checkNativeAppAvailability?: (id: string) => Promise<{ available: boolean }>;
      openExternalUrl?: (url: string) => Promise<unknown>;
      getHostCapabilities?: () => Promise<{ platform: string; canLaunchNative: boolean }>;
    };
  }
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

  const ua = navigator.userAgent || "";
  const isElectron = !!window.electron || ua.toLowerCase().includes("electron");
  const isPwa = window.matchMedia?.("(display-mode: standalone)").matches ?? false;
  const isMobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const hasNativeAppsBridge = !!window.sitaApps?.launchNativeApp;

  let platform: RuntimeCapabilities["platform"] = "web";
  if (isElectron && window.electron?.platform) {
    platform = window.electron.platform as RuntimeCapabilities["platform"];
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    platform = "ios";
  } else if (/Android/i.test(ua)) {
    platform = "android";
  } else if (/Mac/i.test(ua)) {
    platform = "darwin";
  } else if (/Win/i.test(ua)) {
    platform = "win32";
  } else if (/Linux/i.test(ua)) {
    platform = "linux";
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
