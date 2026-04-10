// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Household / Shared Money Office
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { Users, DollarSign, PiggyBank, Target, Heart, Home, Shield, BarChart3, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { HouseholdFinanceSummary, SharedGoal, MemberFinanceSummary } from "@/packages/finance-contracts";

const DEMO_HOUSEHOLD: HouseholdFinanceSummary = {
  householdId: "hh-1",
  memberCount: 2,
  totalIncomeCents: 1700000,
  totalExpensesCents: 1150000,
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
  const { isDemoMode } = useDataMode();
  const hh = DEMO_HOUSEHOLD;
  const fmt = (c: number) => `$${(Math.abs(c) / 100).toLocaleString()}`;
  const surplus = hh.totalIncomeCents - hh.totalExpensesCents;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <DomainHeader domain="finance" title="Household Money Office" subtitle="Shared finances, family goals, partner visibility" />
      <DemoModeBadge />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPITile label="Household Income" value={fmt(hh.totalIncomeCents)} icon={<DollarSign className="h-4 w-4" />} color="blue" />
        <KPITile label="Shared Expenses" value={fmt(hh.totalExpensesCents)} icon={<Home className="h-4 w-4" />} color="amber" />
        <KPITile label="Monthly Surplus" value={fmt(surplus)} icon={<PiggyBank className="h-4 w-4" />} color={surplus > 0 ? "emerald" : "red"} />
        <KPITile label="Budget Health" value={`${hh.sharedBudgetHealth}%`} icon={<Heart className="h-4 w-4" />} color={hh.sharedBudgetHealth >= 70 ? "emerald" : "amber"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Member Breakdown */}
        <div className="space-y-4">
          <SitaSectionHeader title="Members" />
          {hh.memberBreakdown.map(m => (
            <SitaCard key={m.memberId} hover className="p-4">
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
                <div><p className="text-muted-foreground">Personal Savings</p><p className="font-semibold text-trust-verified">{fmt(m.personalSavingsCents)}</p></div>
                <div><p className="text-muted-foreground">Shared Contribution</p><p className="font-semibold text-primary">{fmt(m.sharedContributionCents)}</p></div>
                <div><p className="text-muted-foreground">Savings Rate</p><p className="font-semibold">{((m.personalSavingsCents + m.sharedContributionCents) / m.incomeCents * 100).toFixed(0)}%</p></div>
              </div>
            </SitaCard>
          ))}
        </div>

        {/* Shared Goals */}
        <div className="space-y-4">
          <SitaSectionHeader title="Shared Goals" />
          {hh.sharedGoals.map(g => {
            const pct = g.targetCents > 0 ? (g.currentCents / g.targetCents) * 100 : 0;
            return (
              <SitaCard key={g.id} hover className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <p className="font-display text-sm font-semibold">{g.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{pct.toFixed(0)}%</p>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{fmt(g.currentCents)} of {fmt(g.targetCents)}</span>
                  <span>Est. {new Date(g.projectedCompletionDate).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  {g.contributors.map(c => {
                    const member = hh.memberBreakdown.find(m => m.memberId === c.memberId);
                    return (
                      <span key={c.memberId} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {member?.name}: {fmt(c.contributedCents)}
                      </span>
                    );
                  })}
                </div>
              </SitaCard>
            );
          })}
        </div>

        {/* Advisor */}
        <div className="space-y-4">
          <LiveAdvisorCard
            advisor="money"
            intent="household_finance"
            context={{ income: hh.totalIncomeCents / 100, expenses: hh.totalExpensesCents / 100, members: hh.memberCount, goals: hh.sharedGoals.length }}
            demoName="Household Advisor"
            demoRole="Shared Finance Intelligence"
            demoConfidence="High"
            demoRecommendation={`Household savings rate is ${((surplus / hh.totalIncomeCents) * 100).toFixed(0)}%. Emergency fund at ${((hh.sharedGoals[0]?.currentCents ?? 0) / (hh.sharedGoals[0]?.targetCents || 1) * 100).toFixed(0)}% — on track.`}
            demoReasoning="Combined income/expense analysis with goal pacing projections."
          />
          <ConfidenceBar score={0.88} label="Data completeness" />
          <TrustBadge level="verified" />
        </div>
      </div>
    </motion.div>
  );
};

export default HouseholdMoneyOffice;
