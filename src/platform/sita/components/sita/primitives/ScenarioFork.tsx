// ═══════════════════════════════════════════════════════════════
// SITA OS — ScenarioFork Primitive
// Side-by-side scenario comparison with delta highlights
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { GitBranch, TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface ScenarioMetric {
  label: string;
  valueA: string;
  valueB: string;
  delta?: string;
  direction?: "up" | "down" | "neutral";
}

interface ScenarioForkProps {
  titleA: string;
  titleB: string;
  metrics: ScenarioMetric[];
  recommendedScenario?: "A" | "B";
  className?: string;
}

export function ScenarioFork({ titleA, titleB, metrics, recommendedScenario, className }: ScenarioForkProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="flex border-b border-border">
        <div className="flex-1 p-3 flex items-center gap-2 border-r border-border">
          <GitBranch className="h-3.5 w-3.5 text-[hsl(var(--sita-purple))]" />
          <span className="text-[12px] font-semibold text-foreground">{titleA}</span>
          {recommendedScenario === "A" && (
            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--trust-safe)/0.15)] text-[hsl(var(--trust-safe))] font-bold uppercase">Recommended</span>
          )}
        </div>
        <div className="flex-1 p-3 flex items-center gap-2">
          <GitBranch className="h-3.5 w-3.5 text-[hsl(var(--sita-gold))]" />
          <span className="text-[12px] font-semibold text-foreground">{titleB}</span>
          {recommendedScenario === "B" && (
            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--trust-safe)/0.15)] text-[hsl(var(--trust-safe))] font-bold uppercase">Recommended</span>
          )}
        </div>
      </div>

      {/* Metrics Rows */}
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.04 }}
          className={cn("flex border-b border-border last:border-b-0", i % 2 === 0 ? "bg-transparent" : "bg-muted/30")}
        >
          {/* Value A */}
          <div className="flex-1 px-3 py-2 border-r border-border">
            <p className="text-[11px] text-muted-foreground mb-0.5">{m.label}</p>
            <p className="text-[13px] font-semibold text-foreground tabular-nums">{m.valueA}</p>
          </div>
          {/* Value B */}
          <div className="flex-1 px-3 py-2 relative">
            <p className="text-[11px] text-muted-foreground mb-0.5">{m.label}</p>
            <div className="flex items-center gap-1.5">
              <p className="text-[13px] font-semibold text-foreground tabular-nums">{m.valueB}</p>
              {m.delta && (
                <span className={cn(
                  "text-[9px] font-bold flex items-center gap-0.5",
                  m.direction === "up" ? "text-[hsl(var(--trust-safe))]" :
                  m.direction === "down" ? "text-destructive" :
                  "text-muted-foreground"
                )}>
                  {m.direction === "up" ? <TrendingUp className="h-2.5 w-2.5" /> :
                   m.direction === "down" ? <TrendingDown className="h-2.5 w-2.5" /> :
                   <Minus className="h-2.5 w-2.5" />}
                  {m.delta}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
