// ═══════════════════════════════════════════════════════════════
// SITA OS — ReasoningChainTimeline
// Vertical timeline of reasoning steps with source links
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import type { ExplanationSource } from "@/lib/services/explainability/index";

interface ReasoningChainTimelineProps {
  steps: string[];
  sources?: ExplanationSource[];
  className?: string;
}

export function ReasoningChainTimeline({ steps, sources = [], className }: ReasoningChainTimelineProps) {
  if (steps.length === 0) return null;

  return (
    <div className={cn("space-y-0", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Reasoning Chain
      </p>
      <ol className="relative border-l border-border/50 ml-2 space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="ml-4">
            <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full border border-border bg-primary/60" />
            <p className="text-xs text-foreground/80">{step}</p>
          </li>
        ))}
      </ol>
      {sources.length > 0 && (
        <div className="mt-3 pt-2 border-t border-border/30">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Sources</p>
          <div className="flex flex-wrap gap-1.5">
            {sources.map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-md bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {s.system}/{s.component}
                <ChevronRight className="h-2.5 w-2.5" />
                {Math.round(s.confidence * 100)}%
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}