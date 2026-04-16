// ═══════════════════════════════════════════════════════════════
// SITA OS — TierBadge + ShellSimulationBanner
// Tier 4 (Simulated OS) honesty surface tags. Premium, minimal,
// composable. Used by shell components (Dock, LockScreen,
// MissionControl, ControlCenter) to never claim host authority.
// ═══════════════════════════════════════════════════════════════

import { Sparkles, Monitor, ServerCog, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRuntimeTier, useFeatureRuntimeTier } from "@/lib/runtime/runtime-context";
import { getFeatureRuntimeTier } from "@/lib/runtime/feature-runtime-tier-registry";
import { cn } from "@/lib/utils";

const TIER_META: Record<string, { label: string; icon: typeof Globe }> = {
  WEB_APP: { label: "Web", icon: Globe },
  DESKTOP_HOST: { label: "Desktop", icon: Monitor },
  APPLIANCE_RUNTIME: { label: "Appliance", icon: ServerCog },
  SIMULATED_OS_EXPERIENCE: { label: "Simulated", icon: Sparkles },
};

interface TierBadgeProps {
  featureId?: string;
  className?: string;
  /** Render even when the feature is fully supported. Default false (only show when not "supported"). */
  alwaysShow?: boolean;
}

/**
 * <TierBadge> — micro-tag for any shell affordance that may misrepresent
 * its underlying authority. Stays silent when the feature is honestly supported.
 */
export function TierBadge({ featureId, className, alwaysShow = false }: TierBadgeProps) {
  const tier = useRuntimeTier();
  const status = featureId ? useFeatureRuntimeTier(featureId) : "supported";
  const meta = TIER_META[tier];
  const Icon = meta.icon;

  if (!alwaysShow && status === "supported") return null;

  const statusLabel =
    status === "simulated"
      ? "Simulated"
      : status === "fallback"
      ? "Fallback"
      : status === "prohibited"
      ? "Unavailable"
      : status === "roadmap"
      ? "Coming"
      : meta.label;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 text-[10px] font-medium px-1.5 py-0 h-4 border-border/40 bg-background/40 backdrop-blur",
        className,
      )}
      title={`Active runtime tier: ${tier}`}
    >
      <Icon className="h-2.5 w-2.5 opacity-70" />
      {statusLabel}
    </Badge>
  );
}

interface ShellSimulationBannerProps {
  featureId: string;
  className?: string;
}

/**
 * <ShellSimulationBanner> — subtle one-line banner placed inside
 * shell surfaces (Dock, LockScreen, MissionControl) to honestly
 * disclose simulation. Hidden when the feature is supported.
 */
export function ShellSimulationBanner({ featureId, className }: ShellSimulationBannerProps) {
  const tier = useRuntimeTier();
  const status = useFeatureRuntimeTier(featureId);
  const feature = getFeatureRuntimeTier(featureId);

  if (status === "supported") return null;

  return (
    <div
      className={cn(
        "px-3 py-1 text-[10px] text-muted-foreground/80 border-t border-border/20 bg-background/30 backdrop-blur flex items-center gap-1.5",
        className,
      )}
    >
      <Sparkles className="h-2.5 w-2.5 opacity-60" />
      <span className="truncate">
        {feature?.name ?? featureId} on {tier} —{" "}
        <span className="opacity-80">{status === "simulated" ? "simulated UX" : status}</span>
        {feature?.fallback ? ` · ${feature.fallback}` : ""}
      </span>
    </div>
  );
}
