// ═══════════════════════════════════════════════════════════════
// SITA OS — Future Vision Badge (Claim-Safety)
// Compact badge variant for cards, tables, headers on demo-only surfaces.
// Wraps LaunchHonestyBadge with future-vision-aware variants.
// ═══════════════════════════════════════════════════════════════

import { Badge } from "@/components/ui/badge";
import { Beaker, AlertTriangle, Telescope, Archive } from "lucide-react";
import type { ContainmentLevel } from "@/lib/claim-safety/demo-only-surface-registry";

interface FutureVisionBadgeProps {
  containment: ContainmentLevel;
  compact?: boolean;
}

const CONFIG: Record<
  ContainmentLevel,
  { label: string; icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  demo_only: {
    label: "Demo",
    icon: Beaker,
    className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  internal_preview: {
    label: "Internal",
    icon: AlertTriangle,
    className: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  },
  future_vision: {
    label: "Future Vision",
    icon: Telescope,
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  archived: {
    label: "Archived",
    icon: Archive,
    className: "bg-muted/50 text-muted-foreground border-border",
  },
};

export function FutureVisionBadge({ containment, compact = false }: FutureVisionBadgeProps) {
  const cfg = CONFIG[containment];
  const Icon = cfg.icon;

  return (
    <Badge variant="outline" className={`${cfg.className} gap-1 ${compact ? "text-[10px] px-1.5 py-0" : ""}`}>
      <Icon className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {cfg.label}
    </Badge>
  );
}
