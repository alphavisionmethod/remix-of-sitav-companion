import { cn } from "@/lib/utils";
import type { PriorityTier } from "@/domains/business";
import { PRIORITY_TIER_META } from "@/domains/engines/lead-scoring-engine";
import { Flame, ArrowUp, Eye, Sprout, RotateCcw, Minus } from "lucide-react";

const tierIcon: Record<PriorityTier, typeof Flame> = {
  "critical-now": Flame,
  "high-priority": ArrowUp,
  "active-watch": Eye,
  "nurture": Sprout,
  "recovery-candidate": RotateCcw,
  "low-priority": Minus,
};

const tierStyle: Record<PriorityTier, string> = {
  "critical-now": "bg-[hsl(var(--urgency-critical))]/15 text-[hsl(var(--urgency-critical))] border-[hsl(var(--urgency-critical))]/25",
  "high-priority": "bg-[hsl(var(--urgency-high))]/15 text-[hsl(var(--urgency-high))] border-[hsl(var(--urgency-high))]/25",
  "active-watch": "bg-[hsl(var(--sita-gold))]/15 text-[hsl(var(--sita-gold))] border-[hsl(var(--sita-gold))]/25",
  "nurture": "bg-[hsl(var(--trust-safe))]/15 text-[hsl(var(--trust-safe))] border-[hsl(var(--trust-safe))]/25",
  "recovery-candidate": "bg-accent/15 text-accent border-accent/25",
  "low-priority": "bg-muted/30 text-muted-foreground border-border/30",
};

interface Props {
  tier: PriorityTier;
  size?: "xs" | "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export const LeadPriorityBadge = ({ tier, size = "sm", showLabel = true, className }: Props) => {
  const Icon = tierIcon[tier];
  const meta = PRIORITY_TIER_META[tier];

  const sizeClasses = {
    xs: "text-[9px] px-1.5 py-px gap-0.5",
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  const iconSize = { xs: "h-2.5 w-2.5", sm: "h-3 w-3", md: "h-3.5 w-3.5" };

  return (
    <span className={cn(
      "inline-flex items-center font-semibold rounded-full border whitespace-nowrap",
      sizeClasses[size], tierStyle[tier], className
    )}>
      <Icon className={iconSize[size]} />
      {showLabel && meta.label}
    </span>
  );
};
