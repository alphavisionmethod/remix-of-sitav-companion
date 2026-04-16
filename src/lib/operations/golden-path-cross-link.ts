// ═══════════════════════════════════════════════════════════════
// SITA OS — Golden Path Cross-Link Maps
// Reverse indexes from kill switches and runbooks back to the
// Golden Paths that depend on them. Used by admin surfaces to
// answer questions like "if I arm KS-OUTBOUND, what breaks?".
// ═══════════════════════════════════════════════════════════════

import type { GoldenPathId } from "./golden-path-types";
import { GOLDEN_PATH_REGISTRY } from "./golden-path-registry";

export const GOLDEN_PATHS_BY_KILL_SWITCH: ReadonlyMap<string, readonly GoldenPathId[]> = (() => {
  const map = new Map<string, GoldenPathId[]>();
  for (const p of GOLDEN_PATH_REGISTRY) {
    const switches = new Set<string>([
      ...p.blockingKillSwitches,
      ...p.steps.flatMap((s) => s.blockingKillSwitches),
    ]);
    for (const sw of switches) {
      const arr = map.get(sw) ?? [];
      arr.push(p.pathId);
      map.set(sw, arr);
    }
  }
  return map;
})();

export const GOLDEN_PATHS_BY_RUNBOOK: ReadonlyMap<string, readonly GoldenPathId[]> = (() => {
  const map = new Map<string, GoldenPathId[]>();
  for (const p of GOLDEN_PATH_REGISTRY) {
    const runbooks = new Set<string>([
      ...p.recoveryRunbookRefs,
      ...p.steps.flatMap((s) => s.recoveryRunbookRefs),
    ]);
    for (const rb of runbooks) {
      const arr = map.get(rb) ?? [];
      arr.push(p.pathId);
      map.set(rb, arr);
    }
  }
  return map;
})();

export const GOLDEN_PATHS_BY_CONTEXT: ReadonlyMap<string, readonly GoldenPathId[]> = (() => {
  const map = new Map<string, GoldenPathId[]>();
  for (const p of GOLDEN_PATH_REGISTRY) {
    for (const ctx of p.contextIds) {
      const arr = map.get(ctx) ?? [];
      arr.push(p.pathId);
      map.set(ctx, arr);
    }
  }
  return map;
})();

export function getGoldenPathIdsForKillSwitch(switchId: string): readonly GoldenPathId[] {
  return GOLDEN_PATHS_BY_KILL_SWITCH.get(switchId) ?? [];
}

export function getGoldenPathIdsForRunbook(runbookId: string): readonly GoldenPathId[] {
  return GOLDEN_PATHS_BY_RUNBOOK.get(runbookId) ?? [];
}

export function getGoldenPathIdsForContext(contextId: string): readonly GoldenPathId[] {
  return GOLDEN_PATHS_BY_CONTEXT.get(contextId) ?? [];
}
