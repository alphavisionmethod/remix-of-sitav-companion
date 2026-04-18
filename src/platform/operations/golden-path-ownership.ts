// ═══════════════════════════════════════════════════════════════
// SITA OS — Golden Path Ownership Map
// Authoritative team ownership and escalation routing per path.
// Derived from the registry but exposed as a stable lookup so
// admin surfaces and runbooks can query it without re-walking.
// ═══════════════════════════════════════════════════════════════

import type { GoldenPathId, GoldenPathOwnership } from "./golden-path-types";
import { GOLDEN_PATH_REGISTRY, getOwnerships } from "./golden-path-registry";

export const GOLDEN_PATH_OWNERSHIP: readonly GoldenPathOwnership[] = getOwnerships();

const OWNERSHIP_BY_PATH: ReadonlyMap<GoldenPathId, GoldenPathOwnership> = new Map(
  GOLDEN_PATH_OWNERSHIP.map((o) => [o.pathId, o])
);

const PATHS_BY_TEAM: ReadonlyMap<string, readonly GoldenPathId[]> = (() => {
  const map = new Map<string, GoldenPathId[]>();
  for (const o of GOLDEN_PATH_OWNERSHIP) {
    const arr = map.get(o.ownerTeam) ?? [];
    arr.push(o.pathId);
    map.set(o.ownerTeam, arr);
  }
  return map;
})();

export function getOwnership(pathId: GoldenPathId): GoldenPathOwnership | undefined {
  return OWNERSHIP_BY_PATH.get(pathId);
}

export function getPathsForOwnerTeam(team: string): readonly GoldenPathId[] {
  return PATHS_BY_TEAM.get(team) ?? [];
}

export function listOwnerTeams(): readonly string[] {
  return Array.from(PATHS_BY_TEAM.keys());
}

export function getCriticalityForOwnerTeam(team: string): {
  p0: number;
  p1: number;
  p2: number;
} {
  const ids = new Set(getPathsForOwnerTeam(team));
  let p0 = 0, p1 = 0, p2 = 0;
  for (const p of GOLDEN_PATH_REGISTRY) {
    if (!ids.has(p.pathId)) continue;
    if (p.criticality === "P0") p0++;
    else if (p.criticality === "P1") p1++;
    else p2++;
  }
  return { p0, p1, p2 };
}
