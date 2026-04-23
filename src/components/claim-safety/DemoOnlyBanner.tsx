// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo-Only Banner (Claim-Safety)
// Page-top banner that visibly contains demo / preview / future-vision surfaces.
// Reads canonical truth from src/lib/claim-safety/demo-only-surface-registry.ts.
// ═══════════════════════════════════════════════════════════════

import { AlertTriangle, Beaker, Telescope, Archive } from "lucide-react";
import {
  getDemoOnlySurface,
  type ContainmentLevel,
  type DemoOnlySurface,
} from "@/lib/claim-safety/demo-only-surface-registry";

interface DemoOnlyBannerProps {
  /** Surface ID — must match an entry in ONLY_SURFACES. */
  surfaceId: string;
  /** Optional className passthrough. */
  className?: string;
}

const CONTAINMENT_CONFIG: Record<
  ContainmentLevel,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    primaryCopy: string;
    bgClass: string;
    borderClass: string;
    iconClass: string;
    textClass: string;
  }
> = {
  demo_only: {
    icon: Beaker,
    label: "Demo Preview",
    primaryCopy: "Demo preview — not launch-live. Data shown is seeded or simulated.",
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/30",
    iconClass: "text-blue-400",
    textClass: "text-blue-100",
  },
  internal_preview: {
    icon: AlertTriangle,
    label: "Internal Preview",
    primaryCopy: "Internal operator surface — not user-facing. Used for readiness review.",
    bgClass: "bg-purple-500/10",
    borderClass: "border-purple-500/30",
    iconClass: "text-purple-400",
    textClass: "text-purple-100",
  },
  future_vision: {
    icon: Telescope,
    label: "Future Vision",
    primaryCopy: "Future-vision research — not on any current launch track. Behaviors are exploratory.",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/30",
    iconClass: "text-amber-400",
    textClass: "text-amber-100",
  },
  archived: {
    icon: Archive,
    label: "Archived",
    primaryCopy: "Archived surface — preserved for reference; reactivation requires a documented checklist.",
    bgClass: "bg-muted/40",
    borderClass: "border-border",
    iconClass: "text-muted-foreground",
    textClass: "text-foreground",
  },
};

export function DemoOnlyBanner({ surfaceId, className = "" }: DemoOnlyBannerProps) {
  const surface: DemoOnlySurface | undefined = getDemoOnlySurface(surfaceId);
  if (!surface) return null;

  const config = CONTAINMENT_CONFIG[surface.containment];
  const Icon = config.icon;

  return (
    <div
      role="status"
      aria-label={`${config.label} — ${surface.surfaceName}`}
      className={`flex items-start gap-3 rounded-md border ${config.bgClass} ${config.borderClass} px-4 py-3 ${className}`}
      data-claim-safety-banner={surface.containment}
      data-surface-id={surface.surfaceId}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${config.iconClass}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-semibold ${config.textClass}`}>{config.label}</span>
          <span className="text-xs text-muted-foreground font-mono">{surface.surfaceId}</span>
        </div>
        <p className={`text-sm mt-1 ${config.textClass}`}>{config.primaryCopy}</p>
        <p className="text-xs text-muted-foreground mt-1.5">{surface.rationale}</p>
      </div>
    </div>
  );
}
