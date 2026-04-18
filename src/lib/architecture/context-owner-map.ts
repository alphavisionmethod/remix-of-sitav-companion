// ═══════════════════════════════════════════════════════════════
// SITA OS — Context → Owner Map (derived view)
// ═══════════════════════════════════════════════════════════════

import { BOUNDED_CONTEXT_REGISTRY } from "./bounded-context-registry";
import type { BoundedContextId, BoundedContextOwner } from "./bounded-context-types";

export const CONTEXT_OWNER_MAP: Readonly<Record<BoundedContextId, BoundedContextOwner>> =
  Object.freeze(
    BOUNDED_CONTEXT_REGISTRY.reduce((acc, c) => {
      acc[c.contextId] = c.owner;
      return acc;
    }, {} as Record<BoundedContextId, BoundedContextOwner>)
  );

export const OWNER_TO_CONTEXTS: Readonly<Record<string, readonly BoundedContextId[]>> =
  Object.freeze(
    BOUNDED_CONTEXT_REGISTRY.reduce((acc, c) => {
      (acc[c.owner] ||= []).push(c.contextId);
      return acc;
    }, {} as Record<string, BoundedContextId[]>)
  );

export function getOwnerForContext(id: BoundedContextId): BoundedContextOwner | undefined {
  return CONTEXT_OWNER_MAP[id];
}

export function getContextsForOwner(owner: BoundedContextOwner): readonly BoundedContextId[] {
  return OWNER_TO_CONTEXTS[owner] || [];
}
