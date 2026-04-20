// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Platform Helper
// Single source of truth for device platform / form-factor /
// label / fingerprint. Layered on top of the canonical runtime
// detectors (detectActiveRuntimeTier, detectDesktopRuntime).
//
// All UA parsing in the codebase outside src/runtimes/ MUST flow
// through this module so the registry remains the only authority.
// ═══════════════════════════════════════════════════════════════

import { detectDesktopRuntime, getElectronBridge, isElectronRuntime } from "./desktop/desktop-runtime-detection";
import { detectActiveRuntimeTier } from "./runtime-detection";

export type DevicePlatform = "ios" | "android" | "macos" | "windows" | "linux" | "web";
export type DeviceFormFactor = "desktop" | "mobile" | "tablet";

function getUA(): string {
  if (typeof navigator === "undefined") return "";
  return navigator.userAgent || "";
}

/** Canonical platform classifier — registry first, UA fallback. */
export function getDevicePlatform(): DevicePlatform {
  // Registry first: desktop runtime knows its real OS.
  const desktop = detectDesktopRuntime();
  if (desktop.isElectron) {
    switch (desktop.platform) {
      case "darwin": return "macos";
      case "win32": return "windows";
      case "linux": return "linux";
      default: break;
    }
  }
  const ua = getUA();
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Mac/i.test(ua)) return "macos";
  if (/Win/i.test(ua)) return "windows";
  if (/Linux/i.test(ua)) return "linux";
  return "web";
}

/** Mobile / tablet / desktop classification. */
export function getDeviceFormFactor(): DeviceFormFactor {
  if (isElectronRuntime()) return "desktop";
  const ua = getUA();
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua)) return "mobile";
  return "desktop";
}

export function isMobileSurface(): boolean {
  return getDeviceFormFactor() === "mobile";
}

/** Friendly device label for telemetry / device lists. */
export function getDeviceLabel(): string {
  if (isElectronRuntime()) return "SITA Desktop";
  const ua = getUA();
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android Device";
  if (/Macintosh|Mac OS/.test(ua)) return "Mac Browser";
  if (/Windows/.test(ua)) return "Windows Browser";
  if (/Linux/.test(ua)) return "Linux Browser";
  return "Unknown Device";
}

/**
 * Stable short fingerprint used by state-sync / continuity.
 * Intentionally NOT a privacy fingerprint — just a deterministic
 * short id derived from coarse platform + tier signals.
 */
export function getDeviceFingerprint(): string {
  const tier = detectActiveRuntimeTier();
  const platform = getDevicePlatform();
  const form = getDeviceFormFactor();
  const ua = getUA().slice(0, 20).replace(/\s+/g, "_");
  return `${tier.toLowerCase()}_${platform}_${form}_${ua}`;
}

/** Coarse OS version string for diagnostics rows. */
export function getOSVersionString(): string {
  if (isElectronRuntime()) {
    const bridge = getElectronBridge();
    const platform = typeof bridge?.platform === "string" ? bridge.platform : "desktop";
    return `SITA Desktop (${platform})`;
  }
  return getUA().slice(0, 60);
}
