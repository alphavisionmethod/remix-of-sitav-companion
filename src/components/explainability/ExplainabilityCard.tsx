// ═══════════════════════════════════════════════════════════════
// SITA OS — ExplainabilityCard
// Compact inline card: recommendation summary + confidence + "Why?"
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfidenceRiskMeter } from "./ConfidenceRiskMeter";
import type { Explanation } from "@/lib/services/explainability/index";

interface ExplainabilityCardProps {
  explanation: Explanation;
  compact?: boolean;
  className?: string;
  onFeedback?: (id: string, feedback: "helpful" | "not_helpful") => void;
}

export function ExplainabilityCard({
  explanation,
  compact = true,
  className,
  onFeedback,
}: ExplainabilityCardProps) {
  const [expanded, setExpanded] = useState(!compact);

  return (
    <div className={cn(
      "rounded-lg border border-border/50 bg-card/40 backdrop-blur-sm p-3 space-y-2",
      className,
    )}>
      {/* Header */}
      <div className="flex items-start gap-2">
        <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground line-clamp-1">{explanation.title}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{explanation.summary}</p>
        </div>
        {compact && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 shrink-0"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        )}
      </div>

      {/* Confidence meter — always visible */}
      <ConfidenceRiskMeter
        confidence={explanation.confidence}
        riskLevel={explanation.confidence >= 0.8 ? "low" : explanation.confidence >= 0.6 ? "medium" : "high"}
        size="sm"
        showLabel={false}
      />

      {/* Expanded detail */}
      {expanded && (
        <div className="space-y-2 pt-1 border-t border-border/30">
          {explanation.reasoningChain.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Key Reasoning
              </p>
              <ul className="space-y-0.5">
                {explanation.reasoningChain.slice(0, 3).map((step, i) => (
                  <li key={i} className="text-[10px] text-foreground/70 flex items-start gap-1.5">
                    <span className="text-primary/60 font-mono">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {onFeedback && (
            <div className="flex gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px]"
                onClick={() => onFeedback(explanation.id, "helpful")}
              >
                Helpful
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px]"
                onClick={() => onFeedback(explanation.id, "not_helpful")}
              >
                Not helpful
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}