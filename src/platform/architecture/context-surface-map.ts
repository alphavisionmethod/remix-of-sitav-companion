// ═══════════════════════════════════════════════════════════════
// SITA OS — Context → Primary Surface Map (derived view)
// ═══════════════════════════════════════════════════════════════

import { BOUNDED_CONTEXT_REGISTRY } from "./bounded-context-registry";
import type { BoundedContextId, RuntimeTier } from "./bounded-context-types";

export const CONTEXT_PRIMARY_SURFACE: Readonly<Record<BoundedContextId, RuntimeTier>> =
  Object.freeze(
    BOUNDED_CONTEXT_REGISTRY.reduce((acc, c) => {
      acc[c.contextId] = c.primarySurface;
      return acc;
    }, {} as Record<BoundedContextId, RuntimeTier>)
  );

export function getPrimarySurface(id: BoundedContextId): RuntimeTier | undefined {
  return CONTEXT_PRIMARY_SURFACE[id];
}

export function getContextsByPrimarySurface(surface: RuntimeTier): readonly BoundedContextId[] {
  return BOUNDED_CONTEXT_REGISTRY
    .filter((c) => c.primarySurface === surface)
    .map((c) => c.contextId);
}
