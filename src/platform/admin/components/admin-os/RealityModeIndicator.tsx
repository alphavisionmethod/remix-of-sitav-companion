// ═══════════════════════════════════════════════════════════════
// Admin OS — Reality Mode Indicator (top bar)
// ═══════════════════════════════════════════════════════════════

import { useRealityModeSafe } from "@/lib/dual-reality";
import { Badge } from "@/components/ui/badge";
import { Shield, Play, FlaskConical, Eye } from "lucide-react";

const MODE_CONFIG = {
  real: { label: "REAL", icon: Shield, variant: "default" as const, className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  demo: { label: "DEMO", icon: Play, variant: "outline" as const, className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  sandbox: { label: "SANDBOX", icon: FlaskConical, variant: "outline" as const, className: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  dev_demo: { label: "DEV DEMO", icon: Eye, variant: "outline" as const, className: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" },
} as const;

export function RealityModeIndicator() {
  const { mode, resolution } = useRealityModeSafe();
  const config = MODE_CONFIG[mode];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`${config.className} font-mono text-[10px] gap-1 px-2 py-0.5`}>
      <Icon className="h-3 w-3" />
      {config.label}
      <span className="text-[9px] opacity-60">via {resolution.source.replace(/_/g, " ")}</span>
    </Badge>
  );
}
