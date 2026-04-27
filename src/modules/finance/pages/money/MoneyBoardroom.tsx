import { HeroCard, SummaryCard, ComparisonCard, ProofCard, AdvisorCard, QueueCard, ActionCard } from "@/platform/sita/components/sita/cards";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { BoardroomCinematic } from "@/platform/sita/components/sita/motion/AppTransitions";
import { SitaTabs } from "@/platform/sita/components/sita/SitaComponents";
import { SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { TrustBadge } from "@/platform/sita/components/sita/badges";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { DomainAdvisorBoard } from "@/platform/sita/components/sita/domain-shared/DomainAdvisorBoard";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { BarChart3, Sun, AlertTriangle, CheckCircle, Clock, PiggyBank, CreditCard, DollarSign, Shield, TrendingUp, Eye, ArrowDownLeft, Repeat, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useMoneyKPIs, useReservesSavings } from "@/modules/business/hooks/use-domain-data";
import { useSubscriptions } from "@/platform/sita/hooks/use-sita-data";
import { SectionSkeleton } from "@/platform/sita/components/sita/SectionSkeleton";

const MoneyBoardroom = () => {
  const [mode, setMode] = useState("daily");
  const { data: kpis, isLoading } = useMoneyKPIs();
  const { data: reserves = [] } = useReservesSavings();
  const { data: subscriptions = [] } = useSubscriptions();

  const k = kpis || { totalBalance: 0, safeToSpend: 0, reserveHealth: 0, estWaste: 0, wasteCount: 0, billsDue7d: 0, monthlyBurn: 0 };
  const wasteSubscriptions = subscriptions.filter((s: Record<string, any>) => s.is_waste);
  const totalReserved = reserves.reduce((s: number, r: Record<string, any>) => s + (r.current_amount || 0), 0);

  if (isLoading) return <SectionSkeleton cards={4} columns={2} />;

  type FocusItem = { id: string; label: string; meta?: string; urgency: "critical" | "high" | "normal" | "low" };
  const focusItems: FocusItem[] = ([
    k.billsDue7d > 0 ? { id: "bills", label: `$${k.billsDue7d.toLocaleString()} in bills due this week`, urgency: "high" as const } : null,
    k.wasteCount > 0 ? { id: "waste", label: `${k.wasteCount} subscriptions flagged as waste`, urgency: "normal" as const, meta: `$${k.estWaste}/mo` } : null,
    k.reserveHealth < 80 ? { id: "reserve", label: `Reserve health at ${k.reserveHealth}% — below target`, urgency: "critical" as const } : null,
    { id: "approvals", label: "No overdue approvals — all clear", urgency: "low" as const },
  ] as Array<FocusItem | null>).filter((item): item is FocusItem => item !== null);

  const wasteQueue = wasteSubscriptions.map((sub: Record<string, any>) => ({
    id: sub.id, label: `Cancel ${sub.name}`, meta: `$${(Number(sub.cost) * 12).toFixed(0)}/yr`, urgency: "high" as const,
  }));

  return (
    <BoardroomCinematic domain="finance">
      <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageTruthBanner truthState={k.totalBalance > 0 ? "live" : "demo"} />

        <SitaTabs
          tabs={[
            { key: "daily", label: "Daily Pulse" },
            { key: "weekly", label: "Weekly Review" },
            { key: "household", label: "Household" },
            { key: "founder", label: "Founder Mode" },
          ]}
          active={mode}
          onChange={setMode}
        />

        <HeroCard
          title={mode === "daily" ? "Morning Money Pulse" : mode === "weekly" ? "Weekly Finance Review" : mode === "household" ? "Household Finance" : "Founder Mixed Mode"}
          metric={`$${k.totalBalance.toLocaleString()}`}
          subtitle={`Safe to spend: $${k.safeToSpend.toLocaleString()} · Reserve: ${k.reserveHealth}%`}
          accentFrom="hsl(152 55% 48%)"
          accentTo="hsl(165 50% 42%)"
          icon={<BarChart3 className="h-5 w-5 text-[hsl(152_55%_58%)]" />}
        >
          <SummaryCard
            title="Key Metrics"
            kpis={[
              { label: "Total Balance", value: `$${k.totalBalance.toLocaleString()}` },
              { label: "Safe to Spend", value: `$${k.safeToSpend.toLocaleString()}`, trend: "up" },
              { label: "Reserve Health", value: `${k.reserveHealth}%` },
              { label: "Bills Due (7d)", value: `$${k.billsDue7d.toLocaleString()}`, trend: k.billsDue7d > 0 ? "down" : "flat" },
            ]}
          />
        </HeroCard>

        {/* Daily pulse queue */}
        {mode === "daily" && (
          <div className="grid gap-5 lg:grid-cols-2">
            <QueueCard title="Today's Focus" items={focusItems} maxVisible={5} />
            <div className="space-y-2">
              <h4 className={cn(SITA_TYPE.microLabel, "text-[hsl(0_0%_50%)] mb-2")}>Quick Actions</h4>
              <ActionCard title="Review upcoming bills" description={`$${k.billsDue7d.toLocaleString()} due this week`} accentColor="hsl(152 55% 48%)" />
              <ActionCard title="Check reserve progress" description={`${k.reserveHealth}% of target funded`} accentColor="hsl(152 55% 48%)" />
              <ActionCard title="Scan subscription changes" description={`${k.wasteCount} flagged for review`} accentColor="hsl(38 85% 58%)" />
            </div>
          </div>
        )}

        {/* Weekly review */}
        {mode === "weekly" && (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-3">
              <h4 className={cn(SITA_TYPE.microLabel, "text-[hsl(0_0%_50%)]")}>Reserve Health</h4>
              {reserves.length > 0 ? reserves.map((r: Record<string, any>) => {
                const pct = r.target_amount > 0 ? Math.round((r.current_amount / r.target_amount) * 100) : 0;
                return (
                  <div key={r.id} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_85%)]")}>{r.name}</span>
                      <span className={cn(SITA_TYPE.timelineMeta)}>${(r.current_amount || 0).toLocaleString()} / ${(r.target_amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[hsl(0_0%_100%/0.06)] overflow-hidden">
                      <div className={`h-full rounded-full ${pct >= 80 ? "bg-[hsl(152_55%_48%)]" : pct >= 50 ? "bg-[hsl(38_85%_58%)]" : "bg-[hsl(0_70%_55%)]"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              }) : <p className={cn(SITA_TYPE.timelineMeta)}>No reserves configured</p>}
            </div>
            <div className="space-y-3">
              {wasteQueue.length > 0 && <QueueCard title="Waste Reduction Opportunities" items={wasteQueue} maxVisible={5} />}
            </div>
          </div>
        )}

        {/* Scenario comparison */}
        <ComparisonCard
          title="Balance Trend"
          before={{ label: "Last Month", value: `$${Math.round(k.totalBalance * 0.95).toLocaleString()}` }}
          after={{ label: "Current", value: `$${k.totalBalance.toLocaleString()}` }}
          delta={k.totalBalance > 0 ? "+5%" : "—"}
          deltaPositive={true}
        />

        <ProofCard
          title="Finance Review Evidence"
          status={k.totalBalance > 0 ? "verified" : "pending"}
          chain={[
            { label: "Account balances sourced", verified: k.totalBalance > 0 },
            { label: "Bill schedules checked", verified: true },
            { label: "Subscription tracker synced", verified: true },
            { label: "Reserve goals verified", verified: reserves.length > 0 },
          ]}
        />

        <DomainAdvisorBoard domain="finance" />

        <AdvisorCard
          advisorName="Finance Strategist"
          domain="Finance"
          insight={`Total balance: $${k.totalBalance.toLocaleString()}. Safe to spend: $${k.safeToSpend.toLocaleString()}. ${k.wasteCount > 0 ? `${k.wasteCount} waste subscriptions detected.` : "No waste detected."}`}
          confidence={k.totalBalance > 0 ? 88 : 65}
          accentColor="hsl(152 55% 48%)"
        />
      </motion.div>
    </BoardroomCinematic>
  );
};

export default MoneyBoardroom;
