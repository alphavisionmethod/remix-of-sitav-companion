// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Household / Shared Money Office
// ═══════════════════════════════════════════════════════════════

import { HeroCard, StatusCard, SummaryCard } from "@/components/sita/cards";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { Users, DollarSign, PiggyBank, Target, Home, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import type { HouseholdFinanceSummary } from "@/packages/finance-contracts";
const HOUSEHOLD: HouseholdFinanceSummary = {
  householdId: "hh-1", memberCount: 2, totalIncomeCents: 1700000, totalExpensesCents: 1150000,
  sharedGoals: [
    { id: "g1", name: "Emergency Fund", targetCents: 3000000, currentCents: 1800000, contributors: [{ memberId: "m1", contributedCents: 1000000 }, { memberId: "m2", contributedCents: 800000 }], projectedCompletionDate: "2026-09-15" },
    { id: "g2", name: "Vacation Fund", targetCents: 500000, currentCents: 220000, contributors: [{ memberId: "m1", contributedCents: 120000 }, { memberId: "m2", contributedCents: 100000 }], projectedCompletionDate: "2026-07-01" },
    { id: "g3", name: "Home Down Payment", targetCents: 10000000, currentCents: 3500000, contributors: [{ memberId: "m1", contributedCents: 2000000 }, { memberId: "m2", contributedCents: 1500000 }], projectedCompletionDate: "2028-03-01" },
  ],
  memberBreakdown: [
    { memberId: "m1", name: "Alex", incomeCents: 950000, expensesCents: 620000, personalSavingsCents: 180000, sharedContributionCents: 150000 },
    { memberId: "m2", name: "Jordan", incomeCents: 750000, expensesCents: 530000, personalSavingsCents: 120000, sharedContributionCents: 100000 },
  ],
  sharedBudgetHealth: 82,
};

const HouseholdMoneyOffice = () => {
  const hh = HOUSEHOLD;
  const fmt = (c: number) => `$${(Math.abs(c) / 100).toLocaleString()}`;
  const surplus = hh.totalIncomeCents - hh.totalExpensesCents;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageTruthBanner />

      <HeroCard
        title="HOUSEHOLD MONEY OFFICE"
        metric={fmt(surplus)}
        subtitle={`Monthly surplus · ${((surplus / hh.totalIncomeCents) * 100).toFixed(0)}% savings rate`}
        accentFrom="hsl(265 55% 58%)"
        accentTo="hsl(152 55% 48%)"
        icon={<Home className="h-5 w-5 text-[hsl(265_55%_58%)]" />}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatusCard label="Household Income" status="healthy" lastChecked={fmt(hh.totalIncomeCents)} icon={<DollarSign className="h-3.5 w-3.5" />} />
        <StatusCard label="Shared Expenses" status="healthy" lastChecked={fmt(hh.totalExpensesCents)} icon={<Home className="h-3.5 w-3.5" />} />
        <StatusCard label="Monthly Surplus" status="healthy" lastChecked={fmt(surplus)} icon={<PiggyBank className="h-3.5 w-3.5" />} />
        <StatusCard label="Budget Health" status={hh.sharedBudgetHealth >= 80 ? "healthy" : "degraded"} lastChecked={`${hh.sharedBudgetHealth}%`} icon={<BarChart3 className="h-3.5 w-3.5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members */}
        <div className="space-y-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(0_0%_50%)]">Members</h3>
          {hh.memberBreakdown.map(m => (
            <div key={m.memberId} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-sm font-semibold">{m.name}</p>
                  <p className="text-xs text-muted-foreground">Income: {fmt(m.incomeCents)}/mo</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><p className="text-muted-foreground">Expenses</p><p className="font-semibold">{fmt(m.expensesCents)}</p></div>
                <div><p className="text-muted-foreground">Savings</p><p className="font-semibold text-[hsl(152_55%_48%)]">{fmt(m.personalSavingsCents)}</p></div>
                <div><p className="text-muted-foreground">Shared</p><p className="font-semibold text-primary">{fmt(m.sharedContributionCents)}</p></div>
                <div><p className="text-muted-foreground">Rate</p><p className="font-semibold">{((m.personalSavingsCents + m.sharedContributionCents) / m.incomeCents * 100).toFixed(0)}%</p></div>
              </div>
            </div>
          ))}
        </div>

        {/* Shared Goals */}
        <div className="space-y-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(0_0%_50%)]">Shared Goals</h3>
          {hh.sharedGoals.map(g => {
            const pct = g.targetCents > 0 ? (g.currentCents / g.targetCents) * 100 : 0;
            return (
              <div key={g.id} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <p className="font-display text-sm font-semibold">{g.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{pct.toFixed(0)}%</p>
                </div>
                <div className="h-2 bg-[hsl(0_0%_100%/0.06)] rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{fmt(g.currentCents)} of {fmt(g.targetCents)}</span>
                  <span>Est. {new Date(g.projectedCompletionDate).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Advisor */}
        <div className="space-y-4">
          <ModuleAdvisorInsight
            advisorName="Household Advisor"
            domain="finance"
            insight={`Household savings rate is ${((surplus / hh.totalIncomeCents) * 100).toFixed(0)}%. Emergency fund at ${((hh.sharedGoals[0]?.currentCents ?? 0) / (hh.sharedGoals[0]?.targetCents || 1) * 100).toFixed(0)}% — on track.`}
            confidence={88}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default HouseholdMoneyOffice;
