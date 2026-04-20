// ═══════════════════════════════════════════════════════════════
// SITA OS — Simulation Results Intelligence Panel
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import {
  TrendingUp, TrendingDown, AlertTriangle, BarChart3, Target, Shield,
  Lightbulb, CheckCircle2, XCircle, Activity,
} from "lucide-react";
import type { SimulationResult } from "@/domains/simulation/monte-carlo-engine";
import { SimulationAdvisor } from "./SimulationAdvisor";

interface SimulationResultsProps {
  result: SimulationResult | null;
  isComplete: boolean;
  scenarioLabel?: string;
  groundedVarIds?: Set<string>;
  totalVars?: number;
}

function formatNum(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
}

export function SimulationResults({ result, isComplete, scenarioLabel, groundedVarIds, totalVars }: SimulationResultsProps) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <BarChart3 className="h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">Run a simulation to see results</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">Configure your decision and hit Simulate</p>
      </div>
    );
  }

  const isPositive = result.mean > 0;
  const confidence = Math.min(100, Math.max(0, 50 + (isPositive ? 1 : -1) * Math.min(50, Math.abs(result.mean) / (result.stdDev || 1) * 15)));
  const hasGrounding = groundedVarIds && groundedVarIds.size > 0;

  return (
    <div className="flex flex-col h-full p-4 space-y-4 overflow-y-auto">
      {/* Grounding Badge */}
      {totalVars && totalVars > 0 && (
        <div className={cn(
          "flex items-center gap-2 rounded-xl px-3 py-2 text-[10px] font-medium border",
          hasGrounding
            ? "border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/5 text-[hsl(var(--trust-safe))]"
            : "border-border/30 bg-card/20 text-muted-foreground"
        )}>
          {hasGrounding ? (
            <><CheckCircle2 className="h-3 w-3" /> {groundedVarIds.size}/{totalVars} variables grounded in real data</>
          ) : (
            <><AlertTriangle className="h-3 w-3" /> Based on user assumptions</>
          )}
        </div>
      )}

      {/* Convergence */}
      {isComplete && (
        <div className={cn(
          "flex items-center gap-2 rounded-xl px-3 py-1.5 text-[10px] font-medium border",
          result.converged
            ? "border-[hsl(var(--trust-safe))]/20 text-[hsl(var(--trust-safe))]"
            : "border-[hsl(var(--sita-gold))]/20 text-[hsl(var(--sita-gold))]"
        )}>
          {result.converged ? (
            <><CheckCircle2 className="h-3 w-3" /> Converged — results stable</>
          ) : (
            <><Activity className="h-3 w-3" /> Not fully converged — consider more iterations</>
          )}
        </div>
      )}

      {/* Verdict */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: isComplete ? 1 : 0.6, y: 0 }}
        className={cn(
          "rounded-2xl border p-4",
          isPositive
            ? "border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/5"
            : "border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/5"
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-[hsl(var(--trust-safe))]" />
          ) : (
            <TrendingDown className="h-4 w-4 text-[hsl(var(--destructive))]" />
          )}
          <span className="text-xs font-bold text-foreground">
            {isPositive ? "Favorable Outlook" : "Caution Advised"}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Across {result.total.toLocaleString()} simulations, the expected outcome is{" "}
          <span className={cn("font-bold", isPositive ? "text-[hsl(var(--trust-safe))]" : "text-[hsl(var(--destructive))]")}>
            ${formatNum(result.mean)}
          </span>
        </p>
        <ConfidenceBar value={Math.round(confidence)} size="sm" className="mt-2" />
      </motion.div>

      {/* Percentiles */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Target className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Probability Distribution</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["P10", "P50", "P90"] as const).map((key) => {
            const val = result.percentiles[key];
            return (
              <div key={key} className="rounded-xl border border-border/40 bg-card/30 p-2.5 text-center">
                <div className="text-[9px] text-muted-foreground">{key}</div>
                <div className="text-sm font-display font-bold text-foreground">
                  ${val !== undefined ? formatNum(val) : "—"}
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="rounded-xl border border-border/40 bg-card/30 p-2.5">
            <div className="text-[9px] text-muted-foreground">Mean</div>
            <div className="text-sm font-bold text-foreground">${formatNum(result.mean)}</div>
          </div>
          <div className="rounded-xl border border-border/40 bg-card/30 p-2.5">
            <div className="text-[9px] text-muted-foreground">Std Dev</div>
            <div className="text-sm font-bold text-foreground">${formatNum(result.stdDev)}</div>
          </div>
        </div>
      </div>

      {/* VaR & CVaR */}
      {isComplete && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Shield className="h-3.5 w-3.5 text-[hsl(var(--destructive))]" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Risk Metrics</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/5 p-2.5">
              <div className="text-[9px] text-muted-foreground">VaR (95%)</div>
              <div className="text-sm font-bold text-[hsl(var(--destructive))]">${formatNum(result.var95)}</div>
            </div>
            <div className="rounded-xl border border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/5 p-2.5">
              <div className="text-[9px] text-muted-foreground">CVaR (95%)</div>
              <div className="text-sm font-bold text-[hsl(var(--destructive))]">${formatNum(result.cvar95)}</div>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/30 p-2.5">
              <div className="text-[9px] text-muted-foreground">VaR (99%)</div>
              <div className="text-sm font-bold text-foreground">${formatNum(result.var99)}</div>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/30 p-2.5">
              <div className="text-[9px] text-muted-foreground">CVaR (99%)</div>
              <div className="text-sm font-bold text-foreground">${formatNum(result.cvar99)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Outcome Clusters */}
      {result.clusters.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb className="h-3.5 w-3.5 text-[hsl(var(--sita-gold))]" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Outcome Clusters</span>
          </div>
          <div className="space-y-1.5">
            {result.clusters.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 rounded-lg border border-border/30 bg-card/20 px-3 py-2"
              >
                <div className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  i === 0 ? "bg-[hsl(var(--destructive))]" : i === 1 ? "bg-primary" : "bg-[hsl(var(--trust-safe))]"
                )} />
                <div className="flex-1">
                  <div className="text-[11px] font-medium text-foreground">{c.label}</div>
                  <div className="text-[9px] text-muted-foreground">
                    ${formatNum(c.range[0])} — ${formatNum(c.range[1])}
                  </div>
                </div>
                <span className="text-xs font-bold text-foreground">{c.percentage}%</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Sensitivity */}
      {result.sensitivity.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Sensitivity Analysis</span>
          </div>
          <div className="space-y-1.5">
            {result.sensitivity.slice(0, 4).map((s, i) => {
              const maxImpact = result.sensitivity[0]?.impact || 1;
              const pct = Math.round((s.impact / maxImpact) * 100);
              return (
                <div key={s.variable} className="space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-foreground">{s.variable}</span>
                    <span className="text-[9px] text-muted-foreground">${formatNum(s.impact)} impact</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary/40 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="h-full rounded-full bg-primary/60"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tail Risk */}
      {result.tailRisk.length > 0 && result.tailRisk[0].probability > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Shield className="h-3.5 w-3.5 text-[hsl(var(--destructive))]" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tail Risk Alerts</span>
          </div>
          {result.tailRisk.map((t, i) => (
            <div key={i} className="flex items-start gap-2 rounded-xl border border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/5 p-3">
              <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--destructive))] mt-0.5 shrink-0" />
              <div>
                <div className="text-[11px] font-medium text-foreground">{t.label}</div>
                <div className="text-[10px] text-muted-foreground">
                  Probability: <span className="font-bold text-[hsl(var(--destructive))]">{t.probability}%</span> of scenarios
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Advisor */}
      <SimulationAdvisor
        result={result}
        scenarioLabel={scenarioLabel || "Simulation"}
        isComplete={isComplete}
        var95={result.var95}
        cvar95={result.cvar95}
      />
    </div>
  );
}
