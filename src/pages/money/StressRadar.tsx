// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Financial Stress Radar
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { AlertTriangle, ShieldAlert, Calendar, TrendingDown, Zap, CreditCard, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { computeStressRadar } from "@/lib/services/finance-os/stress-radar.service";

const severityColor: Record<string, string> = {
  critical: "text-destructive bg-destructive/10 border-destructive/30",
  high: "text-urgency-high bg-urgency-high/10 border-urgency-high/30",
  medium: "text-[hsl(var(--sita-gold))] bg-[hsl(var(--sita-gold))]/10 border-[hsl(var(--sita-gold))]/30",
  low: "text-muted-foreground bg-secondary/40 border-border",
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

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <DomainHeader domain="money" title="Financial Stress Radar" subtitle="Detect financial stress before you feel it" />
      <DemoModeBadge />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Active Signals" value={radar.signals.length} icon={AlertTriangle} sub={`${critCount} critical, ${highCount} high`} />
        <KPITile label="Overall Stress" value={radar.overallStressLevel.toUpperCase()} icon={ShieldAlert} />
        <KPITile label="Squeeze Windows" value={radar.squeezeWindows.length} icon={Calendar} sub="Next 60 days" />
        <KPITile label="Bill Collisions" value={radar.billCollisions.length} icon={Zap} sub="Same-day clusters" />
      </div>

      {/* Overall Stress Gauge */}
      <SitaCard hover={false} className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <ShieldAlert className={`h-5 w-5 ${radar.overallStressLevel === "critical" ? "text-destructive" : radar.overallStressLevel === "high" ? "text-urgency-high" : "text-[hsl(var(--sita-gold))]"}`} />
          <SitaCardTitle sub={`${radar.signals.length} stress signals detected across 10 dimensions`}>Stress Overview</SitaCardTitle>
        </div>
        <ConfidenceBar value={Math.max(0, 100 - radar.signals.length * 12)} label="Financial Calm" size="lg" />
      </SitaCard>

      {/* Stress Signals */}
      <SitaSectionHeader title="Active Stress Signals" />
      <div className="space-y-3">
        {radar.signals.sort((a, b) => {
          const order = { critical: 0, high: 1, medium: 2, low: 3 };
          return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
        }).map(signal => {
          const Icon = categoryIcons[signal.category] || AlertTriangle;
          const colors = severityColor[signal.severity] || severityColor.low;
          return (
            <SitaCard key={signal.id} hover className={`p-4 border-l-4 ${colors.split(" ").slice(2).join(" ")}`}>
              <div className="flex items-start gap-3">
                <div className={`rounded-xl p-2 ${colors.split(" ").slice(1, 2).join(" ")}`}>
                  <Icon className={`h-4 w-4 ${colors.split(" ")[0]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-display text-sm font-semibold text-foreground">{signal.title}</p>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${colors}`}>{signal.severity}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{signal.description}</p>
                  {signal.impactCents > 0 && (
                    <p className="text-xs font-semibold text-foreground mb-2">Impact: ${(signal.impactCents / 100).toLocaleString()}</p>
                  )}
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Mitigations</p>
                    {signal.mitigations.map((m, i) => (
                      <p key={i} className="text-xs text-muted-foreground">• {m}</p>
                    ))}
                  </div>
                </div>
              </div>
            </SitaCard>
          );
        })}
      </div>

      {/* Bill Collisions */}
      {radar.billCollisions.length > 0 && (
        <>
          <SitaSectionHeader title="Bill Collision Calendar" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {radar.billCollisions.map((c, i) => (
              <SitaCard key={i} hover className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-urgency-high" />
                  <p className="font-display text-sm font-semibold text-foreground">{new Date(c.date).toLocaleDateString("en", { month: "short", day: "numeric" })}</p>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{c.bills.length} bills, ${(c.totalCents / 100).toLocaleString()} total</p>
                {c.bills.map((b, j) => (
                  <p key={j} className="text-xs text-foreground">• {b}</p>
                ))}
              </SitaCard>
            ))}
          </div>
        </>
      )}

      {/* Squeeze Windows */}
      {radar.squeezeWindows.length > 0 && (
        <>
          <SitaSectionHeader title="Cash Squeeze Windows" />
          <div className="grid gap-3 sm:grid-cols-2">
            {radar.squeezeWindows.slice(0, 6).map((w, i) => (
              <SitaCard key={i} hover className="p-4 border-l-4 border-l-destructive/40">
                <p className="text-sm font-semibold text-foreground">{new Date(w.start).toLocaleDateString("en", { month: "short", day: "numeric" })}</p>
                <p className="text-xs text-destructive">Shortfall: ${(w.shortfallCents / 100).toLocaleString()}</p>
              </SitaCard>
            ))}
          </div>
        </>
      )}

      <LiveAdvisorCard
        advisor="money" intent="stress_radar_review"
        demoName="Stress Radar Advisor" demoRole="Financial Risk Intelligence" demoConfidence="High"
        demoRecommendation={`${radar.signals.length} stress signals detected. ${critCount > 0 ? `${critCount} critical issues require immediate attention.` : "No critical issues."} Focus on ${radar.signals[0]?.title || "maintaining stability"}.`}
        demoReasoning="10-dimension scan across cash, bills, debt, reserves, utilization, tax, subscriptions, float, and founder draw."
      />
    </motion.div>
  );
};

export default StressRadar;
