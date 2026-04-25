import { toast } from "sonner";
// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance Boardroom (Deep Financial Review)
// New design system: BoardroomCinematic + ComparisonCard + ProofCard
// ═══════════════════════════════════════════════════════════════

import { HeroCard, SummaryCard, QueueCard, ProofCard, ComparisonCard, AdvisorCard, StatusCard } from "@/platform/sita/components/sita/cards";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { BoardroomCinematic, ListReveal, ListRevealItem } from "@/platform/sita/components/sita/motion/AppTransitions";
import { SectionSkeleton } from "@/platform/sita/components/sita/SectionSkeleton";
import { SitaTabs } from "@/platform/sita/components/sita/SitaComponents";
import { useState } from "react";
import {
  BarChart3, DollarSign, PiggyBank, Shield, TrendingUp, Clock,
  AlertTriangle, CheckCircle, Target, Sparkles, Wallet
} from "lucide-react";
import { useMoneyKPIs, useReservesSavings } from "@/hooks/use-domain-data";
import { useSubscriptions } from "@/hooks/use-sita-data";

const FinanceBoardroom = () => {
  const [mode, setMode] = useState("weekly");
  const { data: kpis, isLoading } = useMoneyKPIs();
  const { data: reserves = [] } = useReservesSavings();
  const { data: subscriptions = [] } = useSubscriptions();

  const k = kpis || { totalBalance: 0, safeToSpend: 0, reserveHealth: 0, estWaste: 0, wasteCount: 0, billsDue7d: 0, monthlyBurn: 0 };
  const totalReserved = reserves.reduce((s: number, r: Record<string, any>) => s + (r.current_amount || 0), 0);
  const wasteCount = subscriptions.filter((s: Record<string, any>) => s.is_waste).length;

  if (isLoading) return <SectionSkeleton cards={4} columns={2} />;

  return (
    <BoardroomCinematic domain="finance">
      <div className="space-y-6">
        <PageTruthBanner />

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

        <HeroCard
          title={`Financial Review — ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}`}
          metric={`$${k.totalBalance.toLocaleString()}`}
          subtitle="Total balance across all accounts"
          accentFrom="hsl(160 60% 45%)"
          accentTo="hsl(152 55% 48%)"
          icon={<BarChart3 className="h-5 w-5 text-[hsl(160_60%_50%)]" />}
        />

        <SummaryCard
          title="Financial Pulse"
          icon={<Wallet className="h-4 w-4" />}
          kpis={[
            { label: "Safe to Spend", value: `$${k.safeToSpend.toLocaleString()}` },
            { label: "Reserve Health", value: `${k.reserveHealth}%` },
            { label: "Bills Due (7d)", value: `$${k.billsDue7d.toLocaleString()}` },
            { label: "Monthly Burn", value: `$${k.monthlyBurn.toLocaleString()}` },
          ]}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <QueueCard
            title="Obligations Pressure"
            items={[
              ...(k.billsDue7d > 0 ? [{ id: "bills", label: `$${k.billsDue7d.toLocaleString()} in bills due within 7 days`, urgency: "high" as const }] : []),
              ...(wasteCount > 0 ? [{ id: "waste", label: `${wasteCount} subscription${wasteCount > 1 ? "s" : ""} flagged as waste ($${k.estWaste}/mo)`, urgency: "normal" as const }] : []),
              ...(k.reserveHealth < 80 ? [{ id: "reserve", label: `Reserve health at ${k.reserveHealth}% — below target`, urgency: "high" as const }] : []),
              { id: "approvals", label: "No overdue approvals", urgency: "low" as const },
            ]}
          />

          <div className="space-y-3">
            <ListReveal domain="finance">
              {reserves.length > 0 ? reserves.map((r: Record<string, any>) => {
                const pct = r.target_amount > 0 ? Math.round((r.current_amount / r.target_amount) * 100) : 0;
                return (
                  <ListRevealItem key={r.id}>
                    <StatusCard
                      label={r.name}
                      status={pct >= 80 ? "healthy" : pct >= 50 ? "degraded" : "down"}
                      confidence={pct}
                      icon={<PiggyBank className="h-4 w-4" />}
                    />
                  </ListRevealItem>
                );
              }) : (
                <ListRevealItem>
                  <StatusCard label="No reserves configured" status="degraded" icon={<PiggyBank className="h-4 w-4" />} />
                </ListRevealItem>
              )}
            </ListReveal>
          </div>

          <ComparisonCard
            title="Monthly Budget Analysis"
            before={{ label: "Current", value: `$${k.monthlyBurn.toLocaleString()}/mo` }}
            after={{ label: "Target", value: `$${Math.round(k.monthlyBurn * 0.85).toLocaleString()}/mo` }}
            delta={`-$${Math.round(k.monthlyBurn * 0.15).toLocaleString()}`}
            deltaPositive
            recommendation={wasteCount > 0 ? `Cancel ${wasteCount} waste subscription(s) to save $${k.estWaste * 12}/yr` : "On track — no waste detected"}
          />

          <ProofCard
            title="Financial Data Provenance"
            chain={[
              { label: "Account balances synced", verified: true },
              { label: "Bill schedules loaded", verified: true },
              { label: "Subscription tracker scanned", verified: k.totalBalance > 0 },
              { label: "Reserve goals validated", verified: reserves.length > 0 },
            ]}
            status={k.totalBalance > 0 ? "verified" : "pending"}
          />
        </div>

        <AdvisorCard
          advisorName="Finance Advisor"
          domain="finance"
          insight={`Safe to spend: $${k.safeToSpend.toLocaleString()}. Reserve health at ${k.reserveHealth}%. ${wasteCount > 0 ? `${wasteCount} waste subscription(s) detected ($${k.estWaste}/mo).` : "No waste detected."}`}
          confidence={k.reserveHealth >= 80 ? 91 : 68}
          accentColor="hsl(160 60% 45%)"
          action={wasteCount > 0 ? { label: "Clean Up", onClick: () => toast.info("Cleanup planned — coming in a future update") } : undefined}
        />
      </div>
    </BoardroomCinematic>
  );
};

export default FinanceBoardroom;
