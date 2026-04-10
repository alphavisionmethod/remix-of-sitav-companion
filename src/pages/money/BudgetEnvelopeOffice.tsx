// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Budget & Envelope Office (YNAB-style)
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { DollarSign, Wallet, PiggyBank, AlertTriangle, CheckCircle, TrendingUp, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { createDefaultEnvelopes, computePaceStatus } from "@/lib/services/finance-os/envelope-budget.service";
import type { EnvelopeBudget } from "@/packages/finance-contracts";

const BudgetEnvelopeOffice = () => {
  const { isDemoMode } = useDataMode();
  const [monthlyIncome] = useState(850000); // $8,500

  const budget = useMemo(() => {
    const b = createDefaultEnvelopes(monthlyIncome);
    // Simulate some spending for demo
    const withSpending = {
      ...b,
      groups: b.groups.map(g => ({
        ...g,
        envelopes: g.envelopes.map(e => {
          const spent = Math.round(e.allocatedCents * (0.3 + Math.random() * 0.5));
          return { ...e, spentCents: spent, availableCents: e.allocatedCents - spent, isOverspent: spent > e.allocatedCents };
        }),
        totalSpentCents: 0, // recalculated below
      })),
    };
    withSpending.groups = withSpending.groups.map(g => ({
      ...g,
      totalSpentCents: g.envelopes.reduce((s, e) => s + e.spentCents, 0),
    }));
    const pace = computePaceStatus(withSpending, new Date().getDate(), 30);
    return { ...withSpending, paceStatus: pace };
  }, [monthlyIncome]);

  const totalSpent = budget.groups.reduce((s, g) => s + g.totalSpentCents, 0);
  const totalAvailable = budget.totalAllocatedCents - totalSpent;
  const fmt = (c: number) => `$${(Math.abs(c) / 100).toLocaleString()}`;
  const overspentEnvelopes = budget.groups.flatMap(g => g.envelopes).filter(e => e.isOverspent);

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <DomainHeader domain="money" title="Budget & Envelope Office" subtitle="Give every dollar a job — YNAB-style envelope budgeting" />
      <DemoModeBadge />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPITile label="Monthly Income" value={fmt(budget.totalIncomeCents)} icon={DollarSign} />
        <KPITile label="Allocated" value={fmt(budget.totalAllocatedCents)} icon={Wallet} />
        <KPITile label="Spent So Far" value={fmt(totalSpent)} icon={TrendingUp} />
        <KPITile label="Available" value={fmt(totalAvailable)} icon={PiggyBank}
        <KPITile label="Unallocated" value={fmt(budget.unallocatedCents)} icon={AlertTriangle}
      </div>

      {/* Pace Status */}
      <SitaCard hover={false} className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${budget.paceStatus === "ahead" ? "bg-emerald-500" : budget.paceStatus === "behind" ? "bg-red-500" : "bg-primary"}`} />
            <p className="font-display text-sm font-semibold">
              Spending Pace: <span className="capitalize">{budget.paceStatus}</span>
            </p>
          </div>
          <p className="text-xs text-muted-foreground">Day {new Date().getDate()} of 30</p>
        </div>
        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (totalSpent / budget.totalAllocatedCents) * 100)}%` }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{((totalSpent / budget.totalAllocatedCents) * 100).toFixed(0)}% spent</span>
          <span>{((new Date().getDate() / 30) * 100).toFixed(0)}% through month</span>
        </div>
      </SitaCard>

      {/* Overspent Warning */}
      {overspentEnvelopes.length > 0 && (
        <SitaCard hover={false} className="p-4 border-red-500/30 bg-red-500/5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <SitaCardTitle>Overspent Envelopes ({overspentEnvelopes.length})</SitaCardTitle>
          </div>
          <div className="space-y-1">
            {overspentEnvelopes.map(e => (
              <p key={e.id} className="text-xs"><span className="font-semibold">{e.name}</span>: overspent by <span className="text-red-500 font-bold">{fmt(e.spentCents - e.allocatedCents)}</span></p>
            ))}
          </div>
        </SitaCard>
      )}

      {/* Envelope Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {budget.groups.map(g => (
          <div key={g.id} className="space-y-3">
            <SitaSectionHeader title={g.name} />
            {g.envelopes.map(e => {
              const pct = e.allocatedCents > 0 ? Math.min(100, (e.spentCents / e.allocatedCents) * 100) : 0;
              return (
                <SitaCard key={e.id} hover className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-display text-sm font-semibold">{e.name}</p>
                    <div className="text-right">
                      <p className={`font-display text-sm font-bold ${e.isOverspent ? "text-red-500" : "text-trust-verified"}`}>
                        {e.isOverspent ? `-${fmt(e.spentCents - e.allocatedCents)}` : fmt(e.availableCents)}
                      </p>
                      <p className="text-xs text-muted-foreground">of {fmt(e.allocatedCents)}</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${e.isOverspent ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>{fmt(e.spentCents)} spent</span>
                    <span>{pct.toFixed(0)}%</span>
                  </div>
                </SitaCard>
              );
            })}
          </div>
        ))}
      </div>

      {/* Advisor */}
      <LiveAdvisorCard
        advisor="money"
        intent="budget_health"
        context={{ allocated: budget.totalAllocatedCents / 100, spent: totalSpent / 100, pace: budget.paceStatus }}
        demoName="Budget Advisor"
        demoRole="Envelope & Category Intelligence"
        demoConfidence="High"
        demoRecommendation={`Spending pace is ${budget.paceStatus}. ${overspentEnvelopes.length > 0 ? `${overspentEnvelopes.length} envelope(s) overspent — consider reallocating.` : "All envelopes on track."}`}
        demoReasoning="Based on day-of-month progress vs. envelope utilization rates."
      />
      <TrustBadge level="verified" />
    </motion.div>
  );
};

export default BudgetEnvelopeOffice;
