import { Clock } from "lucide-react";
import { StatusBadge, type StatusSize } from "./StatusBadge";

/**
 * FreshnessBadge — canonical data-freshness indicator.
 * Class: PRIMITIVE.
 */
export type FreshnessLevel = "live" | "fresh" | "stale" | "expired";

const FRESHNESS_TONES: Record<FreshnessLevel, "success" | "info" | "warning" | "danger"> = {
  live:    "success",
  fresh:   "info",
  stale:   "warning",
  expired: "danger",
};

const FRESHNESS_LABELS: Record<FreshnessLevel, string> = {
  live:    "Live",
  fresh:   "Fresh",
  stale:   "Stale",
  expired: "Expired",
};

export interface FreshnessBadgeProps {
  level: FreshnessLevel;
  size?: StatusSize;
  showIcon?: boolean;
  age?: string;
  className?: string;
}

export function FreshnessBadge({ level, size = "sm", showIcon = true, age, className }: FreshnessBadgeProps) {
  return (
    <StatusBadge
      tone={FRESHNESS_TONES[level]}
      size={size}
      icon={showIcon ? <Clock className="h-3 w-3" /> : undefined}
      className={className}
    >
      {age ? `${FRESHNESS_LABELS[level]} · ${age}` : FRESHNESS_LABELS[level]}
    </StatusBadge>
  );
}
