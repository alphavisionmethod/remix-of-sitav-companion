// ════════════════════════════════════════════════════════════
// SITA OS — 4-Module Pillar Registry
// Single source of truth for module identity. Used by:
//   - App launcher (priority ordering)
//   - Top-level navigation
//   - Architecture validator
// ════════════════════════════════════════════════════════════

import { BUSINESS_PILLAR } from "./business";
import { CONCIERGE_PILLAR } from "./concierge";
import { FINANCE_PILLAR } from "./finance";
import { HEALTH_PILLAR } from "./health";
import { TRUST_LAYER } from "@/platform/trust";
import { SHARED_LAYER } from "@/platform/shared-layer";

export const PILLARS = [
  BUSINESS_PILLAR,
  CONCIERGE_PILLAR,
  FINANCE_PILLAR,
  HEALTH_PILLAR,
] as const;

export const PLATFORM_LAYERS = [TRUST_LAYER, SHARED_LAYER] as const;

export type PillarId = (typeof PILLARS)[number]["id"];
export type PlatformLayerId = (typeof PLATFORM_LAYERS)[number]["id"];

export {
  BUSINESS_PILLAR,
  CONCIERGE_PILLAR,
  FINANCE_PILLAR,
  HEALTH_PILLAR,
  TRUST_LAYER,
  SHARED_LAYER,
};

/** Pillars sorted by launcherPriority (1 → 4). */
export const PILLARS_BY_LAUNCHER_PRIORITY = [...PILLARS].sort(
  (a, b) => a.launcherPriority - b.launcherPriority,
);

/** Find which pillar owns a given absolute route (best-prefix match). */
export function pillarForRoute(path: string): typeof PILLARS[number] | null {
  let best: typeof PILLARS[number] | null = null;
  let bestLen = 0;
  for (const p of PILLARS) {
    const prefixes = [p.routePrefix, ...((p as { routeAliases?: readonly string[] }).routeAliases ?? [])];
    for (const pref of prefixes) {
      if (path === pref || path.startsWith(pref + "/")) {
        if (pref.length > bestLen) {
          best = p;
          bestLen = pref.length;
        }
      }
    }
  }
  return best;
}

/** Flat capability index for nav, search, validator. */
export const ALL_CAPABILITIES = PILLARS.flatMap((p) =>
  p.capabilities.map((c) => ({ pillarId: p.id, pillarLabel: p.label, ...c })),
);