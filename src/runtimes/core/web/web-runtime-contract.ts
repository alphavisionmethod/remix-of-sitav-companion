// ═══════════════════════════════════════════════════════════════
// SITA OS — Web Runtime Contract
// Defines what the WEB_APP tier may and may not do.
// ═══════════════════════════════════════════════════════════════

import type { RuntimeTier } from "../runtime-tier-model";

export const WEB_RUNTIME_TIER: RuntimeTier = "WEB_APP";

export interface WebRuntimeContract {
  tier: typeof WEB_RUNTIME_TIER;
  hostAuthority: "browser-sandbox";
  /** Capability names the web tier honestly supports. */
  honestCapabilities: readonly string[];
  /** Capability names that are NOT permitted (and must not be claimed). */
  prohibitedCapabilities: readonly string[];
  /** Capabilities offered via fallback paths only. */
  fallbackOnlyCapabilities: readonly string[];
  /** UX patterns that may simulate OS behavior — never claim it. */
  simulationOnlyCapabilities: readonly string[];
}

export const WEB_RUNTIME_CONTRACT: WebRuntimeContract = {
  tier: WEB_RUNTIME_TIER,
  hostAuthority: "browser-sandbox",
  honestCapabilities: [
    "auth",
    "data-persistence",
    "realtime",
    "ai-inference",
    "deep-linking",
    "browser-notifications",
    "service-worker-cache",
  ],
  prohibitedCapabilities: [
    "kernel-control",
    "host-process-management",
    "unrestricted-filesystem",
    "native-package-install",
    "tray-icon",
    "menu-bar",
  ],
  fallbackOnlyCapabilities: [
    "filesystem-local",       // user-mediated upload picker
    "local-backup",           // download/upload roundtrip
    "crash-reporting",        // in-app reporter only
    "system-info",            // navigator + UA hints only
  ],
  simulationOnlyCapabilities: [
    "window-control",
    "menu-bar",
    "boot-sequence",
    "lock-screen",
    "control-center",
    "mission-control",
  ],
} as const;
