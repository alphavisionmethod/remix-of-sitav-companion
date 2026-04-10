// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Debt, Credit & Liability Office
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { CreditCard, TrendingDown, AlertTriangle, Shield, DollarSign, Target, BarChart3, ArrowRight, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { computeDebtProfile, simulateDebtPayoff } from "@/lib/services/finance-os/debt-analyzer.service";
import type { DebtAccount } from "@/packages/finance-contracts";

const DEMO_ACCOUNTS: DebtAccount[] = [
  { id: "cc1", name: "Visa Platinum", type: "credit-card", balanceCents: 485000, limitCents: 2000000, interestRate: 22.99, minimumPaymentCents: 14500, dueDate: "2026-04-28", utilizationPercent: 24.25, monthlyInterestCents: 9283, payoffMonths: 48, isAutoPay: true, institution: "Chase" },
  { id: "cc2", name: "Amex Gold", type: "credit-card", balanceCents: 128000, limitCents: 500000, interestRate: 18.99, minimumPaymentCents: 3840, dueDate: "2026-05-02", utilizationPercent: 25.6, monthlyInterestCents: 2025, payoffMonths: 42, isAutoPay: true, institution: "American Express" },
  { id: "sl1", name: "Student Loan", type: "student-loan", balanceCents: 2400000, limitCents: 2400000, interestRate: 5.5, minimumPaymentCents: 28000, dueDate: "2026-04-15", utilizationPercent: 100, monthlyInterestCents: 11000, payoffMonths: 120, isAutoPay: true, institution: "Navient" },
  { id: "al1", name: "Auto Loan", type: "auto-loan", balanceCents: 1800000, limitCents: 1800000, interestRate: 6.99, minimumPaymentCents: 42000, dueDate: "2026-04-20", utilizationPercent: 100, monthlyInterestCents: 10485, payoffMonths: 54, isAutoPay: false, institution: "Capital One" },
];

const DebtCreditOffice = () => {
  const { isDemoMode } = useDataMode();
  const [strategy, setStrategy] = useState<"avalanche" | "snowball">("avalanche");
  const [extraPayment, setExtraPayment] = useState(20000); // $200/mo extra

  const profile = useMemo(() => computeDebtProfile(DEMO_ACCOUNTS, 850000, extraPayment), [extraPayment]);
  const altPlan = useMemo(() => simulateDebtPayoff(DEMO_ACCOUNTS, strategy === "avalanche" ? "snowball" : "avalanche", extraPayment), [strategy, extraPayment]);

  const fmt = (cents: number) => `$${(Math.abs(cents) / 100).toLocaleString()}`;
  const pulse = profile.creditScorePulse;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <DomainHeader domain="money" title="Debt, Credit & Liability Office" subtitle="Payoff strategies, utilization monitoring, credit pulse" />
      <DemoModeBadge />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPITile label="Total Debt" value={fmt(profile.totalDebtCents)} icon={CreditCard} />
        <KPITile label="Monthly Interest Drag" value={fmt(profile.interestDragMonthlyCents)} icon={TrendingDown} />
        <KPITile label="Utilization" value={`${profile.utilizationPercent.toFixed(0)}%`} icon={BarChart3} />
        <KPITile label="DTI Ratio" value={`${profile.debtToIncomeRatio.toFixed(0)}%`} icon={Target} />
        <KPITile label="Credit Score" value={pulse.estimatedScore.toString()} icon={Shield}
          trend={pulse.trend === "improving" ? "up" : pulse.trend === "declining" ? "down" : undefined} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Debt Accounts */}
        <div className="lg:col-span-2 space-y-4">
          <SitaSectionHeader title="Debt Accounts" />
          {profile.accounts.map(a => (
            <SitaCard key={a.id} hover className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="font-display text-sm font-semibold">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.institution} · {a.type.replace("-", " ")}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm font-bold text-amber-500">{fmt(a.balanceCents)}</p>
                  <p className="text-xs text-muted-foreground">{a.interestRate}% APR</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Min Payment</p>
                  <p className="font-semibold">{fmt(a.minimumPaymentCents)}/mo</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Interest/mo</p>
                  <p className="font-semibold text-red-500">{fmt(a.monthlyInterestCents)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Utilization</p>
                  <p className="font-semibold">{a.utilizationPercent.toFixed(0)}%</p>
                </div>
              </div>
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${a.utilizationPercent > 50 ? "bg-red-500" : a.utilizationPercent > 30 ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.min(100, a.utilizationPercent)}%` }} />
              </div>
              <div className="flex items-center gap-2 mt-2">
                {a.isAutoPay && <span className="inline-flex items-center gap-1 text-xs text-trust-verified"><CheckCircle className="h-3 w-3" /> AutoPay</span>}
                <span className="text-xs text-muted-foreground">Due: {new Date(a.dueDate).toLocaleDateString()}</span>
              </div>
            </SitaCard>
          ))}

          {/* Payoff Strategy */}
          <SitaSectionHeader title="Payoff Strategy" />
          <SitaCard hover={false} className="p-4 space-y-4">
            <div className="flex gap-2">
              {(["avalanche", "snowball"] as const).map(s => (
                <SitaButton key={s} variant={strategy === s ? "accent" : "ghost"} size="sm" onClick={() => setStrategy(s)}>
                  {s === "avalanche" ? "🏔️ Avalanche" : "⛄ Snowball"}
                </SitaButton>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              {strategy === "avalanche" ? "Pays highest interest first — saves the most money" : "Pays smallest balance first — fastest psychological wins"}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Projected Payoff</p>
                <p className="font-display font-bold">{profile.payoffPlan.projectedMonths} months</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Interest Saved</p>
                <p className="font-display font-bold text-trust-verified">{fmt(profile.payoffPlan.totalInterestSavedCents)}</p>
              </div>
            </div>

            {/* Payoff milestones */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payoff Timeline</p>
              {profile.payoffPlan.milestones.slice(0, 4).map((m, i) => (
                <div key={m.accountId} className="flex items-center gap-2 text-xs">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{i + 1}</div>
                  <span className="font-semibold">{m.accountName}</span>
                  <span className="text-muted-foreground">— {new Date(m.payoffDate).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span>
                  <span className="ml-auto text-red-500">-{fmt(m.interestPaidCents)} interest</span>
                </div>
              ))}
            </div>
            <TrustBadge level="verified" />
          </SitaCard>
        </div>

        {/* Credit Score + Advisor */}
        <div className="space-y-4">
          <SitaSectionHeader title="Credit Score Pulse" />
          <SitaCard hover={false} className="p-4">
            <div className="text-center mb-4">
              <p className="font-display text-4xl font-bold">{pulse.estimatedScore}</p>
              <p className={`text-xs font-semibold ${pulse.trend === "improving" ? "text-trust-verified" : pulse.trend === "declining" ? "text-red-500" : "text-muted-foreground"}`}>
                {pulse.trend === "improving" ? "↑ Improving" : pulse.trend === "declining" ? "↓ Declining" : "→ Stable"}
              </p>
            </div>
            <div className="space-y-3">
              {pulse.factors.map(f => (
                <div key={f.name} className="flex items-center justify-between text-xs">
                  <span>{f.name}</span>
                  <span className={`font-semibold ${f.impact === "positive" ? "text-trust-verified" : f.impact === "negative" ? "text-red-500" : "text-muted-foreground"}`}>
                    {f.impact === "positive" ? "✓" : f.impact === "negative" ? "✗" : "—"} {f.description.split("—")[0]}
                  </span>
                </div>
              ))}
            </div>
            <ConfidenceBar value={Math.round(0.78 * 100)} label="Score confidence" className="mt-3" />
          </SitaCard>

          <LiveAdvisorCard
            advisor="money"
            intent="debt_strategy"
            context={{ total_debt: profile.totalDebtCents / 100, utilization: profile.utilizationPercent, dti: profile.debtToIncomeRatio }}
            demoName="Debt Advisor"
            demoRole="Debt & Credit Intelligence"
            demoConfidence="High"
            demoRecommendation={`Focus on ${profile.payoffPlan.milestones[0]?.accountName || "highest rate"} first. Current interest drag is ${fmt(profile.interestDragMonthlyCents)}/mo.`}
            demoReasoning="Avalanche strategy saves the most in interest. Utilization under 30% supports credit score growth."
          />

          <SitaCard hover={false} className="p-4 gradient-sita-subtle">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <SitaCardTitle>Interest Drag Alert</SitaCardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              You're paying <span className="font-bold text-red-500">{fmt(profile.interestDragMonthlyCents)}/month</span> in interest alone.
              That's <span className="font-bold">{fmt(profile.interestDragMonthlyCents * 12)}/year</span> going to lenders.
            </p>
          </SitaCard>
        </div>
      </div>
    </motion.div>
  );
};

export default DebtCreditOffice;
