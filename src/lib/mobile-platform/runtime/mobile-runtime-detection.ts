// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Runtime Detection
// Pure detection — no React, no side effects, safe in workers.
// ═══════════════════════════════════════════════════════════════

import type { MobileHost, MobileOS } from "../contracts/mobile-platform-contract";

export interface MobileRuntimeProbe {
  isMobileViewport: boolean;
  os: MobileOS | null;
  host: MobileHost;
  isStandalonePWA: boolean;
  /** True when window.Capacitor is present. */
  isCapacitor: boolean;
}

export function detectMobileRuntime(): MobileRuntimeProbe {
  if (typeof window === "undefined") {
    return { isMobileViewport: false, os: null, host: "web-mobile", isStandalonePWA: false, isCapacitor: false };
  }

  const ua = (navigator?.userAgent ?? "").toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua) || (navigator?.platform === "MacIntel" && (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints! > 1);
  const isAndroid = /android/.test(ua);
  const os: MobileOS | null = isIOS ? "ios" : isAndroid ? "android" : null;

  const isCapacitor = typeof (window as Window & { Capacitor?: unknown }).Capacitor !== "undefined";
  const host: MobileHost = isCapacitor ? "capacitor" : "web-mobile";

  const isStandalonePWA =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  const isMobileViewport = window.innerWidth < 768;

  return { isMobileViewport, os, host, isStandalonePWA, isCapacitor };
}
