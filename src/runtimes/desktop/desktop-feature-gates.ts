// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Feature Gates
// Production-ready feature gate layer for desktop-specific
// capability availability checks
// ═══════════════════════════════════════════════════════════════

import { isElectronRuntime, hasBridgeMethod } from "./desktop-runtime-detection";
import { DESKTOP_CAPABILITIES } from "./desktop-host-capabilities";

export type FeatureGateResult = {
  available: boolean;
  reason: "electron-available" | "web-fallback" | "not-available";
  fallbackHint: string | null;
};

/**
 * Check if a specific desktop capability is available.
 * Returns availability status with fallback hints for graceful degradation.
 */
export function checkDesktopFeature(capabilityId: string): FeatureGateResult {
  const cap = DESKTOP_CAPABILITIES.find((c) => c.id === capabilityId);
  if (!cap) {
    return { available: false, reason: "not-available", fallbackHint: null };
  }

  if (isElectronRuntime()) {
    const methodAvailable = cap.bridgeMethod === "platform"
      ? true // property, always available when bridge exists
      : hasBridgeMethod(cap.bridgeMethod);

    if (methodAvailable) {
      return { available: true, reason: "electron-available", fallbackHint: null };
    }
  }

  if (cap.webFallback) {
    return { available: true, reason: "web-fallback", fallbackHint: cap.webFallback };
  }

  return { available: false, reason: "not-available", fallbackHint: null };
}

/** Check if filesystem operations are available */
export function canAccessFilesystem(): boolean {
  return checkDesktopFeature("fs.read").available && checkDesktopFeature("fs.write").available;
}

/** Check if auto-update is available */
export function canAutoUpdate(): boolean {
  return checkDesktopFeature("update.check").available;
}

/** Check if window control is available */
export function canControlWindow(): boolean {
  return checkDesktopFeature("window.control").available;
}

/** Check if local backup is available */
export function canLocalBackup(): boolean {
  return checkDesktopFeature("fs.backup.export").available;
}

/** Check if crash reporting is available */
export function canReportCrashes(): boolean {
  return checkDesktopFeature("diag.crash.list").available;
}

/** Check if native notifications are available (desktop or web fallback) */
export function canSendNotifications(): boolean {
  return checkDesktopFeature("notification.send").available;
}

/**
 * Get a summary of all feature gate statuses.
 * Useful for admin dashboards and runtime truth surfaces.
 */
export function getFeatureGateSummary(): Array<{ id: string; name: string; result: FeatureGateResult }> {
  return DESKTOP_CAPABILITIES.map((cap) => ({
    id: cap.id,
    name: cap.name,
    result: checkDesktopFeature(cap.id),
  }));
}
