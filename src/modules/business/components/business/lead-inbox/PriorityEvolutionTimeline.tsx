import { cn } from "@/lib/utils";
import type { HeatStatus } from "@/domains/business";
import { TrendingUp, TrendingDown, Minus, RotateCcw } from "lucide-react";

const trendConfig: Record<string, { icon: typeof TrendingUp; label: string; color: string }> = {
  rising: { icon: TrendingUp, label: "Rising", color: "text-[hsl(var(--trust-safe))]" },
  steady: { icon: Minus, label: "Steady", color: "text-muted-foreground" },
  cooling: { icon: TrendingDown, label: "Cooling", color: "text-[hsl(var(--sita-gold))]" },
  recovering: { icon: RotateCcw, label: "Recovering", color: "text-accent" },
  declining: { icon: TrendingDown, label: "Declining", color: "text-[hsl(var(--urgency-high))]" },
};

function deriveTrend(heat: HeatStatus, staleRisk: number, score: number): string {
  if (heat === "recovering") return "recovering";
  if (heat === "hot" && staleRisk < 20) return "rising";
  if (heat === "cold" || staleRisk > 70) return "declining";
  if (heat === "cooling" || staleRisk > 40) return "cooling";
  return "steady";
}

interface Props {
  heat: HeatStatus;
  staleRisk: number;
  priorityScore: number;
  compact?: boolean;
  className?: string;
}

export const PriorityEvolutionTimeline = ({ heat, staleRisk, priorityScore, compact = false, className }: Props) => {
  const trend = deriveTrend(heat, staleRisk, priorityScore);
  const config = trendConfig[trend];
  const Icon = config.icon;

  // Generate mini sparkline dots
  const dots = [
    Math.max(20, priorityScore - 15 + (trend === "rising" ? -10 : trend === "declining" ? 10 : 0)),
    Math.max(15, priorityScore - 8 + (trend === "rising" ? -5 : trend === "declining" ? 5 : 0)),
    priorityScore,
    Math.min(100, priorityScore + (trend === "rising" ? 5 : trend === "declining" ? -8 : 0)),
    Math.min(100, priorityScore + (trend === "rising" ? 10 : trend === "declining" ? -15 : 2)),
  ];

  const max = Math.max(...dots);
  const min = Math.min(...dots);
  const range = max - min || 1;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1", config.color, className)}>
        <Icon className="h-3 w-3" />
        <span className="text-[9px] font-medium">{config.label}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-end gap-px h-4">
        {dots.map((d, i) => (
          <div
            key={i}
            className={cn("w-1 rounded-full transition-all", config.color.replace("text-", "bg-"))}
            style={{
              height: `${Math.max(3, ((d - min) / range) * 16)}px`,
              backgroundColor: i === dots.length - 1
                ? config.color.match(/\[(.+)\]/)?.[1] || "currentColor"
                : undefined,
              opacity: i < dots.length - 1 ? 0.4 : 1,
            }}
          />
        ))}
      </div>
      <div className={cn("flex items-center gap-1", config.color)}>
        <Icon className="h-3 w-3" />
        <span className="text-[10px] font-medium">{config.label}</span>
      </div>
    </div>
  );
};
