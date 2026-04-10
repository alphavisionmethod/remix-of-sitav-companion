// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Financial Peace Score
// Emotional + practical composite — distinct from Health Pulse
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { Heart, Shield, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { computePeaceScore } from "@/lib/services/finance-os/peace-score.service";

const statusColors: Record<string, string> = {
  strong: "bg-trust-verified text-trust-verified",
  adequate: "bg-primary text-primary",
  weak: "bg-[hsl(var(--sita-gold))] text-[hsl(var(--sita-gold))]",
  critical: "bg-destructive text-destructive",
};

const statusIcons: Record<string, typeof CheckCircle> = {
  strong: CheckCircle, adequate: Shield, weak: AlertTriangle, critical: AlertTriangle,
};

const PeaceScore = () => {
  const peace = useMemo(() => computePeaceScore({
    reserveFundedPct: 45,
    billsCoveredPct: 100,
    debtToIncomeRatio: 0.28,
    taxReservedPct: 65,
    incomeStabilityScore: 72,
    obligationPressurePct: 52,
    discretionaryRoomPct: 18,
    householdCoordinationScore: 78,
  }), []);

  const gradeColor = peace.compositeScore >= 80 ? "text-trust-verified" :
    peace.compositeScore >= 60 ? "text-primary" :
    peace.compositeScore >= 40 ? "text-[hsl(var(--sita-gold))]" : "text-destructive";

  const TrendIcon = peace.trend === "improving" ? TrendingUp : peace.trend === "declining" ? TrendingDown : Minus;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <DomainHeader domain="money" title="Financial Peace Score" subtitle="How calm and controlled your financial life feels" />
      <DemoModeBadge />

      {/* Score Hero */}
      <SitaCard hover={false} className="p-8 text-center gradient-sita-subtle">
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="relative">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-muted" strokeWidth="6" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className={gradeColor}
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${peace.compositeScore * 2.64} 264`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <Heart className={`h-5 w-5 ${gradeColor} mb-1`} />
              <p className={`font-display text-3xl font-bold ${gradeColor}`}>{peace.compositeScore}</p>
            </div>
          </div>
          <div className="text-left">
            <p className="font-display text-2xl font-bold text-foreground">Peace Grade: {peace.grade}</p>
            <div className="flex items-center gap-2 mt-1">
              <TrendIcon className={`h-4 w-4 ${peace.trend === "improving" ? "text-trust-verified" : peace.trend === "declining" ? "text-destructive" : "text-muted-foreground"}`} />
              <span className="text-sm text-muted-foreground capitalize">{peace.trend}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 max-w-xs">{peace.guidance}</p>
          </div>
        </div>
        <TrustBadge level="verified" label="Deterministic" />
      </SitaCard>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Peace Score" value={peace.compositeScore} icon={Heart} sub={`Grade: ${peace.grade}`} />
        <KPITile label="Top Strength" value={peace.topStrength} icon={CheckCircle} />
        <KPITile label="Top Weakness" value={peace.topWeakness} icon={AlertTriangle} />
        <KPITile label="Trend" value={peace.trend} icon={TrendIcon} />
      </div>

      {/* Dimension Breakdown */}
      <SitaSectionHeader title="Peace Dimensions" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {peace.dimensions.map(d => {
          const Icon = statusIcons[d.status] || Shield;
          const colors = statusColors[d.status] || statusColors.adequate;
          return (
            <SitaCard key={d.key} hover className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`h-3.5 w-3.5 ${colors.split(" ")[1]}`} />
                  <p className="font-display text-sm font-semibold text-foreground">{d.label}</p>
                  <span className="text-[10px] text-muted-foreground">({d.weight}% weight)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${colors.split(" ")[0]}/10 ${colors.split(" ")[1]} font-medium capitalize`}>{d.status}</span>
                  <span className="font-display text-sm font-bold text-foreground">{d.score}</span>
                </div>
              </div>
              <ConfidenceBar value={d.score} size="sm" />
              <p className="text-xs text-muted-foreground mt-2">{d.insight}</p>
            </SitaCard>
          );
        })}
      </div>

      <LiveAdvisorCard
        advisor="money" intent="peace_score_review"
        demoName="Peace Score Advisor" demoRole="Emotional Financial Intelligence" demoConfidence="High"
        demoRecommendation={`Peace Score: ${peace.compositeScore}/100 (${peace.grade}). Strongest: ${peace.topStrength}. Focus area: ${peace.topWeakness}. ${peace.guidance}`}
        demoReasoning="8-dimension weighted composite evaluating financial calm across reserves, bills, debt, tax, income, obligations, breathing room, and household coordination."
      />
    </motion.div>
  );
};

export default PeaceScore;
