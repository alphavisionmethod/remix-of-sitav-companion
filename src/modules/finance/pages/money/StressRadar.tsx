// ═══════════════════════════════════════════════════════════════
// SITA OS — Financial Stress Radar (Signature Emotional Surface)
// ═══════════════════════════════════════════════════════════════

import { HeroCard, QueueCard, StatusCard } from "@/platform/sita/components/sita/cards";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { ModuleAdvisorInsight } from "@/platform/sita/components/sita/domain-shared/ModuleAdvisorInsight";
import { ConfidenceBar } from "@/platform/sita/components/sita/primitives/ConfidenceBar";
import { AppSurface } from "@/platform/sita/components/sita/surfaces/AppSurface";
import { cn } from "@/lib/utils";
import { AlertTriangle, ShieldAlert, Calendar, TrendingDown, Zap, CreditCard, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { computeStressRadar } from "@/lib/services/finance-os/stress-radar.service";

const severityColor: Record<string, string> = {
  critical: "hsl(0 70% 55%)", high: "hsl(38 85% 58%)", medium: "hsl(265 55% 58%)", low: "hsl(0 0% 50%)",
};

const categoryIcons: Record<string, typeof AlertTriangle> = {
  "cash-squeeze": DollarSign, "bill-collision": Calendar, "reserve-weakness": ShieldAlert,
  "debt-inflection": TrendingDown, "cashflow-fragility": Zap, "founder-draw": DollarSign,
  "tax-shortfall": AlertTriangle, "subscription-creep": CreditCard, "float-reliance": TrendingDown,
  "utilization-danger": CreditCard,
};

const StressRadar = () => {
  const radar = useMemo(() => computeStressRadar({
    cashBalanceCents: 1240000, monthlyIncomeCents: 850000, monthlyBurnCents: 720000,
    upcomingBills: [
      { name: "Rent", amountCents: 250000, dueDate: new Date(Date.now() + 5 * 86400000).toISOString() },
      { name: "Insurance", amountCents: 45000, dueDate: new Date(Date.now() + 5 * 86400000).toISOString() },
      { name: "Utilities", amountCents: 18000, dueDate: new Date(Date.now() + 8 * 86400000).toISOString() },
      { name: "Car Payment", amountCents: 42000, dueDate: new Date(Date.now() + 12 * 86400000).toISOString() },
      { name: "Credit Card", amountCents: 85000, dueDate: new Date(Date.now() + 15 * 86400000).toISOString() },
    ],
    reserveFundedPct: 45, reserveTargetCents: 500000, totalDebtCents: 4800000,
    monthlyDebtPaymentCents: 127000, creditUtilizationPct: 34,
    subscriptionMonthlyCents: 42000, subscriptionCountActive: 12,
    taxReservedPct: 65, taxOwedEstimateCents: 660000,
    founderDrawMonthlyCents: 350000, founderDrawStable: false,
    floatReliancePct: 12,
  }), []);

  const critCount = radar.signals.filter(s => s.severity === "critical").length;
  const highCount = radar.signals.filter(s => s.severity === "high").length;
  const calmScore = Math.max(0, 100 - radar.signals.length * 12);

  const stressColor = radar.overallStressLevel === "critical" ? "hsl(0 70% 55%)" :
    radar.overallStressLevel === "high" ? "hsl(38 85% 58%)" : "hsl(152 55% 48%)";

  // Queue items from signals
  const signalQueue = radar.signals
    .sort((a, b) => { const o = { critical: 0, high: 1, medium: 2, low: 3 }; return (o[a.severity] ?? 3) - (o[b.severity] ?? 3); })
    .map(s => ({
      id: s.id,
      label: s.title,
      meta: s.impactCents > 0 ? `$${(s.impactCents / 100).toLocaleString()}` : undefined,
      urgency: ((s.severity === "critical" ? "critical" : s.severity === "high" ? "high" : "normal") as "critical" | "high" | "normal"),
    }));

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <PageTruthBanner truthState="demo" />

      {/* Signature Hero — Emotional stress visualization */}
      <HeroCard
        title="Financial Stress Radar"
        metric={`${radar.signals.length} signals`}
        subtitle="Detect financial stress before you feel it"
        accentFrom={stressColor}
        accentTo="hsl(210 60% 45%)"
        icon={<ShieldAlert className="h-5 w-5" style={{ color: stressColor }} />}
      >
        <div className="flex flex-col items-center">
          <p className="text-xl font-bold uppercase tracking-wider" style={{ color: stressColor }}>{radar.overallStressLevel}</p>
          <p className="text-[9px] text-[hsl(0_0%_50%)] mt-0.5">Stress Level</p>
        </div>
      </HeroCard>

      {/* Calm gauge */}
      <AppSurface level={1} className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <ShieldAlert className="h-4 w-4" style={{ color: stressColor }} />
          <span className="text-[11px] font-semibold text-[hsl(0_0%_85%)]">Financial Calm</span>
          <span className="text-[10px] text-[hsl(0_0%_50%)] ml-auto">{radar.signals.length} stress signals</span>
        </div>
        <ConfidenceBar value={calmScore} size="lg" />
      </AppSurface>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatusCard label="Active Signals" status={critCount > 0 ? "down" : "degraded"} lastChecked={`${radar.signals.length}`} icon={<AlertTriangle className="h-3.5 w-3.5" />} />
        <StatusCard label="Critical" status={critCount > 0 ? "down" : "healthy"} lastChecked={`${critCount}`} icon={<ShieldAlert className="h-3.5 w-3.5" />} />
        <StatusCard label="Squeeze Windows" status={radar.squeezeWindows.length > 0 ? "degraded" : "healthy"} lastChecked={`${radar.squeezeWindows.length}`} icon={<Calendar className="h-3.5 w-3.5" />} />
        <StatusCard label="Bill Collisions" status={radar.billCollisions.length > 0 ? "degraded" : "healthy"} lastChecked={`${radar.billCollisions.length}`} icon={<Zap className="h-3.5 w-3.5" />} />
      </div>

      {/* Stress signals as queue */}
      <QueueCard title="STRESS SIGNALS" items={signalQueue} maxVisible={10} />

      {/* Signal Details */}
      <div className="space-y-2">
        {radar.signals.slice(0, 4).map(signal => {
          const Icon = categoryIcons[signal.category] || AlertTriangle;
          const color = severityColor[signal.severity] || severityColor.low;
          return (
            <AppSurface key={signal.id} level={1} className="p-4 micro-hover-lift" style={{ borderLeft: `3px solid ${color}` }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center" style={{ background: `${color} / 0.12` }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-[12px] font-semibold text-[hsl(0_0%_85%)]">{signal.title}</p>
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: `${color} / 0.12`, color }}>{signal.severity}</span>
                  </div>
                  <p className="text-[11px] text-[hsl(0_0%_55%)] mb-2">{signal.description}</p>
                  {signal.impactCents > 0 && <p className="text-[11px] font-semibold text-[hsl(0_0%_80%)] mb-1">Impact: ${(signal.impactCents / 100).toLocaleString()}</p>}
                  <div className="space-y-0.5">
                    {signal.mitigations.slice(0, 2).map((m, i) => (
                      <p key={i} className="text-[10px] text-[hsl(0_0%_50%)]">• {m}</p>
                    ))}
                  </div>
                </div>
              </div>
            </AppSurface>
          );
        })}
      </div>

      {/* Bill Collisions */}
      {radar.billCollisions.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {radar.billCollisions.map((c, i) => (
            <AppSurface key={i} level={1} className="p-3 micro-hover-lift">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-3.5 w-3.5 text-[hsl(38_85%_58%)]" />
                <p className="text-[11px] font-semibold text-[hsl(0_0%_85%)]">{new Date(c.date).toLocaleDateString("en", { month: "short", day: "numeric" })}</p>
              </div>
              <p className="text-[10px] text-[hsl(0_0%_55%)]">{c.bills.length} bills · ${(c.totalCents / 100).toLocaleString()}</p>
            </AppSurface>
          ))}
        </div>
      )}

      <ModuleAdvisorInsight
        advisorName="Stress Radar Advisor"
        domain="finance"
        confidence={88}
        insight={`${radar.signals.length} stress signals detected. ${critCount > 0 ? `${critCount} critical issues require immediate attention.` : "No critical issues."} Focus on ${radar.signals[0]?.title || "maintaining stability"}.`}
        linkedItems={radar.signals.slice(0, 3).map(s => s.title)}
      />
    </motion.div>
  );
};

export default StressRadar;
