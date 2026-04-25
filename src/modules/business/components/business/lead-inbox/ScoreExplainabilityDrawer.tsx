import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { LeadPriorityBadge } from "./LeadPriorityBadge";
import { LeadHeatIndicator } from "./LeadHeatIndicator";
import { LeadConfidenceDisplay } from "./LeadConfidenceDisplay";
import { PriorityEvolutionTimeline } from "./PriorityEvolutionTimeline";
import { LeadScoreRadar } from "./LeadScoreRadar";
import type { LeadScoreResult, ScoreFactor } from "@/domains/engines/lead-scoring-engine";
import { X, TrendingUp, TrendingDown, Zap, Target, Clock, Brain } from "lucide-react";

const FactorBar = ({ factor, maxWeight }: { factor: ScoreFactor; maxWeight: number }) => {
  const barColor = factor.polarity === "positive"
    ? "bg-[hsl(var(--trust-safe))]"
    : factor.polarity === "negative"
      ? "bg-[hsl(var(--trust-degraded))]"
      : "bg-muted-foreground/50";

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-medium text-foreground">{factor.label}</span>
        <span className={cn(
          "text-[10px] font-bold tabular-nums",
          factor.polarity === "positive" ? "text-[hsl(var(--trust-safe))]" :
          factor.polarity === "negative" ? "text-[hsl(var(--trust-degraded))]" :
          "text-muted-foreground"
        )}>
          {factor.normalizedScore}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted/20 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${factor.normalizedScore}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={cn("h-full rounded-full", barColor)}
        />
      </div>
      <p className="text-[9px] text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {factor.explanation} · Weight: {Math.round(factor.weight * 100)}%
      </p>
    </div>
  );
};

interface Props {
  score: LeadScoreResult | null;
  open: boolean;
  onClose: () => void;
}

export const ScoreExplainabilityDrawer = ({ score, open, onClose }: Props) => {
  if (!score) return null;

  const maxWeight = Math.max(...score.allFactors.map(f => f.weight));
  const sortedFactors = [...score.allFactors].sort((a, b) => (b.normalizedScore * b.weight) - (a.normalizedScore * a.weight));

  const conversionLabel: Record<string, string> = {
    "very-likely": "Very Likely", "likely": "Likely", "possible": "Possible",
    "unlikely": "Unlikely", "insufficient-data": "Insufficient Data",
  };

  const timingLabel: Record<string, string> = {
    "narrow-window": "Narrow Window", "time-sensitive": "Time-Sensitive",
    "standard": "Standard", "flexible": "Flexible",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-[420px] max-w-[95vw] bg-card border-l border-border/40 overflow-y-auto"
          >
            <div className="p-5 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">Score Breakdown</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Explainable priority analysis</p>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Priority Score Hero */}
              <SitaCard hover={false} glow className="p-5 text-center">
                <div className="font-display text-5xl font-bold text-foreground tabular-nums">
                  {score.priorityScore}
                </div>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <LeadPriorityBadge tier={score.priorityTier} size="md" />
                </div>
                <div className="mt-3 flex items-center justify-center gap-3">
                  <LeadHeatIndicator heat={score.heatStatus} urgency={score.urgencyBand} showUrgency />
                </div>
                <div className="mt-3">
                  <PriorityEvolutionTimeline
                    heat={score.heatStatus}
                    staleRisk={score.staleRisk}
                    priorityScore={score.priorityScore}
                  />
                </div>
              </SitaCard>

              {/* Confidence */}
              <SitaCard hover={false} className="p-4">
                <SitaCardTitle>Confidence Assessment</SitaCardTitle>
                <div className="mt-3">
                  <LeadConfidenceDisplay level={score.confidenceLevel} score={score.confidenceScore} />
                </div>
              </SitaCard>

              {/* Key Metrics Row */}
              <div className="grid grid-cols-2 gap-3">
                <SitaCard hover={false} className="p-3 text-center">
                  <Target className="h-4 w-4 mx-auto text-accent mb-1" />
                  <p className="text-[10px] text-muted-foreground">Conversion</p>
                  <p className="text-xs font-semibold text-foreground">{conversionLabel[score.conversionLikelihood]}</p>
                </SitaCard>
                <SitaCard hover={false} className="p-3 text-center">
                  <Clock className="h-4 w-4 mx-auto text-[hsl(var(--sita-gold))] mb-1" />
                  <p className="text-[10px] text-muted-foreground">Timing</p>
                  <p className="text-xs font-semibold text-foreground">{timingLabel[score.timingSensitivity]}</p>
                </SitaCard>
                <SitaCard hover={false} className="p-3 text-center">
                  <TrendingDown className="h-4 w-4 mx-auto text-[hsl(var(--urgency-high))] mb-1" />
                  <p className="text-[10px] text-muted-foreground">Stale Risk</p>
                  <p className="text-xs font-semibold text-foreground">{score.staleRisk}%</p>
                </SitaCard>
                <SitaCard hover={false} className="p-3 text-center">
                  <TrendingUp className="h-4 w-4 mx-auto text-[hsl(var(--trust-safe))] mb-1" />
                  <p className="text-[10px] text-muted-foreground">Recovery</p>
                  <p className="text-xs font-semibold text-foreground">{score.recoveryPotential}%</p>
                </SitaCard>
              </div>

              {/* Next Best Action */}
              <SitaCard hover={false} glass className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-accent" />
                  <SitaCardTitle>Recommended Action</SitaCardTitle>
                </div>
                <p className="text-sm text-foreground">{score.nextBestAction}</p>
                <span className="mt-2 inline-block text-[10px] bg-accent/10 text-accent rounded-full px-2 py-0.5 capitalize">
                  {score.nextBestActionType.replace("-", " ")}
                </span>
              </SitaCard>

              {/* Top Positive Factors */}
              {score.topPositiveFactors.length > 0 && (
                <SitaCard hover={false} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-[hsl(var(--trust-safe))]" />
                    <SitaCardTitle>What Raises Priority</SitaCardTitle>
                  </div>
                  <div className="space-y-3">
                    {score.topPositiveFactors.map(f => (
                      <FactorBar key={f.key} factor={f} maxWeight={maxWeight} />
                    ))}
                  </div>
                </SitaCard>
              )}

              {/* Top Negative Factors */}
              {score.topNegativeFactors.length > 0 && (
                <SitaCard hover={false} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="h-4 w-4 text-[hsl(var(--trust-degraded))]" />
                    <SitaCardTitle>What Lowers Priority</SitaCardTitle>
                  </div>
                  <div className="space-y-3">
                    {score.topNegativeFactors.map(f => (
                      <FactorBar key={f.key} factor={f} maxWeight={maxWeight} />
                    ))}
                  </div>
                </SitaCard>
              )}

              {/* Radar Chart */}
              <SitaCard hover={false} className="p-4 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-3 self-start">
                  <Target className="h-4 w-4 text-primary" />
                  <SitaCardTitle>Factor Radar</SitaCardTitle>
                </div>
                <LeadScoreRadar factors={score.allFactors} size={260} />
              </SitaCard>

              {/* All Factors */}
              <SitaCard hover={false} className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-4 w-4 text-primary" />
                  <SitaCardTitle>All 15 Scoring Factors</SitaCardTitle>
                </div>
                <div className="space-y-3">
                  {sortedFactors.map(f => (
                    <FactorBar key={f.key} factor={f} maxWeight={maxWeight} />
                  ))}
                </div>
              </SitaCard>

              {/* Explanation */}
              <SitaCard hover={false} className="p-4 border-l-4 border-l-primary/30">
                <p className="text-xs text-muted-foreground italic leading-relaxed">{score.explanation}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-2">Business mode: {score.businessModeUsed}</p>
              </SitaCard>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
