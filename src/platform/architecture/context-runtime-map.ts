// ═══════════════════════════════════════════════════════════════
// SITA OS — Context → Runtime Tier Map (derived view)
// ═══════════════════════════════════════════════════════════════

import { BOUNDED_CONTEXT_REGISTRY } from "./bounded-context-registry";
import type { BoundedContextId, RuntimeTier, DeploymentUnit } from "./bounded-context-types";

export const CONTEXT_RUNTIME_TIERS: Readonly<Record<BoundedContextId, readonly RuntimeTier[]>> =
  Object.freeze(
    BOUNDED_CONTEXT_REGISTRY.reduce((acc, c) => {
      acc[c.contextId] = c.runtimeTiersSupported;
      return acc;
    }, {} as Record<BoundedContextId, readonly RuntimeTier[]>)
  );

export const CONTEXT_DEPLOYMENT_UNIT: Readonly<Record<BoundedContextId, DeploymentUnit>> =
  Object.freeze(
    BOUNDED_CONTEXT_REGISTRY.reduce((acc, c) => {
      acc[c.contextId] = c.deploymentUnit;
      return acc;
    }, {} as Record<BoundedContextId, DeploymentUnit>)
  );

export function getContextsForRuntimeTier(tier: RuntimeTier): readonly BoundedContextId[] {
  return BOUNDED_CONTEXT_REGISTRY
    .filter((c) => c.runtimeTiersSupported.includes(tier))
    .map((c) => c.contextId);
}

export function getContextsForDeploymentUnit(unit: DeploymentUnit): readonly BoundedContextId[] {
  return BOUNDED_CONTEXT_REGISTRY
    .filter((c) => c.deploymentUnit === unit)
    .map((c) => c.contextId);
}

export function isContextSupportedOnTier(id: BoundedContextId, tier: RuntimeTier): boolean {
  return CONTEXT_RUNTIME_TIERS[id]?.includes(tier) ?? false;
}
