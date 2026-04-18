// ═══════════════════════════════════════════════════════════════
// SITA OS — Degraded Network Policy Engine
// Bridges NetworkSnapshot → DegradationPolicy and exposes UI flags.
// ═══════════════════════════════════════════════════════════════

import type { NetworkSnapshot, DegradationPolicy } from "../contracts/network-degradation-contract";
import { getDegradationPolicy } from "../contracts/network-degradation-contract";

export function classifyNetwork(snap: NetworkSnapshot): DegradationPolicy {
  return getDegradationPolicy(snap.tier);
}

export function shouldQueueMutation(snap: NetworkSnapshot): boolean {
  return classifyNetwork(snap).queueMutations;
}

export function shouldShowOfflineBanner(snap: NetworkSnapshot): boolean {
  return classifyNetwork(snap).showBanner;
}
