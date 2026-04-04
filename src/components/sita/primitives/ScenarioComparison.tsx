// ═══════════════════════════════════════════════════════════════
// SITA OS — Scenario Comparison Cards
// Side-by-side comparison of boardroom scenarios with confidence
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ConfidenceBar } from "./ConfidenceBar";
import { CheckCircle, AlertTriangle, ArrowRight, GitCompare, Shield, Zap, TrendingUp } from "lucide-react";

interface ScenarioMetric {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
}

interface ScenarioOption {
  id: string;
  title: string;
  description: string;
  confidence: number;
  risk: "low" | "medium" | "high";
  metrics: ScenarioMetric[];
  pros: string[];
  cons: string[];
  recommended?: boolean;
}

interface ScenarioComparisonProps {
  title?: string;
  scenarios: ScenarioOption[];
  onSelect?: (id: string) => void;
  selectedId?: string;
  className?: string;
}

const riskBadge = (risk: string) => {
  const styles: Record<string, string> = {
    low: "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))] border-[hsl(var(--trust-safe))]/20",
    medium: "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))] border-[hsl(var(--sita-gold))]/20",
    high: "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/20",
  };
  return styles[risk] || styles.medium;
};

export const ScenarioComparison = ({
  title = "Scenario Comparison",
  scenarios,
  onSelect,
  selectedId,
  className,
}: ScenarioComparisonProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <GitCompare className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-bold text-foreground">{title}</h3>
        <span className="text-[10px] text-muted-foreground ml-2">{scenarios.length} scenarios</span>
      </div>

      <div className={cn("grid gap-4", scenarios.length === 2 ? "lg:grid-cols-2" : scenarios.length >= 3 ? "lg:grid-cols-3" : "")}>
        {scenarios.map((scenario, i) => (
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => onSelect?.(scenario.id)}
            className={cn(
              "relative rounded-2xl border p-5 cursor-pointer transition-all hover:shadow-card-hover",
              selectedId === scenario.id
                ? "border-primary/30 bg-primary/3 shadow-sm"
                : "border-border bg-card hover:border-primary/15",
              scenario.recommended && "ring-1 ring-primary/20"
            )}
          >
            {scenario.recommended && (
              <div className="absolute -top-2.5 left-4 flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[9px] font-bold text-primary-foreground shadow-sm">
                <Zap className="h-2.5 w-2.5" /> Recommended
              </div>
            )}

            <div className="flex items-start justify-between mb-3 mt-1">
              <div>
                <h4 className="text-sm font-semibold text-foreground">{scenario.title}</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">{scenario.description}</p>
              </div>
            </div>

            {/* Confidence + Risk */}
            <div className="flex items-center gap-3 mb-4">
              <ConfidenceBar value={scenario.confidence} size="sm" className="flex-1" />
              <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize", riskBadge(scenario.risk))}>
                <Shield className="h-2.5 w-2.5" /> {scenario.risk} risk
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {scenario.metrics.map((m, j) => (
                <div key={j} className="rounded-lg bg-secondary/40 px-3 py-2">
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                  <div className="flex items-baseline gap-1.5">
                    <p className="font-display text-sm font-bold text-foreground">{m.value}</p>
                    {m.delta && (
                      <span className={cn("text-[10px] font-medium", m.trend === "up" ? "text-[hsl(var(--trust-safe))]" : m.trend === "down" ? "text-[hsl(var(--destructive))]" : "text-muted-foreground")}>
                        {m.delta}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pros/Cons */}
            <div className="space-y-2">
              {scenario.pros.map((p, j) => (
                <div key={`pro-${j}`} className="flex items-start gap-1.5">
                  <CheckCircle className="h-3 w-3 text-[hsl(var(--trust-safe))] mt-0.5 shrink-0" />
                  <span className="text-[11px] text-foreground">{p}</span>
                </div>
              ))}
              {scenario.cons.map((c, j) => (
                <div key={`con-${j}`} className="flex items-start gap-1.5">
                  <AlertTriangle className="h-3 w-3 text-[hsl(var(--sita-gold))] mt-0.5 shrink-0" />
                  <span className="text-[11px] text-muted-foreground">{c}</span>
                </div>
              ))}
            </div>

            {selectedId === scenario.id && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                <CheckCircle className="h-3.5 w-3.5" /> Selected
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
