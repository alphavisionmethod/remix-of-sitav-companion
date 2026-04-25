// ═══════════════════════════════════════════════════════════════
// SITA OS — Readiness-to-Delegate Gauge
// Multi-dimension readiness score with tier recommendation,
// subscore breakdown, and evidence trail.
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useReadinessToDelegate } from "@/hooks/use-meta-governance";
import { motion } from "framer-motion";
import { Target, TrendingUp, TrendingDown, Minus, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReadinessInput } from "@/domains/engines/readiness-engine";
import type { OSEntityScope as EntityScope } from "@/packages/contracts";

import type { DelegationTier, ReadinessSubscore } from "@/packages/contracts";

const TIER_LABELS: Record<DelegationTier, { label: string; color: string }> = {
  observe: { label: "Observe Only", color: "text-muted-foreground border-border" },
  suggest: { label: "Suggest", color: "text-muted-foreground border-border" },
  draft: { label: "Draft", color: "text-accent border-accent/30" },
  approval_every: { label: "Approve Every", color: "text-accent border-accent/30" },
  approval_exceptions: { label: "Approve Exceptions", color: "text-primary border-primary/30" },
  bounded_recurring: { label: "Bounded Recurring", color: "text-trust-safe border-trust-safe/30" },
  expanded_recurring: { label: "Expanded Recurring", color: "text-trust-safe border-trust-safe/30" },
};

const SUBSCORE_LABELS: Record<string, string> = {
  proofCompleteness: "Proof Completeness",
  replaySafety: "Replay Safety",
  rollbackReadiness: "Rollback Readiness",
  policyMaturity: "Policy Maturity",
  errorRate: "Error Rate",
  trustDebt: "Trust Debt",
  executionDebt: "Execution Debt",
  approvalBehavior: "Approval Behavior",
  connectorStability: "Connector Stability",
  observabilityQuality: "Observability",
  supportBurden: "Support Burden",
  confidenceQuality: "Confidence Quality",
};

const TrendIcon = ({ direction }: { direction: string }) => {
  if (direction === "improving") return <TrendingUp className="h-3 w-3 text-trust-safe" />;
  if (direction === "degrading") return <TrendingDown className="h-3 w-3 text-urgency-high" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
};

const SubscoreRow = ({ name, subscore }: { name: string; subscore: ReadinessSubscore }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{SUBSCORE_LABELS[name] || name}</span>
      <div className="flex items-center gap-1.5">
        <span className="font-mono font-semibold text-foreground">
          {Math.round(subscore.value * 100)}%
        </span>
        <TrendIcon direction={subscore.trend} />
      </div>
    </div>
    <Progress value={subscore.value * 100} className="h-1" />
  </div>
);

// Circular gauge for composite score
const CircularGauge = ({ score, tier }: { score: number; tier: DelegationTier }) => {
  const percent = Math.round(score * 100);
  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference - (score * circumference);
  const tierInfo = TIER_LABELS[tier];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
          <motion.circle
            cx="50" cy="50" r="42" fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold text-foreground">{percent}</span>
          <span className="text-[9px] text-muted-foreground">/ 100</span>
        </div>
      </div>
      <Badge variant="outline" className={cn("text-xs", tierInfo.color)}>
        {score >= 0.65 ? <Unlock className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
        {tierInfo.label}
      </Badge>
    </div>
  );
};

interface ReadinessGaugeProps {
  input: ReadinessInput;
  entityScope: EntityScope;
}

export function ReadinessGauge({ input, entityScope }: ReadinessGaugeProps) {
  const score = useReadinessToDelegate(input, entityScope);

  const subscoreEntries = Object.entries(score.subscores) as [string, ReadinessSubscore][];

  return (
    <SitaCard hover={false} className="space-y-4">
      <SitaCardTitle sub="Multi-signal readiness assessment for delegation">
        <span className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Readiness to Delegate
        </span>
      </SitaCardTitle>

      <div className="flex gap-6">
        {/* Gauge */}
        <CircularGauge score={score.compositeScore} tier={score.recommendedTier} />

        {/* Subscores */}
        <div className="flex-1 space-y-2 max-h-[240px] overflow-y-auto">
          {subscoreEntries.map(([name, sub]) => (
            <SubscoreRow key={name} name={name} subscore={sub} />
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div className="rounded-lg bg-muted/30 border border-border p-3">
        <p className="text-xs text-muted-foreground">{score.explanation}</p>
      </div>
    </SitaCard>
  );
}

export default ReadinessGauge;
