// ═══════════════════════════════════════════════════════════════
// SITA OS — Multi-Run Comparison Overlay
// Side-by-side scenario comparison
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GitCompareArrows, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SimulationResult } from "@/domains/simulation/monte-carlo-engine";

interface ComparisonOverlayProps {
  runs: { label: string; result: SimulationResult }[];
  onClose: () => void;
}

function formatNum(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
}

export function ComparisonOverlay({ runs, onClose }: ComparisonOverlayProps) {
  if (runs.length < 2) return null;

  const metrics = [
    { key: "mean", label: "Expected Value" },
    { key: "stdDev", label: "Risk (Std Dev)" },
    { key: "P10", label: "Worst Case (P10)" },
    { key: "P50", label: "Median (P50)" },
    { key: "P90", label: "Best Case (P90)" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-4 z-30 rounded-2xl border border-border/40 bg-background/95 backdrop-blur-sm p-6 overflow-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <GitCompareArrows className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-foreground">Scenario Comparison</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Comparison Table */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `150px repeat(${runs.length}, 1fr)` }}>
        {/* Header */}
        <div />
        {runs.map((run, i) => (
          <div key={i} className="text-center">
            <div className={cn(
              "text-xs font-bold px-3 py-1.5 rounded-lg",
              i === 0 ? "bg-primary/10 text-primary" : "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]"
            )}>
              {run.label}
            </div>
          </div>
        ))}

        {/* Metrics */}
        {metrics.map(m => (
          <>
            <div key={m.key} className="text-[11px] font-medium text-muted-foreground flex items-center">
              {m.label}
            </div>
            {runs.map((run, i) => {
              const val = m.key.startsWith("P")
                ? run.result.percentiles[m.key] ?? 0
                : (run.result as any)[m.key] ?? 0;
              const otherVal = m.key.startsWith("P")
                ? runs[1 - i]?.result.percentiles[m.key] ?? 0
                : (runs[1 - i]?.result as any)[m.key] ?? 0;
              const better = m.key === "stdDev" ? val < otherVal : val > otherVal;
              return (
                <div
                  key={`${m.key}-${i}`}
                  className={cn(
                    "text-center text-sm font-bold rounded-lg py-2",
                    runs.length === 2 && better ? "text-[hsl(var(--trust-safe))]" : "text-foreground"
                  )}
                >
                  ${formatNum(val)}
                </div>
              );
            })}
          </>
        ))}
      </div>

      {/* Relative bar chart */}
      <div className="mt-6 space-y-2">
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Expected Value Comparison
        </div>
        {runs.map((run, i) => {
          const maxMean = Math.max(...runs.map(r => Math.abs(r.result.mean)));
          const pct = maxMean > 0 ? (Math.abs(run.result.mean) / maxMean * 100) : 50;
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[10px] w-24 truncate text-muted-foreground">{run.label}</span>
              <div className="flex-1 h-4 rounded-full bg-secondary/20 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className={cn(
                    "h-full rounded-full",
                    i === 0 ? "bg-primary/60" : "bg-[hsl(var(--sita-gold))]/60"
                  )}
                />
              </div>
              <span className="text-xs font-bold w-16 text-right text-foreground">
                ${formatNum(run.result.mean)}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
