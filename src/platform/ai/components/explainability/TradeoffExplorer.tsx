// ═══════════════════════════════════════════════════════════════
// SITA OS — TradeoffExplorer
// Side-by-side comparison of alternatives with pros/cons
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { ConfidenceRiskMeter } from "./ConfidenceRiskMeter";

export interface TradeoffOption {
  option: string;
  pros: string[];
  cons: string[];
  confidence: number;
}

interface TradeoffExplorerProps {
  tradeoffs: TradeoffOption[];
  className?: string;
}

export function TradeoffExplorer({ tradeoffs, className }: TradeoffExplorerProps) {
  if (tradeoffs.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Tradeoff Analysis
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {tradeoffs.map((t, i) => (
          <div
            key={i}
            className="rounded-lg border border-border/50 bg-card/40 p-3 space-y-2"
          >
            <p className="text-xs font-medium text-foreground">{t.option}</p>
            <ConfidenceRiskMeter confidence={t.confidence} size="sm" showLabel={false} />
            {t.pros.length > 0 && (
              <div className="space-y-0.5">
                {t.pros.map((p, j) => (
                  <div key={j} className="flex items-start gap-1.5 text-[10px] text-emerald-400">
                    <ThumbsUp className="h-3 w-3 mt-0.5 shrink-0" />
                    <span className="text-foreground/70">{p}</span>
                  </div>
                ))}
              </div>
            )}
            {t.cons.length > 0 && (
              <div className="space-y-0.5">
                {t.cons.map((c, j) => (
                  <div key={j} className="flex items-start gap-1.5 text-[10px] text-red-400">
                    <ThumbsDown className="h-3 w-3 mt-0.5 shrink-0" />
                    <span className="text-foreground/70">{c}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}