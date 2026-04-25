import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { StatusBadge, type StatusSize } from "./StatusBadge";

/**
 * UrgencyBadge — canonical urgency indicator.
 * Class: PRIMITIVE.
 */
export type UrgencyLevel = "critical" | "high" | "medium" | "low" | "info";

const URGENCY_TONES: Record<UrgencyLevel, "danger" | "warning" | "info" | "muted"> = {
  critical: "danger",
  high:     "danger",
  medium:   "warning",
  low:      "info",
  info:     "muted",
};

const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  critical: "Critical",
  high:     "High",
  medium:   "Medium",
  low:      "Low",
  info:     "Info",
};

const URGENCY_ICONS: Record<UrgencyLevel, JSX.Element> = {
  critical: <AlertTriangle className="h-3 w-3" />,
  high:     <AlertTriangle className="h-3 w-3" />,
  medium:   <AlertCircle className="h-3 w-3" />,
  low:      <Info className="h-3 w-3" />,
  info:     <Info className="h-3 w-3" />,
};

export interface UrgencyBadgeProps {
  level: UrgencyLevel;
  size?: StatusSize;
  showIcon?: boolean;
  label?: string;
  className?: string;
}

export function UrgencyBadge({ level, size = "sm", showIcon = true, label, className }: UrgencyBadgeProps) {
  return (
    <StatusBadge
      tone={URGENCY_TONES[level]}
      size={size}
      icon={showIcon ? URGENCY_ICONS[level] : undefined}
      className={className}
    >
      {label ?? URGENCY_LABELS[level]}
    </StatusBadge>
  );
}
