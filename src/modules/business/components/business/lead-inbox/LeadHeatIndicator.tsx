import { cn } from "@/lib/utils";
import type { HeatStatus, UrgencyBand } from "@/domains/engines/lead-scoring-engine";
import { HEAT_STATUS_META, URGENCY_BAND_META } from "@/domains/engines/lead-scoring-engine";
import { TrendingUp, TrendingDown, Minus, RotateCcw, Flame } from "lucide-react";

const heatIcon: Record<HeatStatus, typeof Flame> = {
  hot: Flame, warm: TrendingUp, cooling: TrendingDown,
  cold: Minus, recovering: RotateCcw,
};

const heatGlow: Record<HeatStatus, string> = {
  hot: "shadow-[0_0_8px_hsl(var(--urgency-critical)/0.3)]",
  warm: "shadow-[0_0_6px_hsl(var(--urgency-high)/0.2)]",
  cooling: "", cold: "", recovering: "shadow-[0_0_6px_hsl(var(--accent)/0.2)]",
};

interface Props {
  heat: HeatStatus;
  urgency?: UrgencyBand;
  size?: "xs" | "sm" | "md";
  showUrgency?: boolean;
  className?: string;
}

export const LeadHeatIndicator = ({ heat, urgency, size = "sm", showUrgency = false, className }: Props) => {
  const Icon = heatIcon[heat];
  const meta = HEAT_STATUS_META[heat];
  const iconSize = { xs: "h-2.5 w-2.5", sm: "h-3 w-3", md: "h-3.5 w-3.5" };
  const textSize = { xs: "text-[9px]", sm: "text-[10px]", md: "text-xs" };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className={cn(
        "flex items-center gap-1 rounded-full px-1.5 py-0.5",
        heatGlow[heat],
        textSize[size]
      )} style={{ color: meta.color }}>
        <Icon className={cn(iconSize[size], heat === "hot" && "animate-pulse")} />
        <span className="font-medium">{meta.label}</span>
      </div>
      {showUrgency && urgency && (
        <span className={cn(textSize[size], "text-muted-foreground")}>
          · {URGENCY_BAND_META[urgency].label}
        </span>
      )}
    </div>
  );
};
