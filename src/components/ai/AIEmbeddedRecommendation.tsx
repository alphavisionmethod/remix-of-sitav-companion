// ═══════════════════════════════════════════════════════════════
// SITA OS — AIEmbeddedRecommendation
// Quiet inline AI-generated hint/recommendation card (Category D)
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronRight, X } from "lucide-react";
import { AIStateBadge } from "./AIStateBadge";
import type { AIResponseEnvelope } from "@/lib/ai/ai-state-types";
import { isSuccessState, isDegradedState } from "@/lib/ai/ai-state-types";

interface AIEmbeddedRecommendationProps {
  response: AIResponseEnvelope | null;
  onAction?: () => void;
  onDismiss?: () => void;
  actionLabel?: string;
  className?: string;
}

export function AIEmbeddedRecommendation({
  response,
  onAction,
  onDismiss,
  actionLabel = "View Details",
  className,
}: AIEmbeddedRecommendationProps) {
  if (!response) return null;

  // Silently hide if degraded/unavailable — baseline UX takes over
  if (isDegradedState(response.status) || response.status === "error" ||
      response.status.startsWith("unavailable_") || response.status.startsWith("blocked_")) {
    return null;
  }

  if (!isSuccessState(response.status)) return null;

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border border-border bg-card/50 ${className ?? ""}`}>
      <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-muted-foreground">AI Suggestion</span>
          <AIStateBadge state={response.status} launchLevel={response.launchHonestyClass} size="sm" />
        </div>
        <p className="text-sm line-clamp-2">{response.content}</p>
        {onAction && (
          <Button variant="link" size="sm" className="h-auto p-0 mt-1 text-xs gap-1" onClick={onAction}>
            {actionLabel} <ChevronRight className="h-3 w-3" />
          </Button>
        )}
      </div>
      {onDismiss && (
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0" onClick={onDismiss}>
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
