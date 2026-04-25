// ═══════════════════════════════════════════════════════════════
// Shared — Launch Honesty Badge
// Shows the honesty classification for a capability/route
// ═══════════════════════════════════════════════════════════════

import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Play, Clock, Ban } from "lucide-react";

type HonestyClass = "truthful" | "qualified" | "demo_governed" | "partial" | "unavailable" | "planned" | "internal_only";

interface LaunchHonestyBadgeProps {
  honestyClass: HonestyClass;
  compact?: boolean;
}

const HONESTY_CONFIG: Record<HonestyClass, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  truthful: { label: "Real", icon: Shield, className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  qualified: { label: "Qualified", icon: AlertTriangle, className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  demo_governed: { label: "Demo", icon: Play, className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  partial: { label: "Partial", icon: AlertTriangle, className: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  unavailable: { label: "N/A", icon: Ban, className: "bg-destructive/15 text-destructive border-destructive/30" },
  planned: { label: "Planned", icon: Clock, className: "bg-muted text-muted-foreground border-border" },
  internal_only: { label: "Internal", icon: Shield, className: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
};

export function LaunchHonestyBadge({ honestyClass, compact = false }: LaunchHonestyBadgeProps) {
  const config = HONESTY_CONFIG[honestyClass];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} gap-1 ${compact ? "text-[10px] px-1.5 py-0" : ""}`}>
      <Icon className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {config.label}
    </Badge>
  );
}
