// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Truth Classification
// Maps routes/features to their truth tier
// References dual-reality — does NOT duplicate
// ═══════════════════════════════════════════════════════════════

import type { RealityModeKey } from "@/lib/dual-reality/reality-mode-registry";
import { isSideEffectSafe } from "@/lib/dual-reality/reality-mode-registry";
import type { ProductRealityTier } from "./product-reality-tiers";

export interface TruthClassificationEntry {
  /** Route path or feature key */
  key: string;
  /** Display name */
  name: string;
  /** Current reality tier */
  tier: ProductRealityTier;
  /** Which reality modes this works in */
  supportedModes: RealityModeKey[];
  /** Whether this feature has real data backing */
  hasRealData: boolean;
  /** Whether side effects are live */
  sideEffectsLive: boolean;
  /** Notes for admin/developer */
  notes?: string;
}

/**
 * Canonical truth classification registry.
 * Each entry maps a route or feature to its truth tier.
 */
export const TRUTH_CLASSIFICATIONS: TruthClassificationEntry[] = [
  // ── T1 Proven ──
  { key: "/auth", name: "Authentication", tier: "T1", supportedModes: ["real", "demo", "sandbox", "dev_demo"], hasRealData: true, sideEffectsLive: true },
  { key: "/settings", name: "User Settings", tier: "T1", supportedModes: ["real", "demo", "sandbox", "dev_demo"], hasRealData: true, sideEffectsLive: true },

  // ── T2 Real with Gaps ──
  { key: "/business", name: "Business OS", tier: "T2", supportedModes: ["real", "demo", "dev_demo"], hasRealData: true, sideEffectsLive: false, notes: "CRM real, some connectors pending" },
  { key: "/finance", name: "Finance OS", tier: "T2", supportedModes: ["real", "demo", "dev_demo"], hasRealData: true, sideEffectsLive: false, notes: "Core accounting real, projections AI-assisted" },
  { key: "/concierge", name: "Concierge OS", tier: "T2", supportedModes: ["real", "demo", "dev_demo"], hasRealData: true, sideEffectsLive: false, notes: "Scheduling real, some automations pending" },

  // ── T3 Simulated ──
  { key: "/boardroom", name: "Boardroom", tier: "T3", supportedModes: ["demo", "dev_demo", "sandbox"], hasRealData: false, sideEffectsLive: false, notes: "Scenario-grounded AI decisions" },
  { key: "/mission-control", name: "Mission Control", tier: "T3", supportedModes: ["real", "demo", "dev_demo"], hasRealData: false, sideEffectsLive: false },

  // ── T4 Presentational ──
  { key: "/mobile", name: "Mobile Surface", tier: "T4", supportedModes: ["demo", "dev_demo"], hasRealData: false, sideEffectsLive: false, notes: "Visual preview of mobile shell" },
];

export function getClassification(key: string): TruthClassificationEntry | undefined {
  return TRUTH_CLASSIFICATIONS.find((c) => c.key === key);
}

export function getClassificationsByTier(tier: ProductRealityTier): TruthClassificationEntry[] {
  return TRUTH_CLASSIFICATIONS.filter((c) => c.tier === tier);
}

/**
 * Check if a route is safe to show in a given reality mode.
 */
export function isRouteAvailableInMode(routeKey: string, mode: RealityModeKey): boolean {
  const entry = getClassification(routeKey);
  if (!entry) return true; // unclassified routes are allowed by default
  return entry.supportedModes.includes(mode);
}
