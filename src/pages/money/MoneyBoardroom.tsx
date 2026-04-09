import { SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton, SitaPageHeader } from "@/components/sita/SitaCard";
import { KPITile, RiskCard, OpportunityCard, ProofCard, SitaTabs } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { useState } from "react";
import {
  BarChart3, CheckCircle, AlertTriangle, Sparkles, DollarSign, Shield, TrendingUp, PiggyBank,
  CreditCard, Calendar, ArrowRight, Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useMoneyKPIs, useReservesSavings } from "@/hooks/use-domain-data";
import { useSubscriptions } from "@/hooks/use-sita-data";


interface MoneyBoardroomRow {
  cost?: number;
  current_amount?: unknown;
  id?: string;
  is_waste?: unknown;
  name?: string;
  target_amount?: unknown;
  usage_level?: unknown;
}

const MoneyBoardroom = () => {
  const [mode, setMode] = useState("weekly");
  const { data: kpis, isLoading } = useMoneyKPIs();
  const { data: reserves = [] } = useReservesSavings();
  const { data: subscriptions = [] } = useSubscriptions();

  const k = kpis || { totalBalance: 0, safeToSpend: 0, reserveHealth: 0, estWaste: 0, wasteCount: 0, billsDue7d: 0, monthlyBurn: 0 };
  const wasteSubscriptions = subscriptions.filter((s: MoneyBoardroomRow) => s.is_waste);

  if (isLoading) return <SectionSkeleton cards={4} columns={2} />;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <SitaPageHeader
        title="Finance Boardroom"
        subtitle="Executive financial review — cash, reserves, waste, and strategy"
        actions={<SitaButton variant="accent" size="sm"><Calendar className="h-3.5 w-3.5" /> Schedule Review</SitaButton>}
      />

      <SitaTabs
        tabs={[
          { key: "weekly", label: "Weekly Review" },
          { key: "reserves", label: "Reserve Review" },
          { key: "waste", label: "Waste Review" },
          { key: "monthly", label: "Monthly Planning" },
        ]}
        active={mode}
        onChange={setMode}
      />

      {/* Hero — DB-derived KPIs */}
      <SitaCard hover={false} className="gradient-sita-subtle p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="rounded-xl gradient-sita p-2.5"><BarChart3 className="h-5 w-5 text-primary-foreground" /></div>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Finance Review</h2>
            <p className="text-xs text-muted-foreground">Generated today · Based on all financial activity and projections</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total Balance</p><p className="mt-1 font-display text-2xl font-bold text-foreground">${k.totalBalance.toLocaleString()}</p></div>
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Safe to Spend</p><p className="mt-1 font-display text-2xl font-bold text-trust-verified">${k.safeToSpend.toLocaleString()}</p></div>
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Reserve Health</p><p className="mt-1 font-display text-2xl font-bold text-foreground">{k.reserveHealth}%</p></div>
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Monthly Waste</p><p className="mt-1 font-display text-2xl font-bold text-urgency-high">${k.estWaste}</p></div>
        </div>
      </SitaCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Reserve Health from DB */}
        <SitaCard hover={false}>
          <SitaCardTitle>Reserve Health Summary</SitaCardTitle>
          <div className="mt-4 space-y-4">
            {reserves.length > 0 ? reserves.map((r: MoneyBoardroomRow) => {
              const pct = r.target_amount > 0 ? Math.round((r.current_amount / r.target_amount) * 100) : 0;
              return (
                <div key={r.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground">{r.name}</span>
                    <span className="text-xs text-muted-foreground">${(r.current_amount || 0).toLocaleString()} / ${(r.target_amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full rounded-full ${pct >= 80 ? "bg-trust-verified" : pct >= 50 ? "bg-trust-review" : "bg-urgency-high"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            }) : <p className="text-sm text-muted-foreground">No reserves configured</p>}
          </div>
        </SitaCard>

        {/* Waste from DB */}
        <div className="space-y-4">
          <SitaSectionHeader title="Waste Reduction Opportunities" />
          {wasteSubscriptions.length > 0 ? wasteSubscriptions.map((sub: MoneyBoardroomRow) => (
            <OpportunityCard key={sub.id} title={`Cancel ${sub.name} — $${(Number(sub.cost) * 12).toFixed(0)}/yr savings`} description={`Usage: ${sub.usage_level || "Low"}. Cost: $${Number(sub.cost).toFixed(2)}/mo`} action="Review" />
          )) : <SitaCard hover={false} className="p-4"><p className="text-sm text-muted-foreground">No waste opportunities detected</p></SitaCard>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SitaCard hover={false}>
          <SitaCardTitle>Proof Summary</SitaCardTitle>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <KPITile label="Total Balance" value={`$${(k.totalBalance / 1000).toFixed(1)}K`} icon={DollarSign} sub="Across all accounts" className="text-sm" />
            <KPITile label="Savings Reserved" value={`$${(reserves.reduce((s: number, r: any) => s + (r.current_amount || 0), 0) / 1000).toFixed(1)}K`} icon={PiggyBank} sub="On track" className="text-sm" />
            <KPITile label="Bills Due" value={`$${k.billsDue7d.toLocaleString()}`} icon={Shield} sub="Next 7 days" className="text-sm" />
            <KPITile label="Monthly Burn" value={`$${k.monthlyBurn.toLocaleString()}`} icon={TrendingUp} sub="Projected" className="text-sm" />
          </div>
        </SitaCard>

        <SitaCard hover={false}>
          <SitaCardTitle sub="AI-generated financial action plan">Recommended Next Moves</SitaCardTitle>
          <div className="mt-4 space-y-2.5">
            {[
              k.billsDue7d > 0 && `Review $${k.billsDue7d.toLocaleString()} in upcoming bills`,
              k.wasteCount > 0 && `Cancel ${k.wasteCount} waste subscription${k.wasteCount > 1 ? "s" : ""} to save $${k.estWaste * 12}/yr`,
              k.reserveHealth < 80 && "Increase reserve contributions — below target",
              "Review cash timing for stress windows",
            ].filter(Boolean).map((r, i) => (
              <div key={i} className="flex items-start gap-2 rounded-xl bg-secondary/30 p-3">
                <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{r}</p>
              </div>
            ))}
          </div>
        </SitaCard>
      </div>

      <LiveAdvisorCard
        advisor="money"
        intent="financial_review"
        demoName="Finance Executive Advisor"
        demoRole="Strategic Intelligence"
        demoConfidence="High"
        demoRecommendation={`Total balance $${k.totalBalance.toLocaleString()} with $${k.safeToSpend.toLocaleString()} safe to spend. Reserve health at ${k.reserveHealth}%.`}
        demoReasoning="Based on weekly financial review, reserve health analysis, waste detection, and cash flow projections."
      />
    </motion.div>
  );
};

export default MoneyBoardroom;
