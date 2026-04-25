// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust Posture Chip
// Compact trust state indicator for top bar and shell surfaces
// ═══════════════════════════════════════════════════════════════

import { Shield, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type TrustPosture = "secure" | "attention" | "warning" | "critical";

const config: Record<TrustPosture, { icon: React.ElementType; label: string; color: string; bg: string; tooltip: string }> = {
  secure: { icon: ShieldCheck, label: "Secure", color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10", tooltip: "All systems secure. No issues detected." },
  attention: { icon: Shield, label: "Attention", color: "text-[hsl(var(--sita-gold))]", bg: "bg-[hsl(var(--sita-gold))]/10", tooltip: "Active incidents require attention." },
  warning: { icon: ShieldAlert, label: "Warning", color: "text-amber-500", bg: "bg-amber-500/10", tooltip: "Elevated approval queue. Review pending items." },
  critical: { icon: ShieldX, label: "Critical", color: "text-destructive", bg: "bg-destructive/10", tooltip: "Critical incidents detected. Immediate review needed." },
};

interface TrustPostureChipProps {
  posture: TrustPosture;
  showLabel?: boolean;
  className?: string;
}

export function TrustPostureChip({ posture, showLabel = true, className }: TrustPostureChipProps) {
  const c = config[posture];
  const Icon = c.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors cursor-default",
          c.bg, className
        )}>
          <Icon className={cn("h-3.5 w-3.5", c.color)} />
          {showLabel && (
            <span className={cn("text-[10px] font-semibold", c.color)}>{c.label}</span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs max-w-[200px]">
        {c.tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
