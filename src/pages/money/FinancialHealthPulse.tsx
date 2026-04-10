// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Financial Health Pulse
// Composite scoring across all money dimensions
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { Heart, Shield, TrendingUp, AlertTriangle, CheckCircle, Target, DollarSign, CreditCard, Receipt, PiggyBank, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { computeFinancialHealth } from "@/lib/services/finance-os/financial-health.service";

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

        {/* Founder Boundary + Advisor */}
        <div className="space-y-4">
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

          <LiveAdvisorCard
            advisor="money"
            intent="financial_health_review"
            context={{ score: health.overallScore, grade: health.grade, action_count: health.actionItems.length }}
            demoName="Chief Money Strategist"
            demoRole="Holistic Financial Intelligence"
            demoConfidence="High"
            demoRecommendation={`Overall health: ${health.grade} (${health.overallScore}/100). ${health.actionItems.length} improvement opportunities identified. Focus on ${health.actionItems[0]?.title || "maintaining current trajectory"}.`}
            demoReasoning="Synthesized analysis across safe-to-spend, debt pressure, reserves, savings rate, credit, and tax preparedness."
          />
        </div>
      </div>
    </motion.div>
  );
};

export default FinancialHealthPulse;
