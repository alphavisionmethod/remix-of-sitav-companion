// ═══════════════════════════════════════════════════════════════
// Finance OS — Financial Calm Home
// Composed, precise, confidence-building — calmer motion + spacing
// ═══════════════════════════════════════════════════════════════

import { HeroCard, QueueCard, ActionCard, TimelineCard, AdvisorCard, StatusCard } from "@/components/sita/cards";
import { UrgencyBadge, FreshnessBadge, TrustBadge } from "@/components/sita/badges";
import { ListReveal, ListRevealItem } from "@/components/sita/motion/AppTransitions";
import { AppSurface } from "@/components/sita/surfaces/AppSurface";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { PremiumEmptyState } from "@/components/sita/PremiumEmptyState";
import { useNavigate } from "react-router-dom";
import { useBills, useSubscriptions, useInvoices } from "@/hooks/use-sita-data";
import { useFinancialAccounts, useMoneyKPIs } from "@/hooks/use-domain-data";
import { useDataMode } from "@/contexts/DataModeContext";
import { useMemo } from "react";
import {
  DollarSign, Wallet, PiggyBank, CreditCard, AlertTriangle, Receipt,
  Shield, Activity, ArrowRight, BarChart3, Calendar, CheckCircle
} from "lucide-react";

const MoneyOverview = () => {
  const navigate = useNavigate();
  const { isDemoMode } = useDataMode();
  const { data: bills = [] } = useBills();
  const { data: subscriptions = [] } = useSubscriptions();
  const { data: invoices = [] } = useInvoices();
  const { data: accounts = [] } = useFinancialAccounts();
  const { data: kpis } = useMoneyKPIs();

  const hasLiveData = isDemoMode || bills.length > 0 || subscriptions.length > 0 || invoices.length > 0 || accounts.length > 0;

  const urgentCount = useMemo(() => {
    const now = new Date();
    return bills.filter((b: any) => {
      const d = new Date(b.due_date);
      return Math.ceil((d.getTime() - now.getTime()) / 86400000) <= 2 && Math.ceil((d.getTime() - now.getTime()) / 86400000) >= 0;
    }).length;
  }, [bills]);

  const reserveHealth = kpis?.reserveHealth || 60;

  const queueItems = useMemo(() => [
    { id: "fp1", label: "3 bills due within 48 hours — $1,450", meta: "Review plan", urgency: "high" as const, badge: <UrgencyBadge urgency="high" /> },
    { id: "fp2", label: "Emergency reserve at 60%", meta: "Below target", urgency: "normal" as const, badge: <FreshnessBadge freshness="stale" label="Below 3mo target" /> },
    { id: "fp3", label: "Subscription creep: +8% over 90 days", meta: "$38/mo", urgency: "low" as const },
  ], []);

  const timelineEvents = useMemo(() => [
    { id: "fc1", title: "Payroll deposit received — $4,800", timestamp: "6h ago", icon: <DollarSign className="h-3 w-3 text-[hsl(152_55%_48%)]" />, accentColor: "hsl(152 55% 48%)" },
    { id: "fc2", title: "Unusual charge: $120 pharmacy", timestamp: "Yesterday", detail: "Flagged as atypical — review recommended", icon: <CreditCard className="h-3 w-3 text-[hsl(0_70%_55%)]" />, accentColor: "hsl(0 70% 55%)" },
    { id: "fc3", title: "Auto-pay: Internet bill — $89", timestamp: "Yesterday", icon: <Receipt className="h-3 w-3 text-[hsl(152_55%_48%)]" />, accentColor: "hsl(152 55% 48%)" },
  ], []);

  if (!hasLiveData) {
    return (
      <PremiumEmptyState
        variant="first-use"
        icon={DollarSign}
        title="Set up your financial command center"
        description="Add your first bill or subscription to unlock cash flow intelligence."
        actions={[
          { label: "Add a Bill", icon: Receipt, onClick: () => navigate("/money/bills") },
          { label: "Track Subscription", icon: CreditCard, onClick: () => navigate("/money/subscriptions"), variant: "secondary" as const },
        ]}
        tip="The money advisor detects waste and protects your runway automatically"
        domain="finance"
      />
    );
  }

  return (
    <AppSurface level={0} className="space-y-5 p-0 border-0 rounded-none bg-transparent">
      <DemoModeBadge />

      <ListReveal className="space-y-5" domain="finance">
        {/* Confidence state */}
        <ListRevealItem>
          <StatusCard
            label={urgentCount === 0 ? "Your finances are stable" : `${urgentCount} item${urgentCount !== 1 ? "s" : ""} need attention`}
            status={urgentCount === 0 ? "healthy" : "degraded"}
            confidence={reserveHealth}
            icon={<Shield className="h-4 w-4" />}
          />
        </ListRevealItem>

        {/* Hero — Financial summary */}
        <ListRevealItem>
          <HeroCard
            title="Financial Position"
            metric={`$${(kpis?.totalBalance || 24800).toLocaleString()}`}
            subtitle={`Safe to spend: $${(kpis?.safeToSpend || 3200).toLocaleString()} · ${kpis?.billsDue7dCount || 3} bills due this week · Reserve ${reserveHealth}%`}
            accentFrom="hsl(152 55% 48%)"
            accentTo="hsl(165 50% 42%)"
            icon={<Wallet className="h-4 w-4 text-[hsl(152_55%_48%)]" />}
          />
        </ListRevealItem>

        {/* Two-column: Queue + Timeline */}
        <ListRevealItem>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <QueueCard
              title="Attention Needed"
              items={queueItems}
              onItemClick={(id) => {
                if (id === "fp1") navigate("/money/bills");
                if (id === "fp2") navigate("/money/reserves");
                if (id === "fp3") navigate("/money/subscriptions");
              }}
            />
            <TimelineCard title="What Changed" events={timelineEvents} />
          </div>
        </ListRevealItem>

        {/* Prepared Actions */}
        <ListRevealItem>
          <div className="space-y-2">
            <ActionCard
              title="Friday payment plan prepared"
              description="Groups 3 bills due this week into one payment session"
              accentColor="hsl(152 55% 48%)"
              onApprove={() => {}}
              onDismiss={() => {}}
              badge={<TrustBadge level="verified" />}
            />
            <ActionCard
              title="Waste subscription review"
              description="2 subscriptions flagged for potential cancellation — $38/mo savings"
              accentColor="hsl(152 55% 48%)"
              onApprove={() => {}}
              onDismiss={() => {}}
            />
          </div>
        </ListRevealItem>

        {/* Advisor */}
        <ListRevealItem>
          <AdvisorCard
            advisorName="Finance Advisor"
            insight="Your reserves cover 4.2 months of obligations — aim for 6 months. 2 subscriptions could be optimized — save $38/mo."
            confidence={91}
            domain="Finance"
            accentColor="hsl(152 55% 48%)"
            action={{ label: "Review Subscriptions", onClick: () => navigate("/money/subscriptions") }}
          />
        </ListRevealItem>

        {/* Quick nav tiles */}
        <ListRevealItem>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Bills", count: `${kpis?.billsDue7dCount || 3} due`, icon: Receipt, path: "/money/bills" },
              { label: "Spending", count: "Pulse view", icon: Activity, path: "/money/spending-pulse" },
              { label: "Budgets", count: "Review", icon: BarChart3, path: "/money/budgets" },
              { label: "Reserves", count: `${reserveHealth}%`, icon: PiggyBank, path: "/money/reserves" },
            ].map(tile => (
              <button key={tile.label} onClick={() => navigate(tile.path)}
                className="group rounded-2xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3 text-left hover:bg-[hsl(0_0%_100%/0.05)] transition-colors"
                style={{ borderRadius: "var(--domain-card-radius, 16px)" }}
              >
                <tile.icon className="h-4 w-4 text-[hsl(152_55%_48%)] mb-2" />
                <p className="text-[12px] font-semibold text-foreground">{tile.label}</p>
                <p className="text-[10px] text-muted-foreground">{tile.count}</p>
                <ArrowRight className="h-3 w-3 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </ListRevealItem>
      </ListReveal>
    </AppSurface>
  );
};

export default MoneyOverview;
