// ═══════════════════════════════════════════════════════════════
// Shared — Reality State Badge
// Renders mode badge adapted by surface class posture
// ═══════════════════════════════════════════════════════════════

import { Badge } from "@/components/ui/badge";
import { Shield, Play, FlaskConical, Eye, Clock, Ban } from "lucide-react";
import type { SurfaceClass } from "@/lib/dual-reality/surface-class-registry";

type StateClass = "live" | "limited" | "demo" | "unavailable" | "coming_soon" | "internal_preview";

interface RealityStateBadgeProps {
  stateClass: StateClass;
  surfaceClass?: SurfaceClass;
  compact?: boolean;
}

const STATE_CONFIG: Record<StateClass, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  live: { label: "Live", icon: Shield, className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  limited: { label: "Limited", icon: Eye, className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  demo: { label: "Demo", icon: Play, className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  unavailable: { label: "Unavailable", icon: Ban, className: "bg-destructive/15 text-destructive border-destructive/30" },
  coming_soon: { label: "Coming Soon", icon: Clock, className: "bg-muted text-muted-foreground border-border" },
  internal_preview: { label: "Internal", icon: FlaskConical, className: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
};

export function RealityStateBadge({ stateClass, surfaceClass = "user_app", compact = false }: RealityStateBadgeProps) {
  const config = STATE_CONFIG[stateClass];
  const Icon = config.icon;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-mono ${config.className} rounded px-1.5 py-0.5`}>
        <Icon className="h-2.5 w-2.5" />
        {config.label}
      </span>
    );
  }

  return (
    <Badge variant="outline" className={`${config.className} gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
