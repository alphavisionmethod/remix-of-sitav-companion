// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance Boardroom (Deep Financial Review)
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile, RiskCard, SitaTabs } from "@/components/sita/SitaComponents";
import { SurfaceTrustStrip } from "@/components/sita/SurfaceTrustStrip";
import { DomainAdvisorCard } from "@/components/advisors/DomainAdvisorCard";
import { ListStagger, ListStaggerItem } from "@/components/sita/motion/AppTransitions";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, DollarSign, PiggyBank, Shield, TrendingUp, Clock,
  AlertTriangle, CheckCircle, CreditCard, ArrowRight, Sparkles, Target
} from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useMoneyKPIs, useReservesSavings } from "@/hooks/use-domain-data";
import { useSubscriptions } from "@/hooks/use-sita-data";

const FinanceBoardroom = () => {
  const { isDemoMode } = useDataMode();
  const [mode, setMode] = useState("weekly");
  const { data: kpis, isLoading } = useMoneyKPIs();
  const { data: reserves = [] } = useReservesSavings();
  const { data: subscriptions = [] } = useSubscriptions();

  const k = kpis || { totalBalance: 0, safeToSpend: 0, reserveHealth: 0, estWaste: 0, wasteCount: 0, billsDue7d: 0, monthlyBurn: 0 };
  const totalReserved = reserves.reduce((s: number, r: Record<string, any>) => s + (r.current_amount || 0), 0);
  const wasteCount = subscriptions.filter((s: Record<string, any>) => s.is_waste).length;

  if (isLoading) return <SectionSkeleton cards={4} columns={2} />;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />

      <SitaTabs
        tabs={[
          { key: "weekly", label: "Weekly Review" },
          { key: "obligations", label: "Obligations" },
          { key: "reserves", label: "Reserves" },
          { key: "subscriptions", label: "Subscriptions" },
        ]}
        active={mode}
        onChange={setMode}
      />

      {/* Hero KPIs */}
      <SitaCard hover={false} className="gradient-sita-subtle p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-2.5"><BarChart3 className="h-5 w-5 text-white" /></div>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Financial Review — {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}</h2>
            <p className="text-xs text-muted-foreground">Calm, confidence-oriented overview</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total Balance</p><p className="mt-1 font-display text-2xl font-bold text-foreground">${k.totalBalance.toLocaleString()}</p></div>
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Safe to Spend</p><p className="mt-1 font-display text-2xl font-bold text-trust-verified">${k.safeToSpend.toLocaleString()}</p></div>
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Reserve Health</p><p className="mt-1 font-display text-2xl font-bold text-foreground">{k.reserveHealth}%</p></div>
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Bills Due (7d)</p><p className="mt-1 font-display text-2xl font-bold text-urgency-high">${k.billsDue7d.toLocaleString()}</p></div>
        </div>
      </SitaCard>

      <SurfaceTrustStrip config={{
        evidenceGrade: k.totalBalance > 0 ? "B" : "C",
        dataSources: ["Account balances", "Bill schedules", "Subscription tracker", "Reserve goals"],
        lastRefreshed: new Date(),
        assumptions: [
          { statement: "Safe-to-spend excludes reserved funds and bills", impact: "high" },
          { statement: "Reserve health = current / target across all goals", impact: "medium" },
        ],
        caveats: k.totalBalance === 0 ? ["No financial data — figures may be estimates"] : undefined,
      }} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Obligations Pressure */}
        <SitaCard hover={false}>
          <SitaCardTitle sub="What's due and what needs attention"><Clock className="h-4 w-4 inline mr-2" />Obligations Pressure</SitaCardTitle>
          <ListStagger className="mt-4 space-y-2">
            {[
              k.billsDue7d > 0 && { text: `$${k.billsDue7d.toLocaleString()} in bills due within 7 days`, level: "high" },
              wasteCount > 0 && { text: `${wasteCount} subscription${wasteCount > 1 ? "s" : ""} flagged as waste ($${k.estWaste}/mo)`, level: "medium" },
              k.reserveHealth < 80 && { text: `Reserve health at ${k.reserveHealth}% — below target`, level: "high" },
              { text: "No overdue approvals", level: "clear" },
            ].filter(Boolean).map((item: any, i) => (
              <ListStaggerItem key={i}>
                <div className={`flex items-start gap-2 rounded-xl p-3 ${item.level === "high" ? "bg-urgency-high/10" : item.level === "clear" ? "bg-trust-verified/10" : "bg-secondary/30"}`}>
                  {item.level === "high" ? <AlertTriangle className="h-4 w-4 text-urgency-high shrink-0 mt-0.5" /> :
                   item.level === "clear" ? <CheckCircle className="h-4 w-4 text-trust-verified shrink-0 mt-0.5" /> :
                   <Clock className="h-4 w-4 text-trust-review shrink-0 mt-0.5" />}
                  <p className="text-sm text-foreground">{item.text}</p>
                </div>
              </ListStaggerItem>
            ))}
          </ListStagger>
        </SitaCard>

        {/* Reserve Confidence */}
        <SitaCard hover={false}>
          <SitaCardTitle sub="Savings and buffer health"><PiggyBank className="h-4 w-4 inline mr-2" />Reserve Confidence</SitaCardTitle>
          <div className="mt-4 space-y-4">
            {reserves.length > 0 ? reserves.map((r: Record<string, any>) => {
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
            }) : <p className="text-sm text-muted-foreground">No reserves configured — set savings goals to track progress</p>}
          </div>
        </SitaCard>

        {/* Next Moves */}
        <SitaCard hover={false}>
          <SitaCardTitle sub="AI-prepared recommendations"><Sparkles className="h-4 w-4 inline mr-2" />Next Financial Moves</SitaCardTitle>
          <div className="mt-4 space-y-2">
            {[
              k.billsDue7d > 0 && `Review $${k.billsDue7d.toLocaleString()} in upcoming bills`,
              wasteCount > 0 && `Cancel ${wasteCount} waste subscription${wasteCount > 1 ? "s" : ""} to save $${k.estWaste * 12}/yr`,
              k.reserveHealth < 80 && "Increase reserve contributions",
              "Review cash timing for stress windows",
              "Reconcile any flagged transactions",
            ].filter(Boolean).map((r, i) => (
              <div key={i} className="flex items-start gap-2 rounded-xl bg-accent/5 p-2.5">
                <Target className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                <p className="text-xs text-foreground">{r}</p>
              </div>
            ))}
          </div>
        </SitaCard>

        {/* Proof Summary */}
        <SitaCard hover={false}>
          <SitaCardTitle>Proof Summary</SitaCardTitle>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <KPITile label="Total Balance" value={`$${(k.totalBalance / 1000).toFixed(1)}K`} icon={DollarSign} sub="All accounts" className="text-sm" />
            <KPITile label="Saved" value={`$${(totalReserved / 1000).toFixed(1)}K`} icon={PiggyBank} sub="Reserved" className="text-sm" />
            <KPITile label="Bills Due" value={`$${k.billsDue7d.toLocaleString()}`} icon={Shield} sub="Next 7 days" className="text-sm" />
            <KPITile label="Monthly Burn" value={`$${k.monthlyBurn.toLocaleString()}`} icon={TrendingUp} sub="Projected" className="text-sm" />
          </div>
        </SitaCard>
      </div>

      {/* Finance Advisor */}
      <DomainAdvisorCard
        domain="finance"
        insights={[
          { id: "spend", text: `Safe to spend: $${k.safeToSpend.toLocaleString()}`, confidence: 88 },
          { id: "reserve", text: `Reserve health at ${k.reserveHealth}% ${k.reserveHealth < 80 ? "— below target" : ""}`, confidence: k.reserveHealth >= 80 ? 91 : 68, action: k.reserveHealth < 80 ? "Review" : undefined },
          { id: "waste", text: wasteCount > 0 ? `${wasteCount} waste subscription(s) detected ($${k.estWaste}/mo)` : "No waste detected", confidence: 82, action: wasteCount > 0 ? "Clean Up" : undefined },
        ]}
      />
    </motion.div>
  );
};

export default FinanceBoardroom;
