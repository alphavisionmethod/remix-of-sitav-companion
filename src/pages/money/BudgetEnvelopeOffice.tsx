import { toast } from "sonner";
// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Budget & Envelope Office
// ═══════════════════════════════════════════════════════════════

import { HeroCard, StatusCard, SummaryCard } from "@/components/sita/cards";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { DollarSign, Wallet, PiggyBank, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { createDefaultEnvelopes, computePaceStatus } from "@/lib/services/finance-os/envelope-budget.service";

const BudgetEnvelopeOffice = () => {
  const [monthlyIncome] = useState(850000);

  const budget = useMemo(() => {
    const b = createDefaultEnvelopes(monthlyIncome);
    const withSpending = {
      ...b,
      groups: b.groups.map(g => ({
        ...g,
        envelopes: g.envelopes.map(e => {
          const spent = Math.round(e.allocatedCents * (0.3 + Math.random() * 0.5));
          return { ...e, spentCents: spent, availableCents: e.allocatedCents - spent, isOverspent: spent > e.allocatedCents };
        }),
        totalSpentCents: 0,
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
      <PageTruthBanner />

      <HeroCard
        title="BUDGET & ENVELOPE OFFICE"
        metric={fmt(totalAvailable)}
        subtitle="Available after spending — give every dollar a job"
        accentFrom="hsl(152 55% 48%)"
        accentTo="hsl(200 55% 50%)"
        icon={<Wallet className="h-5 w-5 text-[hsl(152_55%_48%)]" />}
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatusCard label="Monthly Income" status="healthy" lastChecked={fmt(budget.totalIncomeCents)} icon={<DollarSign className="h-3.5 w-3.5" />} />
        <StatusCard label="Allocated" status="healthy" lastChecked={fmt(budget.totalAllocatedCents)} icon={<Wallet className="h-3.5 w-3.5" />} />
        <StatusCard label="Spent So Far" status={totalSpent > budget.totalAllocatedCents * 0.8 ? "degraded" : "healthy"} lastChecked={fmt(totalSpent)} />
        <StatusCard label="Unallocated" status={budget.unallocatedCents > 0 ? "degraded" : "healthy"} lastChecked={fmt(budget.unallocatedCents)} icon={<AlertTriangle className="h-3.5 w-3.5" />} />
      </div>

      {/* Pace Status */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${budget.paceStatus === "ahead" ? "bg-[hsl(152_55%_48%)]" : budget.paceStatus === "behind" ? "bg-[hsl(0_70%_55%)]" : "bg-primary"}`} />
            <p className="font-display text-sm font-semibold">Spending Pace: <span className="capitalize">{budget.paceStatus}</span></p>
          </div>
          <p className="text-xs text-muted-foreground">Day {new Date().getDate()} of 30</p>
        </div>
        <div className="h-2 bg-[hsl(0_0%_100%/0.06)] rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (totalSpent / budget.totalAllocatedCents) * 100)}%` }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{((totalSpent / budget.totalAllocatedCents) * 100).toFixed(0)}% spent</span>
          <span>{((new Date().getDate() / 30) * 100).toFixed(0)}% through month</span>
        </div>
      </div>

      {/* Overspent Warning */}
      {overspentEnvelopes.length > 0 && (
        <div className="rounded-xl border border-[hsl(0_70%_55%/0.2)] bg-[hsl(0_70%_55%/0.05)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-[hsl(0_70%_55%)]" />
            <h3 className="text-sm font-semibold text-foreground">Overspent Envelopes ({overspentEnvelopes.length})</h3>
          </div>
          {overspentEnvelopes.map(e => (
            <p key={e.id} className="text-xs"><span className="font-semibold">{e.name}</span>: overspent by <span className="text-[hsl(0_70%_55%)] font-bold">{fmt(e.spentCents - e.allocatedCents)}</span></p>
          ))}
        </div>
      )}

      {/* Envelope Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {budget.groups.map(g => (
          <div key={g.id} className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(0_0%_50%)]">{g.name}</h3>
            {g.envelopes.map(e => {
              const pct = e.allocatedCents > 0 ? Math.min(100, (e.spentCents / e.allocatedCents) * 100) : 0;
              return (
                <div key={e.id} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-3 micro-hover-lift">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-display text-sm font-semibold">{e.name}</p>
                    <div className="text-right">
                      <p className={`font-display text-sm font-bold ${e.isOverspent ? "text-[hsl(0_70%_55%)]" : "text-[hsl(152_55%_48%)]"}`}>
                        {e.isOverspent ? `-${fmt(e.spentCents - e.allocatedCents)}` : fmt(e.availableCents)}
                      </p>
                      <p className="text-xs text-muted-foreground">of {fmt(e.allocatedCents)}</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-[hsl(0_0%_100%/0.06)] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${e.isOverspent ? "bg-[hsl(0_70%_55%)]" : pct > 80 ? "bg-[hsl(38_85%_58%)]" : "bg-[hsl(152_55%_48%)]"}`}
                      style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>{fmt(e.spentCents)} spent</span>
                    <span>{pct.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <ModuleAdvisorInsight
        advisorName="Budget Advisor"
        domain="finance"
        insight={`Spending pace is ${budget.paceStatus}. ${overspentEnvelopes.length > 0 ? `${overspentEnvelopes.length} envelope(s) overspent — consider reallocating.` : "All envelopes on track."}`}
        confidence={85}
        actions={[{ label: "Reallocate", onClick: () => toast.info("Budget reallocation planned — coming in a future update") }]}
      />
    </motion.div>
  );
};

export default BudgetEnvelopeOffice;
