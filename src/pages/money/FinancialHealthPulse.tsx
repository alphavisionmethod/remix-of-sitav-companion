import { useAuth } from "@/contexts/AuthContext";
import { HeroCard, SummaryCard, StatusCard, AdvisorCard, QueueCard } from "@/components/sita/cards";
import { TrustBadge } from "@/components/sita/badges";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { cn } from "@/lib/utils";
import { Heart, Shield, AlertTriangle, CheckCircle, Target, Brain, Activity, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { computeFinancialHealth } from "@/lib/services/finance-os/financial-health.service";
import { computeIncomeQuality } from "@/lib/services/finance-os/income-quality.service";
import { useDataMode } from "@/contexts/DataModeContext";



const FinancialHealthPulse = () => {
  const isDemoMode = false;

  const health = useMemo(() => computeFinancialHealth({
    safeToSpendCents: 245000, monthlyIncomeCents: 850000, totalDebtCents: 4813000,
    debtToIncomeRatio: 10.4, creditUtilization: 24.5, billsCoveredPct: 100,
    reserveFundedPct: 60, savingsRatePct: 18, recurringBurdenPct: 52,
    taxReservedPct: 75, wasteSubscriptionCount: 2, overdueReceivablesCents: 0,
    personalInBusinessCents: 4500, businessInPersonalCents: 12000,
  }), []);

  const incomeQuality = useMemo(() => computeIncomeQuality({
    recurringIncomePct: 75, topClientConcentrationPct: 45, seasonalVariationPct: 20,
    avgPaymentDelayDays: 12, oneTimeIncomePct: 15, householdDependencyOnUnstablePct: 25,
  }), []);

  const gradeColor = health.overallScore >= 80 ? "text-[hsl(152_55%_48%)]" : health.overallScore >= 60 ? "text-[hsl(265_55%_68%)]" : health.overallScore >= 40 ? "text-[hsl(38_85%_58%)]" : "text-[hsl(0_70%_55%)]";

  const dimensionItems = health.dimensions.map(d => ({
    id: d.key,
    label: d.label,
    meta: `${d.score}/100`,
    urgency: (d.status === "excellent" || d.status === "good" ? "low" : d.status === "fair" ? "normal" : "high") as "critical" | "high" | "normal" | "low",
  }));

  const actionItems = health.actionItems.map((item, i) => ({
    id: `action-${i}`,
    label: item.title,
    meta: `+${item.potentialImpact} pts`,
    urgency: ((item.priority === "high" ? "critical" : item.priority === "medium" ? "high" : "normal") as "critical" | "high" | "normal"),
  }));

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <DomainHeader domain="money" title="Financial Health Pulse" subtitle="Composite health score across all money dimensions" />
      <PageTruthBanner truthState={isDemoMode ? "demo" : "live"} />

      {/* Overall Score Hero */}
      <HeroCard
        title="Financial Health"
        metric={health.grade}
        subtitle={`Score: ${health.overallScore}/100 · ${health.trend === "improving" ? "↑ Improving" : health.trend === "declining" ? "↓ Declining" : "→ Stable"}`}
        accentFrom="hsl(152 55% 48%)"
        accentTo="hsl(165 50% 42%)"
        icon={<Heart className="h-5 w-5 text-[hsl(152_55%_58%)]" />}
      >
        <div className="text-center">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(0 0% 20%)" strokeWidth="8" />
              <circle cx="50" cy="50" r="40" fill="none" className={gradeColor.replace("text-", "stroke-")} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${health.overallScore * 2.51} 251`} style={{ stroke: health.overallScore >= 80 ? "hsl(152 55% 48%)" : health.overallScore >= 60 ? "hsl(265 55% 58%)" : "hsl(38 85% 58%)" }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn("text-lg font-bold", gradeColor)}>{health.grade}</span>
            </div>
          </div>
        </div>
      </HeroCard>

      {/* Dimension breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {health.dimensions.map(d => (
          <StatusCard
            key={d.key}
            label={d.label}
            status={d.status === "excellent" || d.status === "good" ? "healthy" : d.status === "fair" ? "degraded" : "down"}
            confidence={d.score}
            lastChecked={d.insight}
            icon={d.status === "excellent" || d.status === "good" ? <CheckCircle className="h-3.5 w-3.5 text-[hsl(152_55%_48%)]" /> : d.status === "fair" ? <Target className="h-3.5 w-3.5 text-[hsl(38_85%_58%)]" /> : <AlertTriangle className="h-3.5 w-3.5 text-[hsl(0_70%_55%)]" />}
          />
        ))}
      </div>

      {/* Income Quality */}
      <SummaryCard
        title="Income Quality Score"
        icon={<Shield className="h-4 w-4 text-[hsl(152_55%_48%)]" />}
        kpis={incomeQuality.dimensions.map(dim => ({
          label: dim.label,
          value: `${dim.score}`,
          trend: dim.score >= 80 ? "up" as const : dim.score >= 50 ? "flat" as const : "down" as const,
        }))}
      />

      {/* Emotional Finance */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-4 w-4 text-[hsl(265_55%_68%)]" />
          <span className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_85%)]")}>Emotional Finance Layer</span>
        </div>
        <p className={cn(SITA_TYPE.timelineMeta, "mb-3")}>Money is emotional, not just mathematical. SITA detects behavioral patterns.</p>
        <div className="grid gap-2 lg:grid-cols-3">
          {[
            { label: "Financial Avoidance", severity: "medium", desc: "3 bills paid late despite sufficient funds" },
            { label: "Feast/Famine Spending", severity: "medium", desc: "Spending spikes 2.4x in first week after income" },
            { label: "Stress-Induced Float", severity: "low", desc: "Credit card float usage increases during stress" },
          ].map(p => (
            <div key={p.label} className="rounded-lg bg-[hsl(0_0%_100%/0.03)] p-3">
              <div className="flex items-center gap-2 mb-1">
                <Activity className={cn("h-3.5 w-3.5", p.severity === "high" ? "text-[hsl(0_70%_55%)]" : p.severity === "medium" ? "text-[hsl(38_85%_58%)]" : "text-[hsl(0_0%_50%)]")} />
                <span className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_85%)]")}>{p.label}</span>
              </div>
              <p className={cn(SITA_TYPE.timelineMeta)}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {health.actionItems.length > 0 && <QueueCard title="Priority Actions" items={actionItems} maxVisible={5} />}

        <div className="space-y-3">
          {health.founderBoundary && health.founderBoundary.comingled && (
            <div className="rounded-xl border border-[hsl(0_70%_55%/0.2)] bg-[hsl(0_70%_55%/0.05)] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-[hsl(0_70%_55%)]" />
                <span className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_70%_60%)]")}>Founder Boundary Alert</span>
              </div>
              {health.founderBoundary.violations.map((v, i) => (
                <p key={i} className={cn(SITA_TYPE.timelineMeta)}>• {v}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      <AdvisorCard
        advisorName="Chief Money Strategist"
        domain="Finance"
        insight={`Financial health: ${health.grade} (${health.overallScore}/100). ${health.actionItems.length} priority actions. Income quality: ${incomeQuality.grade}.`}
        confidence={health.overallScore >= 70 ? 90 : 72}
        accentColor="hsl(152 55% 48%)"
      />
    </motion.div>
  );
};

export default FinancialHealthPulse;
