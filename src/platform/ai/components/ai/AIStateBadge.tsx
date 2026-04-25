// ═══════════════════════════════════════════════════════════════
// SITA OS — AIStateBadge
// Trust / honesty badge for AI response surfaces
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { Badge } from "@/components/ui/badge";
import { STATE_BADGE_CONFIG, LAUNCH_LEVEL_CONFIG } from "@/lib/ai/ai-surface-grammar";
import type { AIState, LaunchLevel } from "@/lib/ai/ai-state-types";
import { CheckCircle, AlertTriangle, Eye, XCircle, Loader2 } from "lucide-react";

interface AIStateBadgeProps {
  state: AIState;
  launchLevel?: LaunchLevel;
  showIcon?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const STATE_ICONS: Partial<Record<AIState, React.ReactNode>> = {
  loading: <Loader2 className="h-3 w-3 animate-spin" />,
  streaming: <Loader2 className="h-3 w-3 animate-spin" />,
  success_real: <CheckCircle className="h-3 w-3" />,
  success_partial: <AlertTriangle className="h-3 w-3" />,
  success_demo_governed: <Eye className="h-3 w-3" />,
  error: <XCircle className="h-3 w-3" />,
  blocked_budget: <XCircle className="h-3 w-3" />,
  rate_limited: <AlertTriangle className="h-3 w-3" />,
};

export function AIStateBadge({ state, launchLevel, showIcon = true, size = "sm", className }: AIStateBadgeProps) {
  if (state === "idle") return null;

  const config = STATE_BADGE_CONFIG[state];
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <Badge
      variant={config.variant}
      className={`${sizeClass} gap-1 ${config.className} ${className ?? ""}`}
    >
      {showIcon && STATE_ICONS[state]}
      {config.label}
    </Badge>
  );
}

interface AILaunchBadgeProps {
  level: LaunchLevel;
  size?: "sm" | "md";
  className?: string;
}

export function AILaunchBadge({ level, size = "sm", className }: AILaunchBadgeProps) {
  const config = LAUNCH_LEVEL_CONFIG[level];
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <Badge
      variant={config.variant}
      className={`${sizeClass} ${config.className} ${className ?? ""}`}
    >
      {config.label}
    </Badge>
  );
}
