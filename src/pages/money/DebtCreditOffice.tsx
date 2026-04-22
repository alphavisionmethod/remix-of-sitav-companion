// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Debt, Credit & Liability Office
// ═══════════════════════════════════════════════════════════════

import { HeroCard, StatusCard, SummaryCard } from "@/components/sita/cards";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { CreditCard, TrendingDown, AlertTriangle, Shield, DollarSign, Target, BarChart3, CheckCircle } from "lucide-react";
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
  const [strategy, setStrategy] = useState<"avalanche" | "snowball">("avalanche");
  const [extraPayment] = useState(20000);

  const profile = useMemo(() => computeDebtProfile(DEMO_ACCOUNTS, 850000, extraPayment), [extraPayment]);
  const fmt = (cents: number) => `$${(Math.abs(cents) / 100).toLocaleString()}`;
  const pulse = profile.creditScorePulse;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageTruthBanner />

      <HeroCard
        title="DEBT, CREDIT & LIABILITY OFFICE"
        metric={fmt(profile.totalDebtCents)}
        subtitle={`${profile.accounts.length} accounts · ${fmt(profile.interestDragMonthlyCents)}/mo interest drag`}
        accentFrom="hsl(38 85% 58%)"
        accentTo="hsl(0 70% 55%)"
        icon={<CreditCard className="h-5 w-5 text-[hsl(38_85%_58%)]" />}
      />

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatusCard label="Total Debt" status="degraded" lastChecked={fmt(profile.totalDebtCents)} icon={<CreditCard className="h-3.5 w-3.5" />} />
        <StatusCard label="Interest Drag" status="down" lastChecked={`${fmt(profile.interestDragMonthlyCents)}/mo`} icon={<TrendingDown className="h-3.5 w-3.5" />} />
        <StatusCard label="Utilization" status={profile.utilizationPercent > 30 ? "degraded" : "healthy"} lastChecked={`${profile.utilizationPercent.toFixed(0)}%`} icon={<BarChart3 className="h-3.5 w-3.5" />} />
        <StatusCard label="DTI Ratio" status={profile.debtToIncomeRatio > 40 ? "degraded" : "healthy"} lastChecked={`${profile.debtToIncomeRatio.toFixed(0)}%`} icon={<Target className="h-3.5 w-3.5" />} />
        <StatusCard label="Credit Score" status={pulse.trend === "improving" ? "healthy" : pulse.trend === "declining" ? "down" : "degraded"} lastChecked={String(pulse.estimatedScore)} icon={<Shield className="h-3.5 w-3.5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {profile.accounts.map(a => (
            <div key={a.id} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[hsl(38_85%_58%)]" />
                  <div>
                    <p className="font-display text-sm font-semibold">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.institution} · {a.type.replace("-", " ")}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm font-bold text-[hsl(38_85%_58%)]">{fmt(a.balanceCents)}</p>
                  <p className="text-xs text-muted-foreground">{a.interestRate}% APR</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div><p className="text-muted-foreground">Min Payment</p><p className="font-semibold">{fmt(a.minimumPaymentCents)}/mo</p></div>
                <div><p className="text-muted-foreground">Interest/mo</p><p className="font-semibold text-[hsl(0_70%_55%)]">{fmt(a.monthlyInterestCents)}</p></div>
                <div><p className="text-muted-foreground">Utilization</p><p className="font-semibold">{a.utilizationPercent.toFixed(0)}%</p></div>
              </div>
              <div className="mt-2 h-1.5 bg-[hsl(0_0%_100%/0.06)] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${a.utilizationPercent > 50 ? "bg-[hsl(0_70%_55%)]" : a.utilizationPercent > 30 ? "bg-[hsl(38_85%_58%)]" : "bg-[hsl(152_55%_48%)]"}`}
                  style={{ width: `${Math.min(100, a.utilizationPercent)}%` }} />
              </div>
              {a.isAutoPay && (
                <span className="inline-flex items-center gap-1 text-xs text-[hsl(152_55%_48%)] mt-2"><CheckCircle className="h-3 w-3" /> AutoPay</span>
              )}
            </div>
          ))}

          {/* Strategy */}
          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 space-y-3">
            <div className="flex gap-2">
              {(["avalanche", "snowball"] as const).map(s => (
                <button key={s} onClick={() => setStrategy(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium micro-press ${strategy === s ? "bg-primary text-primary-foreground" : "bg-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_70%)]"}`}>
                  {s === "avalanche" ? "🏔️ Avalanche" : "⛄ Snowball"}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted-foreground text-xs">Projected Payoff</p><p className="font-display font-bold">{profile.payoffPlan.projectedMonths} months</p></div>
              <div><p className="text-muted-foreground text-xs">Interest Saved</p><p className="font-display font-bold text-[hsl(152_55%_48%)]">{fmt(profile.payoffPlan.totalInterestSavedCents)}</p></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 text-center">
            <p className="font-display text-3xl font-bold">{pulse.estimatedScore}</p>
            <p className={`text-xs font-semibold ${pulse.trend === "improving" ? "text-[hsl(152_55%_48%)]" : pulse.trend === "declining" ? "text-[hsl(0_70%_55%)]" : "text-muted-foreground"}`}>
              {pulse.trend === "improving" ? "↑ Improving" : pulse.trend === "declining" ? "↓ Declining" : "→ Stable"}
            </p>
          </div>

          <ModuleAdvisorInsight
            advisorName="Debt Advisor"
            domain="finance"
            insight={`Focus on ${profile.payoffPlan.milestones[0]?.accountName || "highest rate"} first. Current interest drag is ${fmt(profile.interestDragMonthlyCents)}/mo.`}
            confidence={88}
            actions={[{ label: "View Plan", onClick: () => {} }]}
          />

          <div className="rounded-xl border border-[hsl(38_85%_58%/0.2)] bg-[hsl(38_85%_58%/0.05)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-[hsl(38_85%_58%)]" />
              <h3 className="text-sm font-semibold">Interest Drag Alert</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              You're paying <span className="font-bold text-[hsl(0_70%_55%)]">{fmt(profile.interestDragMonthlyCents)}/month</span> in interest alone.
              That's <span className="font-bold">{fmt(profile.interestDragMonthlyCents * 12)}/year</span> going to lenders.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DebtCreditOffice;
