// ═══════════════════════════════════════════════════════════════
// SITA OS — AIDegradedState
// Premium empty/unavailable/degraded state component
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Ban, DollarSign, KeyRound, Clock, RefreshCw } from "lucide-react";
import { DEGRADED_MESSAGES } from "@/lib/ai/ai-surface-grammar";
import type { AIState } from "@/lib/ai/ai-state-types";

interface AIDegradedStateProps {
  state: AIState;
  reason?: string;
  onRetry?: () => void;
  onAction?: () => void;
  compact?: boolean;
  className?: string;
}

const STATE_ICONS: Partial<Record<AIState, React.ReactNode>> = {
  degraded_provider_unavailable: <AlertTriangle className="h-8 w-8 text-amber-400" />,
  degraded_budget_limited: <DollarSign className="h-8 w-8 text-amber-400" />,
  degraded_config_missing: <KeyRound className="h-8 w-8 text-muted-foreground" />,
  blocked_budget: <Ban className="h-8 w-8 text-destructive" />,
  blocked_config: <KeyRound className="h-8 w-8 text-muted-foreground" />,
  unavailable_capability: <Ban className="h-8 w-8 text-muted-foreground" />,
  unavailable_launch_gated: <Clock className="h-8 w-8 text-muted-foreground" />,
  rate_limited: <Clock className="h-8 w-8 text-amber-400" />,
  payment_required: <DollarSign className="h-8 w-8 text-destructive" />,
  error: <AlertTriangle className="h-8 w-8 text-destructive" />,
};

function getMessageForState(state: AIState, reason?: string) {
  if (reason && DEGRADED_MESSAGES[reason]) return DEGRADED_MESSAGES[reason];

  const mapping: Partial<Record<AIState, string>> = {
    degraded_provider_unavailable: "provider_unavailable",
    degraded_budget_limited: "budget_exceeded",
    degraded_config_missing: "config_missing",
    blocked_budget: "budget_exceeded",
    blocked_config: "config_missing",
    unavailable_capability: "provider_unavailable",
    unavailable_launch_gated: "launch_gated",
    rate_limited: "rate_limited",
    payment_required: "payment_required",
  };

  const key = mapping[state];
  if (key && DEGRADED_MESSAGES[key]) return DEGRADED_MESSAGES[key];

  return {
    title: "Something went wrong",
    description: reason ?? "An unexpected error occurred. Please try again.",
  };
}

export function AIDegradedState({
  state,
  reason,
  onRetry,
  onAction,
  compact = false,
  className,
}: AIDegradedStateProps) {
  const msg = getMessageForState(state, reason);
  const icon = STATE_ICONS[state] ?? <AlertTriangle className="h-8 w-8 text-muted-foreground" />;

  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg border border-border bg-card ${className ?? ""}`}>
        <div className="shrink-0">{React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5" })}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{msg.title}</p>
          <p className="text-xs text-muted-foreground truncate">{msg.description}</p>
        </div>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={`bg-card border-border ${className ?? ""}`}>
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        {icon}
        <h3 className="mt-3 text-lg font-medium">{msg.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">{msg.description}</p>
        <div className="flex gap-2 mt-4">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </Button>
          )}
          {onAction && msg.action && (
            <Button variant="default" size="sm" onClick={onAction}>
              {msg.action}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
