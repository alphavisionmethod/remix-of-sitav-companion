import { type ReactNode } from "react";
import { useFeatureTier, useRuntimeTier } from "@/lib/runtime/runtime-context";
import type { RuntimeTier, TierAvailability } from "@/lib/runtime/runtime-tier-model";
import { getFeatureTier } from "@/lib/runtime/feature-tier-registry";
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
  const status = useFeatureTier(featureId);
  const feature = getFeatureTier(featureId);

  const tierMatches = requireTier
    ? Array.isArray(requireTier)
      ? (requireTier as readonly RuntimeTier[]).includes(activeTier)
      : requireTier === activeTier
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
