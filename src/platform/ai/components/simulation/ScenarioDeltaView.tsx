// ═══════════════════════════════════════════════════════════════
// SITA OS — ScenarioDeltaView
// Before/after comparison for simulation outcomes
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ConfidenceRiskMeter } from "@/platform/ai/components/explainability/ConfidenceRiskMeter";
import type { SimulationResult } from "@/domains/simulation/monte-carlo-engine";

interface ScenarioDeltaViewProps {
  scenarioLabel: string;
  scenarioQuestion: string;
  baseline: { label: string; value: number };
  result: SimulationResult;
  className?: string;
}

function formatCurrency(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function ScenarioDeltaView({
  scenarioLabel,
  scenarioQuestion,
  baseline,
  result,
  className,
}: ScenarioDeltaViewProps) {
  const delta = result.mean - baseline.value;
  const isPositive = delta > 0;
  const isNeutral = Math.abs(delta) < 0.01 * Math.abs(baseline.value);
  const confidence = Math.min(1, Math.max(0, 0.5 + (isPositive ? 1 : -1) * Math.min(0.5, Math.abs(result.mean) / (result.stdDev || 1) * 0.15)));

  const DeltaIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <div className={cn("rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 space-y-4", className)}>
      <div>
        <p className="text-xs font-semibold text-foreground">{scenarioLabel}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{scenarioQuestion}</p>
      </div>

      {/* Before → After */}
      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-lg bg-muted/20 p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">Baseline</p>
          <p className="text-sm font-mono font-semibold text-foreground">{formatCurrency(baseline.value)}</p>
          <p className="text-[9px] text-muted-foreground">{baseline.label}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex-1 rounded-lg bg-muted/20 p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">Modeled Outcome</p>
          <p className="text-sm font-mono font-semibold text-foreground">{formatCurrency(result.mean)}</p>
          <p className="text-[9px] text-muted-foreground">Mean (P50: {formatCurrency(result.percentiles?.P50 ?? result.mean)})</p>
        </div>
      </div>

      {/* Delta badge */}
      <div className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2",
        isNeutral ? "bg-muted/20" : isPositive ? "bg-emerald-500/10" : "bg-red-500/10",
      )}>
        <DeltaIcon className={cn("h-4 w-4", isNeutral ? "text-muted-foreground" : isPositive ? "text-emerald-400" : "text-red-400")} />
        <div>
          <p className={cn("text-xs font-semibold", isNeutral ? "text-muted-foreground" : isPositive ? "text-emerald-400" : "text-red-400")}>
            {isPositive ? "+" : ""}{formatCurrency(delta)} net impact
          </p>
          <p className="text-[10px] text-muted-foreground">
            Range: {formatCurrency(result.min)} to {formatCurrency(result.max)}
          </p>
        </div>
      </div>

      {/* Confidence */}
      <ConfidenceRiskMeter
        confidence={confidence}
        riskLevel={result.cvar95 < 0 ? "high" : result.var95 < 0 ? "medium" : "low"}
        size="sm"
      />

      {/* Tail risk */}
      {result.tailRisk && result.tailRisk.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tail Risk</p>
          {result.tailRisk.map((tr, i) => (
            <div key={i} className="flex justify-between text-[10px]">
              <span className="text-foreground/70">{tr.label}</span>
              <span className="text-amber-400 font-mono">{(tr.probability * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}