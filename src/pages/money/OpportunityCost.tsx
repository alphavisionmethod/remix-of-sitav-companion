// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Opportunity Cost Dashboard
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { ArrowRight, DollarSign, TrendingDown, Target, PiggyBank, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import type { OpportunityCostEntry } from "@/packages/finance-contracts/advanced-intelligence";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";

const demoEntries: OpportunityCostEntry[] = [
  { category: "Dining & Delivery", spentCents: 42000, preventedReserveGrowthCents: 42000, delayedDebtPayoffDays: 8, delayedGoalProgressPct: 2.1, alternativeUse: "Emergency fund +$420" },
  { category: "Entertainment", spentCents: 28000, preventedReserveGrowthCents: 28000, delayedDebtPayoffDays: 5, delayedGoalProgressPct: 1.4, alternativeUse: "Debt payoff — saves $18 interest" },
  { category: "Shopping", spentCents: 35000, preventedReserveGrowthCents: 35000, delayedDebtPayoffDays: 7, delayedGoalProgressPct: 1.8, alternativeUse: "Home down payment +$350" },
  { category: "Subscriptions (Waste)", spentCents: 8500, preventedReserveGrowthCents: 8500, delayedDebtPayoffDays: 2, delayedGoalProgressPct: 0.4, alternativeUse: "Tax reserve top-up" },
  { category: "Impulse Purchases", spentCents: 15000, preventedReserveGrowthCents: 15000, delayedDebtPayoffDays: 3, delayedGoalProgressPct: 0.8, alternativeUse: "Investment contribution +$150" },
  { category: "Convenience Fees", spentCents: 4500, preventedReserveGrowthCents: 4500, delayedDebtPayoffDays: 1, delayedGoalProgressPct: 0.2, alternativeUse: "Sinking fund boost" },
];

const totalSpent = demoEntries.reduce((s, e) => s + e.spentCents, 0);
const totalDelayDays = demoEntries.reduce((s, e) => s + e.delayedDebtPayoffDays, 0);
const totalGoalDelay = demoEntries.reduce((s, e) => s + e.delayedGoalProgressPct, 0);

const OpportunityCost = () => {
  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <DomainHeader domain="money" title="Opportunity Cost Dashboard" subtitle="See what your spending prevented — not just what it cost" />
<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Discretionary Spent" value={`$${(totalSpent / 100).toLocaleString()}`} icon={DollarSign} sub="This month" />
        <KPITile label="Reserve Growth Delayed" value={`$${(totalSpent / 100).toLocaleString()}`} icon={PiggyBank} sub="Could have been reserves" />
        <KPITile label="Debt Payoff Delayed" value={`${totalDelayDays} days`} icon={CreditCard} sub="Extra interest accruing" />
        <KPITile label="Goal Progress Traded" value={`${totalGoalDelay.toFixed(1)}%`} icon={Target} sub="Slower progress" />
      </div>

      {/* Cumulative Impact Bar */}
      <SitaCard hover={false} className="p-5">
        <SitaCardTitle sub="What your discretionary spending prevented this month">Cumulative Opportunity Cost</SitaCardTitle>
        <div className="mt-4">
          <ConfidenceBar value={Math.min(100, Math.round((totalSpent / 200000) * 100))} label="Spending vs. Financial Growth Potential" size="lg" />
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-secondary/30 p-3">
            <p className="text-[10px] uppercase text-muted-foreground font-medium">If saved</p>
            <p className="font-display text-lg font-bold text-trust-verified">${(totalSpent / 100).toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">More in reserves</p>
          </div>
          <div className="rounded-lg bg-secondary/30 p-3">
            <p className="text-[10px] uppercase text-muted-foreground font-medium">If to debt</p>
            <p className="font-display text-lg font-bold text-primary">{totalDelayDays} days</p>
            <p className="text-[10px] text-muted-foreground">Sooner payoff</p>
          </div>
          <div className="rounded-lg bg-secondary/30 p-3">
            <p className="text-[10px] uppercase text-muted-foreground font-medium">If to goals</p>
            <p className="font-display text-lg font-bold text-[hsl(var(--sita-gold))]">{totalGoalDelay.toFixed(1)}%</p>
            <p className="text-[10px] text-muted-foreground">More progress</p>
          </div>
        </div>
      </SitaCard>

      {/* Category Breakdown */}
      <SitaSectionHeader title="By Category" />
      <div className="space-y-2">
        {demoEntries.sort((a, b) => b.spentCents - a.spentCents).map((entry, i) => (
          <SitaCard key={i} hover className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{entry.category}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{entry.alternativeUse}</p>
                <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><PiggyBank className="h-3 w-3" /> -${(entry.preventedReserveGrowthCents / 100).toLocaleString()} reserves</span>
                  <span className="flex items-center gap-1"><CreditCard className="h-3 w-3" /> +{entry.delayedDebtPayoffDays}d debt</span>
                  <span className="flex items-center gap-1"><Target className="h-3 w-3" /> -{entry.delayedGoalProgressPct}% goals</span>
                </div>
              </div>
              <p className="font-display text-base font-bold text-foreground shrink-0">${(entry.spentCents / 100).toLocaleString()}</p>
            </div>
          </SitaCard>
        ))}
      </div>

      <ModuleAdvisorInsight
        advisorName="Opportunity Cost Advisor"
        domain="finance"
        insight={`$${(totalSpent / 100).toLocaleString()} in discretionary spending delayed debt payoff by ${totalDelayDays} days and goal progress by ${totalGoalDelay.toFixed(1)}%.`}
        confidence={88}
      />
    </motion.div>
  );
};

export default OpportunityCost;
