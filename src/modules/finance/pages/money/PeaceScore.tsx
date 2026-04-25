// ═══════════════════════════════════════════════════════════════
// SITA OS — Financial Peace Score (Signature Emotional Surface)
// ═══════════════════════════════════════════════════════════════

import { HeroCard, StatusCard, AdvisorCard } from "@/components/sita/cards";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { AppSurface } from "@/components/sita/surfaces/AppSurface";
import { cn } from "@/lib/utils";
import { Heart, Shield, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { computePeaceScore } from "@/lib/services/finance-os/peace-score.service";

const statusIcons: Record<string, typeof CheckCircle> = {
  strong: CheckCircle, adequate: Shield, weak: AlertTriangle, critical: AlertTriangle,
};

const PeaceScore = () => {
  const peace = useMemo(() => computePeaceScore({
    reserveFundedPct: 45, billsCoveredPct: 100, debtToIncomeRatio: 0.28,
    taxReservedPct: 65, incomeStabilityScore: 72, obligationPressurePct: 52,
    discretionaryRoomPct: 18, householdCoordinationScore: 78,
  }), []);

  const gradeColor = peace.compositeScore >= 80 ? "hsl(152 55% 48%)" :
    peace.compositeScore >= 60 ? "hsl(265 55% 58%)" :
    peace.compositeScore >= 40 ? "hsl(38 85% 58%)" : "hsl(0 70% 55%)";

  const TrendIcon = peace.trend === "improving" ? TrendingUp : peace.trend === "declining" ? TrendingDown : Minus;

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <PageTruthBanner truthState="demo" />

      {/* Signature Hero — Large emotional typography */}
      <HeroCard
        title="Financial Peace Score"
        metric=""
        subtitle="How calm and controlled your financial life feels"
        accentFrom="hsl(152 55% 48%)"
        accentTo="hsl(190 60% 45%)"
        icon={<Heart className="h-5 w-5 text-[hsl(152_55%_58%)]" />}
      >
        <div className="flex flex-col items-center">
          <div className="relative">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(0 0% 20%)" strokeWidth="5" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={gradeColor}
                strokeWidth="5" strokeLinecap="round"
                strokeDasharray={`${peace.compositeScore * 2.64} 264`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <p className="text-2xl font-bold tabular-nums" style={{ color: gradeColor }}>{peace.compositeScore}</p>
            </div>
          </div>
          <p className="text-[10px] font-semibold mt-1" style={{ color: gradeColor }}>Grade: {peace.grade}</p>
        </div>
      </HeroCard>

      {/* Emotional summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatusCard label="Peace Score" status={peace.compositeScore >= 60 ? "healthy" : "degraded"} lastChecked={`${peace.compositeScore}/100`} icon={<Heart className="h-3.5 w-3.5" />} />
        <StatusCard label="Trend" status={peace.trend === "improving" ? "healthy" : peace.trend === "declining" ? "down" : "healthy"} lastChecked={peace.trend} icon={<TrendIcon className="h-3.5 w-3.5" />} />
        <StatusCard label="Top Strength" status="healthy" lastChecked={peace.topStrength} icon={<CheckCircle className="h-3.5 w-3.5" />} />
        <StatusCard label="Focus Area" status="degraded" lastChecked={peace.topWeakness} icon={<AlertTriangle className="h-3.5 w-3.5" />} />
      </div>

      {/* Guidance */}
      <AppSurface level={1} className="p-4">
        <p className="text-[12px] text-[hsl(0_0%_70%)] leading-relaxed">{peace.guidance}</p>
      </AppSurface>

      {/* Dimension Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {peace.dimensions.map(d => {
          const Icon = statusIcons[d.status] || Shield;
          const dimColor = d.status === "strong" ? "hsl(152 55% 48%)" : d.status === "adequate" ? "hsl(265 55% 58%)" : d.status === "weak" ? "hsl(38 85% 58%)" : "hsl(0 70% 55%)";
          return (
            <AppSurface key={d.key} level={1} className="p-4 micro-hover-lift">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" style={{ color: dimColor }} />
                  <p className="text-[12px] font-semibold text-[hsl(0_0%_85%)]">{d.label}</p>
                  <span className="text-[9px] text-[hsl(0_0%_45%)]">({d.weight}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full capitalize" style={{ background: `${dimColor} / 0.12`, color: dimColor }}>{d.status}</span>
                  <span className="text-[13px] font-bold text-[hsl(0_0%_90%)] tabular-nums">{d.score}</span>
                </div>
              </div>
              <ConfidenceBar value={d.score} size="sm" />
              <p className="text-[10px] text-[hsl(0_0%_55%)] mt-2">{d.insight}</p>
            </AppSurface>
          );
        })}
      </div>

      <ModuleAdvisorInsight
        advisorName="Peace Score Advisor"
        domain="finance"
        confidence={90}
        insight={`Peace Score: ${peace.compositeScore}/100 (${peace.grade}). Strongest: ${peace.topStrength}. Focus area: ${peace.topWeakness}. ${peace.guidance}`}
        linkedItems={[peace.topStrength, peace.topWeakness]}
      />
    </motion.div>
  );
};

export default PeaceScore;
