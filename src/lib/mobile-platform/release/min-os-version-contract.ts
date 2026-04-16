// ═══════════════════════════════════════════════════════════════
// SITA OS — Minimum OS Version Contract
// Phase 12 — single source of truth for supported OS floors.
// ═══════════════════════════════════════════════════════════════

export interface MinOSVersion {
  ios: string;       // semver, e.g. "16.0"
  iosBuild: number;  // major number, e.g. 16
  android: number;   // API level, e.g. 26 (Android 8.0)
  androidLabel: string; // human label, e.g. "Android 8.0"
}

export const MIN_OS_VERSION: MinOSVersion = {
  ios: "16.0",
  iosBuild: 16,
  android: 26,
  androidLabel: "Android 8.0 (Oreo)",
} as const;

export interface OSVersionCheckResult {
  ok: boolean;
  os: "ios" | "android" | "web" | "unknown";
  detected: string | null;
  required: string;
  reason?: string;
}

/** Detect device OS version from UA — best-effort, browser-only. */
export function detectOSVersion(): { os: "ios" | "android" | "web" | "unknown"; version: string | null } {
  if (typeof navigator === "undefined") return { os: "unknown", version: null };
  const ua = navigator.userAgent;
  const iosMatch = ua.match(/OS (\d+)[_.](\d+)/);
  if (iosMatch) return { os: "ios", version: `${iosMatch[1]}.${iosMatch[2]}` };
  const androidMatch = ua.match(/Android (\d+)(?:\.(\d+))?/);
  if (androidMatch) return { os: "android", version: androidMatch[2] ? `${androidMatch[1]}.${androidMatch[2]}` : androidMatch[1] };
  return { os: "web", version: null };
}

/** Honest runtime gate — returns ok:false on stale OS. */
export function checkMinOSVersion(): OSVersionCheckResult {
  const { os, version } = detectOSVersion();
  if (os === "web" || os === "unknown") {
    return { ok: true, os, detected: version, required: "n/a" };
  }
  if (!version) {
    return { ok: true, os, detected: null, required: os === "ios" ? MIN_OS_VERSION.ios : String(MIN_OS_VERSION.android), reason: "version-undetectable" };
  }
  if (os === "ios") {
    const major = parseInt(version.split(".")[0], 10);
    if (Number.isNaN(major)) return { ok: true, os, detected: version, required: MIN_OS_VERSION.ios, reason: "parse-failed" };
    if (major < MIN_OS_VERSION.iosBuild) {
      return { ok: false, os, detected: version, required: MIN_OS_VERSION.ios, reason: `iOS ${version} below floor ${MIN_OS_VERSION.ios}` };
    }
    return { ok: true, os, detected: version, required: MIN_OS_VERSION.ios };
  }
  // android
  const major = parseInt(version.split(".")[0], 10);
  // Android 8.0 = API 26; map by major version
  const apiByMajor: Record<number, number> = { 5: 21, 6: 23, 7: 24, 8: 26, 9: 28, 10: 29, 11: 30, 12: 31, 13: 33, 14: 34, 15: 35 };
  const detectedApi = apiByMajor[major] ?? 26;
  if (detectedApi < MIN_OS_VERSION.android) {
    return { ok: false, os, detected: version, required: MIN_OS_VERSION.androidLabel, reason: `API ${detectedApi} below floor ${MIN_OS_VERSION.android}` };
  }
  return { ok: true, os, detected: version, required: MIN_OS_VERSION.androidLabel };
}
