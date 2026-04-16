import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * StatTile — compact at-a-glance metric block.
 * Class: PRIMITIVE.
 */
export interface StatTileProps {
  label: string;
  value: ReactNode;
  delta?: string;
  tone?: "neutral" | "positive" | "negative" | "warning";
  icon?: ReactNode;
  className?: string;
}

const TONE_CLASSES: Record<NonNullable<StatTileProps["tone"]>, string> = {
  neutral:  "text-foreground",
  positive: "text-trust-safe",
  negative: "text-destructive",
  warning:  "text-urgency-high",
};

export function StatTile({ label, value, delta, tone = "neutral", icon, className }: StatTileProps) {
  return (
    <div className={cn("rounded-xl border border-border/40 bg-card/60 p-3", className)}>
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
          {label}
        </p>
        {icon && <span className="text-muted-foreground/60">{icon}</span>}
      </div>
      <p className={cn("mt-1 font-display text-xl font-semibold tabular-nums", TONE_CLASSES[tone])}>
        {value}
      </p>
      {delta && <p className="mt-0.5 text-[10px] text-muted-foreground">{delta}</p>}
    </div>
  );
}
