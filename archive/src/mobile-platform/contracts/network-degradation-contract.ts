// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Network Degradation Contract
// Drives UI mode, sync policy, and safe-mutation gating.
// ═══════════════════════════════════════════════════════════════

import type { MobileNetworkTier } from "./mobile-platform-contract";

export interface NetworkSnapshot {
  tier: MobileNetworkTier;
  /** "wifi" | "cellular" | "ethernet" | "none" */
  transport: "wifi" | "cellular" | "ethernet" | "none";
  /** Carrier-reported metered status (Android) or expensive (iOS). */
  metered: boolean;
  /** Estimated round-trip latency in ms when known. */
  rttMs: number | null;
  /** Estimated downlink throughput in Mbps when known. */
  downlinkMbps: number | null;
  observedAt: string;
}

export interface DegradationPolicy {
  tier: MobileNetworkTier;
  /** Disable image-heavy surfaces and streams. */
  liteMode: boolean;
  /** Block non-critical background tasks. */
  pauseBackgroundWork: boolean;
  /** Mutations are queued instead of sent. */
  queueMutations: boolean;
  /** Show stale-data hints in the UI. */
  showStaleHints: boolean;
  /** Show the offline banner. */
  showBanner: boolean;
}

export const NETWORK_DEGRADATION_POLICY: ReadonlyArray<DegradationPolicy> = [
  { tier: "online",   liteMode: false, pauseBackgroundWork: false, queueMutations: false, showStaleHints: false, showBanner: false },
  { tier: "lite",     liteMode: true,  pauseBackgroundWork: false, queueMutations: false, showStaleHints: true,  showBanner: false },
  { tier: "degraded", liteMode: true,  pauseBackgroundWork: true,  queueMutations: true,  showStaleHints: true,  showBanner: true  },
  { tier: "offline",  liteMode: true,  pauseBackgroundWork: true,  queueMutations: true,  showStaleHints: true,  showBanner: true  },
] as const;

export function getDegradationPolicy(tier: MobileNetworkTier): DegradationPolicy {
  return NETWORK_DEGRADATION_POLICY.find((p) => p.tier === tier)!;
}
