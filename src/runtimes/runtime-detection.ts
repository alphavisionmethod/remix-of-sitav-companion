// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Detection
// Detects the active 4-Tier runtime at boot.
// Falls through: appliance → desktop → web (default).
// ═══════════════════════════════════════════════════════════════

import type { RuntimeTier } from "./runtime-tier-model";
import { isElectronRuntime } from "./desktop/desktop-runtime-detection";

/** Probe for an appliance-runtime host. */
export function isApplianceRuntime(): boolean {
  if (typeof window === "undefined") return false;
  // 1. Build-time flag
  const flag = (import.meta as any)?.env?.VITE_APPLIANCE_RUNTIME;
  if (flag === "true" || flag === "1") return true;
  // 2. Host header (when served from packaged appliance image)
  const hostname = window.location?.hostname ?? "";
  if (hostname === "sita.local" || hostname.endsWith(".sita.appliance")) return true;
  // 3. Bridge probe
  if ((window as any).__SITA_APPLIANCE_RUNTIME === true) return true;
  return false;
}

/** Probe for the desktop (Electron) runtime. */
export function isDesktopHost(): boolean {
  return isElectronRuntime();
}

/** Probe for the plain web runtime (default). */
export function isWebApp(): boolean {
  return !isApplianceRuntime() && !isDesktopHost();
}

/**
 * Detect the active runtime tier with a stable precedence order:
 *   APPLIANCE_RUNTIME > DESKTOP_HOST > WEB_APP
 *
 * SIMULATED_OS_EXPERIENCE is never a *primary* tier — it is a UX
 * concern that overlays whichever primary tier is active.
 */
export function detectActiveRuntimeTier(): RuntimeTier {
  if (isApplianceRuntime()) return "APPLIANCE_RUNTIME";
  if (isDesktopHost()) return "DESKTOP_HOST";
  return "WEB_APP";
}

export interface RuntimeTierProbe {
  tier: RuntimeTier;
  isAppliance: boolean;
  isDesktop: boolean;
  isWeb: boolean;
  /** Always true — every primary tier may surface OS-like UX. */
  supportsSimulatedShell: boolean;
  detectedAt: string;
}

export function probeRuntimeTier(): RuntimeTierProbe {
  return {
    tier: detectActiveRuntimeTier(),
    isAppliance: isApplianceRuntime(),
    isDesktop: isDesktopHost(),
    isWeb: isWebApp(),
    supportsSimulatedShell: true,
    detectedAt: new Date().toISOString(),
  };
}
