import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Summary — concise read-only digest primitive.
 * Class: PRIMITIVE.
 */
export interface SummaryProps {
  label: string;
  value: ReactNode;
  trend?: "up" | "down" | "flat";
  hint?: string;
  className?: string;
}

export function Summary({ label, value, trend, hint, className }: SummaryProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <p className="font-display text-2xl font-light tracking-[-0.02em] text-foreground tabular-nums">
          {value}
        </p>
        {trend && (
          <span
            className={cn(
              "text-xs font-semibold px-1.5 py-0.5 rounded-full",
              trend === "up" && "text-trust-safe bg-[hsl(var(--trust-safe)/0.1)]",
              trend === "down" && "text-urgency-high bg-[hsl(var(--urgency-high)/0.1)]",
              trend === "flat" && "text-muted-foreground bg-muted/50"
            )}
          >
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "—"}
          </span>
        )}
      </div>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
