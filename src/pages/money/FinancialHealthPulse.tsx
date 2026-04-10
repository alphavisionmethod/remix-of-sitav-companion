// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Financial Health Pulse
// Composite scoring + Emotional Finance + Income Quality + Full Founder Split Brain
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { Heart, Shield, TrendingUp, AlertTriangle, CheckCircle, Target, DollarSign, Brain, Activity, BarChart3, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { computeFinancialHealth } from "@/lib/services/finance-os/financial-health.service";
import { computeIncomeQuality } from "@/lib/services/finance-os/income-quality.service";

// ── Emotional Finance Types ──
interface EmotionalPattern {
  type: "panic" | "guilt" | "avoidance" | "stress-float" | "defer" | "feast-famine";
  label: string;
  severity: "high" | "medium" | "low";
  frequency: string;
  description: string;
  guidance: string;
  suggestedMode: string;
}

const FinancialHealthPulse = () => {
  const { isDemoMode } = useDataMode();

  const health = useMemo(() => computeFinancialHealth({
    safeToSpendCents: 245000,
    monthlyIncomeCents: 850000,
    totalDebtCents: 4813000,
    debtToIncomeRatio: 10.4,
    creditUtilization: 24.5,
    billsCoveredPct: 100,
    reserveFundedPct: 60,
    savingsRatePct: 18,
    recurringBurdenPct: 52,
    taxReservedPct: 75,
    wasteSubscriptionCount: 2,
    overdueReceivablesCents: 0,
    personalInBusinessCents: 4500,
    businessInPersonalCents: 12000,
  }), []);

  // ── Income Quality Score ──
  const incomeQuality = useMemo(() => computeIncomeQuality({
    streams: [
      { name: "Consulting Retainer", monthlyCents: 600000, recurring: true, clientName: "Acme Corp", paymentDelayDays: 5, seasonal: false },
      { name: "SaaS Revenue", monthlyCents: 150000, recurring: true, clientName: "Platform", paymentDelayDays: 0, seasonal: false },
      { name: "Freelance Projects", monthlyCents: 100000, recurring: false, clientName: "Various", paymentDelayDays: 30, seasonal: true },
    ],
    householdDependents: 2,
  }), []);

  // ── Emotional Finance Patterns ──
  const emotionalPatterns = useMemo<EmotionalPattern[]>(() => [
    {
      type: "avoidance",
      label: "Financial Avoidance",
      severity: "medium",
      frequency: "Recurring",
      description: "3 bills were paid late despite sufficient funds. Pattern suggests avoidance of financial engagement rather than cash shortage.",
      guidance: "Try the Weekly Reset ritual to build a regular rhythm. Even 5 minutes of financial check-in reduces avoidance patterns.",
      suggestedMode: "Stable",
    },
    {
      type: "feast-famine",
      label: "Feast/Famine Spending",
      severity: "medium",
      frequency: "Monthly cycle",
      description: "Spending spikes 2.4x in the first week after income, then drops sharply. This pattern creates artificial scarcity in weeks 3-4.",
      guidance: "Pre-allocate income on arrival using the Cash Allocator. This smooths spending across the month.",
      suggestedMode: "Tighten",
    },
    {
      type: "stress-float",
      label: "Stress-Induced Float Reliance",
      severity: "low",
      frequency: "Occasional",
      description: "Credit card float usage increases during high-stress work periods. 2 instances in the last quarter.",
      guidance: "Build a 1-week expense buffer in checking to eliminate float dependency during stressful periods.",
      suggestedMode: "Recovery",
    },
  ], []);

  // ── Founder Split Brain Protection ──
  const founderSplitBrain = useMemo(() => ({
    fakeProfitability: {
      detected: true,
      description: "Business shows $3,200/mo profit, but $1,800 of that relies on delayed owner reimbursements. True operating profit: $1,400/mo.",
      severity: "high" as const,
    },
    delayedReimbursements: {
      total: 890,
      avgDays: 38,
      trend: "increasing" as const,
    },
    founderOptimism: {
      detected: true,
      description: "Cash allocation assumes 95th-percentile revenue outcomes. Historical median is 22% lower. Operating decisions may be over-optimistic.",
      severity: "medium" as const,
    },
    payrollReserveWeakness: {
      monthsCovered: 1.2,
      target: 3,
      severity: "high" as const,
    },
  }), []);

  const gradeColor = health.overallScore >= 80 ? "text-trust-verified" :
    health.overallScore >= 60 ? "text-primary" :
    health.overallScore >= 40 ? "text-amber-500" : "text-red-500";

  const statusIcon = (status: string) => {
    if (status === "excellent" || status === "good") return <CheckCircle className="h-3.5 w-3.5 text-trust-verified" />;
    if (status === "fair") return <Target className="h-3.5 w-3.5 text-amber-500" />;
    return <AlertTriangle className="h-3.5 w-3.5 text-red-500" />;
  };

  const statusColor = (status: string) => {
    if (status === "excellent" || status === "good") return "bg-emerald-500";
    if (status === "fair") return "bg-amber-500";
    return "bg-red-500";
  };

  const iqGradeColor = incomeQuality.compositeGrade === "A" ? "text-trust-verified" :
    incomeQuality.compositeGrade === "B" ? "text-primary" :
    incomeQuality.compositeGrade === "C" ? "text-amber-500" : "text-red-500";

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <DomainHeader domain="money" title="Financial Health Pulse" subtitle="Composite health score across all money dimensions" />
      <DemoModeBadge />

      {/* Overall Score */}
      <SitaCard hover={false} className="p-6 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" className="text-muted" strokeWidth="8" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" className={gradeColor}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${health.overallScore * 2.51} 251`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div>
                <p className={`font-display text-2xl font-bold ${gradeColor}`}>{health.grade}</p>
                <p className="text-xs text-muted-foreground">{health.overallScore}/100</p>
              </div>
            </div>
          </div>
          <div className="text-left">
            <p className="font-display text-lg font-bold">Financial Health: {health.grade}</p>
            <p className={`text-sm font-semibold ${health.trend === "improving" ? "text-trust-verified" : health.trend === "declining" ? "text-red-500" : "text-muted-foreground"}`}>
              {health.trend === "improving" ? "↑ Improving" : health.trend === "declining" ? "↓ Declining" : "→ Stable"}
            </p>
          </div>
        </div>
        <TrustBadge level="verified" />
      </SitaCard>

      {/* Dimension Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {health.dimensions.map(d => (
          <SitaCard key={d.key} hover className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {statusIcon(d.status)}
                <p className="font-display text-sm font-semibold">{d.label}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground capitalize">{d.status}</span>
                <span className="font-display text-sm font-bold">{d.score}</span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-1.5">
              <div className={`h-full rounded-full ${statusColor(d.status)}`} style={{ width: `${d.score}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">{d.insight}</p>
          </SitaCard>
        ))}
      </div>

      {/* ═══ Income Quality Score ═══ */}
      <SitaSectionHeader title="Income Quality Score" />
      <SitaCard hover={false} className="p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-display text-lg font-bold">Income Quality: <span className={iqGradeColor}>{incomeQuality.compositeGrade}</span></p>
            <p className="text-xs text-muted-foreground">Composite score: {incomeQuality.compositeScore}/100 — Not all income is equal</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {incomeQuality.dimensions.map(dim => (
            <div key={dim.key} className="rounded-xl bg-secondary/30 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground">{dim.label}</p>
                <span className={`text-sm font-bold ${dim.score >= 80 ? "text-trust-verified" : dim.score >= 60 ? "text-primary" : dim.score >= 40 ? "text-amber-500" : "text-red-500"}`}>{dim.score}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1.5">
                <div className={`h-full rounded-full ${dim.score >= 80 ? "bg-emerald-500" : dim.score >= 60 ? "bg-primary" : dim.score >= 40 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${dim.score}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground">{dim.insight}</p>
            </div>
          ))}
        </div>
      </SitaCard>

      {/* ═══ Emotional Finance Layer ═══ */}
      <SitaSectionHeader title="Emotional Finance Layer" />
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-3">
          <SitaCard hover={false} className="p-4 mb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Money is emotional, not just mathematical.</p>
              <p className="text-xs text-muted-foreground ml-2">SITA detects behavioral spending patterns that undermine financial goals.</p>
            </div>
          </SitaCard>
        </div>
        {emotionalPatterns.map(pattern => (
          <SitaCard key={pattern.type} hover className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className={`h-4 w-4 ${pattern.severity === "high" ? "text-destructive" : pattern.severity === "medium" ? "text-amber-500" : "text-muted-foreground"}`} />
              <p className="font-display text-sm font-semibold">{pattern.label}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${pattern.severity === "high" ? "bg-destructive/10 text-destructive" : pattern.severity === "medium" ? "bg-amber-500/10 text-amber-500" : "bg-secondary text-muted-foreground"}`}>
                {pattern.severity}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{pattern.description}</p>
            <p className="text-xs text-muted-foreground italic mb-2">Frequency: {pattern.frequency}</p>
            <div className="rounded-lg bg-primary/5 border border-primary/10 p-2.5 mb-2">
              <p className="text-xs text-primary">💡 {pattern.guidance}</p>
            </div>
            <p className="text-[10px] text-muted-foreground">Suggested mode: <span className="font-semibold text-foreground">{pattern.suggestedMode}</span></p>
          </SitaCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Items */}
        {health.actionItems.length > 0 && (
          <div className="space-y-3">
            <SitaSectionHeader title="Priority Actions" />
            {health.actionItems.map((item, i) => (
              <SitaCard key={i} hover className="p-3">
                <div className="flex items-start gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${item.priority === "high" ? "bg-red-500/10 text-red-500" : item.priority === "medium" ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"}`}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-display text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                    <p className="text-xs text-primary mt-1">+{item.potentialImpact} pts potential impact</p>
                  </div>
                </div>
              </SitaCard>
            ))}
          </div>
        )}

        {/* Founder Split Brain Protection + Advisor */}
        <div className="space-y-4">
          {/* Original Boundary Monitor */}
          {health.founderBoundary && health.founderBoundary.comingled && (
            <>
              <SitaSectionHeader title="Founder Boundary Monitor" />
              <SitaCard hover={false} className={`p-4 ${health.founderBoundary.riskLevel === "critical" || health.founderBoundary.riskLevel === "high" ? "border-red-500/30 bg-red-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className={`h-4 w-4 ${health.founderBoundary.riskLevel === "critical" || health.founderBoundary.riskLevel === "high" ? "text-red-500" : "text-amber-500"}`} />
                  <SitaCardTitle>Personal/Business Co-Mingling Detected</SitaCardTitle>
                </div>
                <p className={`text-xs font-semibold mb-2 ${health.founderBoundary.riskLevel === "critical" || health.founderBoundary.riskLevel === "high" ? "text-red-500" : "text-amber-500"}`}>
                  Risk: {health.founderBoundary.riskLevel.toUpperCase()}
                </p>
                {health.founderBoundary.violations.map((v, i) => (
                  <p key={i} className="text-xs text-muted-foreground">• {v}</p>
                ))}
              </SitaCard>
            </>
          )}

          {/* ═══ Full Founder Split Brain Protection ═══ */}
          <SitaSectionHeader title="Founder Split Brain Protection" />

          {/* Fake Profitability */}
          {founderSplitBrain.fakeProfitability.detected && (
            <SitaCard hover={false} className="p-4 border-l-4 border-l-destructive">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-destructive" />
                <p className="font-display text-sm font-semibold text-destructive">Fake Profitability Alert</p>
              </div>
              <p className="text-xs text-muted-foreground">{founderSplitBrain.fakeProfitability.description}</p>
            </SitaCard>
          )}

          {/* Delayed Reimbursements */}
          <SitaCard hover={false} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-display text-sm font-semibold">Delayed Reimbursements</p>
              <span className={`text-xs font-semibold ${founderSplitBrain.delayedReimbursements.avgDays > 30 ? "text-urgency-high" : "text-muted-foreground"}`}>
                Avg {founderSplitBrain.delayedReimbursements.avgDays}d
              </span>
            </div>
            <p className="text-xs text-muted-foreground">${founderSplitBrain.delayedReimbursements.total} outstanding • Trend: {founderSplitBrain.delayedReimbursements.trend}</p>
          </SitaCard>

          {/* Founder Optimism */}
          {founderSplitBrain.founderOptimism.detected && (
            <SitaCard hover={false} className="p-4 border-l-4 border-l-amber-500">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <p className="font-display text-sm font-semibold text-amber-500">Dangerous Founder Optimism</p>
              </div>
              <p className="text-xs text-muted-foreground">{founderSplitBrain.founderOptimism.description}</p>
            </SitaCard>
          )}

          {/* Payroll Reserve Weakness */}
          <SitaCard hover={false} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-display text-sm font-semibold">Payroll/Operating Reserve</p>
              <span className={`text-xs font-semibold ${founderSplitBrain.payrollReserveWeakness.monthsCovered < 2 ? "text-destructive" : "text-trust-verified"}`}>
                {founderSplitBrain.payrollReserveWeakness.monthsCovered} / {founderSplitBrain.payrollReserveWeakness.target} months
              </span>
            </div>
            <ConfidenceBar value={Math.round((founderSplitBrain.payrollReserveWeakness.monthsCovered / founderSplitBrain.payrollReserveWeakness.target) * 100)} label="Reserve coverage" size="md" />
          </SitaCard>

          <LiveAdvisorCard
            advisor="money"
            intent="financial_health_review"
            context={{ score: health.overallScore, grade: health.grade, action_count: health.actionItems.length }}
            demoName="Chief Money Strategist"
            demoRole="Holistic Financial Intelligence"
            demoConfidence="High"
            demoRecommendation={`Overall health: ${health.grade} (${health.overallScore}/100). Income quality: ${incomeQuality.compositeGrade}. ${emotionalPatterns.length} emotional patterns detected. ${health.actionItems.length} improvement opportunities. Focus on ${health.actionItems[0]?.title || "maintaining current trajectory"}.`}
            demoReasoning="Synthesized analysis across safe-to-spend, debt pressure, reserves, savings rate, credit, tax preparedness, income quality, and emotional spending patterns."
          />
        </div>
      </div>
    </motion.div>
  );
};

export default FinancialHealthPulse;
