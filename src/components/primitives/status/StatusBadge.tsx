import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * StatusBadge — canonical status indicator.
 *
 * The single source of truth for compact status labels.
 * All domain badges should compose this with a specific `tone`.
 *
 * Class: PRIMITIVE.
 */
export type StatusTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "muted"
  | "verified"
  | "pending"
  | "failed";

export type StatusSize = "xs" | "sm" | "md";

export interface StatusBadgeProps {
  tone?: StatusTone;
  size?: StatusSize;
  icon?: ReactNode;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral:  "bg-muted/50 text-muted-foreground border-border/50",
  info:     "bg-[hsl(214_85%_50%/0.12)] text-[hsl(214_85%_60%)] border-[hsl(214_85%_50%/0.2)]",
  success:  "bg-[hsl(152_55%_48%/0.12)] text-[hsl(152_55%_55%)] border-[hsl(152_55%_48%/0.2)]",
  warning:  "bg-[hsl(38_85%_58%/0.12)] text-[hsl(38_85%_60%)] border-[hsl(38_85%_58%/0.2)]",
  danger:   "bg-[hsl(0_70%_55%/0.12)] text-[hsl(0_70%_60%)] border-[hsl(0_70%_55%/0.2)]",
  muted:    "bg-muted/30 text-muted-foreground/70 border-transparent",
  verified: "bg-[hsl(152_55%_48%/0.12)] text-[hsl(152_55%_55%)] border-[hsl(152_55%_48%/0.2)]",
  pending:  "bg-[hsl(38_85%_58%/0.12)] text-[hsl(38_85%_60%)] border-[hsl(38_85%_58%/0.2)]",
  failed:   "bg-[hsl(0_70%_55%/0.12)] text-[hsl(0_70%_60%)] border-[hsl(0_70%_55%/0.2)]",
};

const SIZE_CLASSES: Record<StatusSize, string> = {
  xs: "h-4 px-1.5 text-[9px] gap-0.5",
  sm: "h-5 px-2 text-[10px] gap-1",
  md: "h-6 px-2.5 text-xs gap-1.5",
};

export function StatusBadge({
  tone = "neutral",
  size = "sm",
  icon,
  dot,
  className,
  children,
}: StatusBadgeProps) {
  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center rounded-full border font-medium leading-none whitespace-nowrap",
        TONE_CLASSES[tone],
        SIZE_CLASSES[size],
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {icon}
      {children}
    </span>
  );
}
