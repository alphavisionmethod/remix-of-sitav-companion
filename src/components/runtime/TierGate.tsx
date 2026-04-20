import { type ReactNode } from "react";
import { useFeatureRuntimeTier, useRuntimeTier } from "@/runtimes/runtime-context";
import type { RuntimeTier, TierAvailability } from "@/runtimes/runtime-tier-model";
import { getFeatureRuntimeTier } from "@/runtimes/feature-runtime-tier-registry";
import { DegradedStatePanel } from "@/components/reality/DegradedStatePanel";

interface TierGateProps {
  /** Feature ID registered in `feature-tier-registry`. */
  featureId: string;
  /** Tiers (or single tier) at which the gate considers the feature truly available. */
  requireTier?: RuntimeTier | readonly RuntimeTier[];
  /** Acceptable availability statuses. Defaults to ['supported']. */
  acceptStatuses?: readonly TierAvailability[];
  /** Render when the gate is open. */
  children: ReactNode;
  /** Custom node to render when gate is closed (overrides default panel). */
  fallback?: ReactNode;
  /** Pass-through for the honest-degradation panel. */
  surfaceClass?: "user_app" | "admin_os";
}

/**
 * <TierGate> — runtime-honest feature gate.
 *
 * Renders children only when the feature is available at the active tier.
 * Otherwise renders an honest-degradation panel that explains *why*.
 */
export function TierGate({
  featureId,
  requireTier,
  acceptStatuses = ["supported"],
  children,
  fallback,
  surfaceClass = "user_app",
}: TierGateProps) {
  const activeTier = useRuntimeTier();
  const status = useFeatureRuntimeTier(featureId);
  const feature = getFeatureRuntimeTier(featureId);

  // When `requireTier` is omitted, derive the allow-list from the
  // registry's `supportedTiers` so callers never need to repeat what the
  // registry already knows. Explicit `requireTier` still wins.
  const effectiveRequireTier: readonly RuntimeTier[] | undefined = requireTier
    ? Array.isArray(requireTier)
      ? (requireTier as readonly RuntimeTier[])
      : [requireTier as RuntimeTier]
    : feature?.supportedTiers;

  const tierMatches = effectiveRequireTier
    ? effectiveRequireTier.includes(activeTier)
    : true;

  const statusOk = acceptStatuses.includes(status);

  if (tierMatches && statusOk) {
    return <>{children}</>;
  }

  if (fallback !== undefined) return <>{fallback}</>;

  const reason =
    status === "prohibited"
      ? `${feature?.name ?? featureId} is not available on this runtime (${activeTier}).`
      : status === "fallback"
      ? `${feature?.name ?? featureId} runs in degraded mode here.`
      : status === "simulated"
      ? `${feature?.name ?? featureId} is shown as a simulation on this runtime.`
      : status === "roadmap"
      ? `${feature?.name ?? featureId} is on the roadmap for this runtime.`
      : `${feature?.name ?? featureId} is unavailable here.`;

  return (
    <DegradedStatePanel
      degradedReason={reason}
      nextStep={feature?.fallback}
      surfaceClass={surfaceClass}
    />
  );
}
