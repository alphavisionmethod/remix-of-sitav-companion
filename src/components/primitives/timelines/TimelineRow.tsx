import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * TimelineRow — canonical timeline event row primitive.
 * Class: PRIMITIVE.
 */
export interface TimelineRowProps {
  label: ReactNode;
  meta?: ReactNode;
  status?: "done" | "current" | "pending" | "failed";
  icon?: ReactNode;
  isLast?: boolean;
  className?: string;
}

const DOT_TONES: Record<NonNullable<TimelineRowProps["status"]>, string> = {
  done:    "bg-trust-safe",
  current: "bg-primary ring-2 ring-primary/30",
  pending: "bg-muted",
  failed:  "bg-destructive",
};

export function TimelineRow({ label, meta, status = "pending", icon, isLast, className }: TimelineRowProps) {
  return (
    <div className={cn("relative flex gap-3", className)}>
      <div className="flex flex-col items-center">
        <div className={cn("mt-1 h-2 w-2 rounded-full shrink-0", DOT_TONES[status])}>
          {icon && <span className="sr-only">{status}</span>}
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 bg-border/50" />}
      </div>
      <div className="flex-1 pb-3 min-w-0">
        <div className="text-xs text-foreground truncate">{label}</div>
        {meta && <div className="text-[10px] text-muted-foreground mt-0.5">{meta}</div>}
      </div>
    </div>
  );
}
