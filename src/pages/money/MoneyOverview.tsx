// ═══════════════════════════════════════════════════════════════
// Finance OS — Financial Calm Home
// Confidence-first layout: state → obligations → advisor
// ═══════════════════════════════════════════════════════════════

import { OperatingStateHero, WhatMattersNow, PreparedActions, WhatChangedFeed, PriorityQueue } from "@/components/sita/domain-shared";
import { DomainAdvisorCard } from "@/components/advisors/DomainAdvisorCard";
import type { MatterItem, ChangeEvent, PreparedAction, HeroMetric, PriorityItem } from "@/components/sita/domain-shared";
import { GlassCard } from "@/components/sita/PremiumPageComponents";
import { EmptyStateCTA } from "@/components/sita/EmptyStateCTA";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useNavigate } from "react-router-dom";
import { useBills, useSubscriptions, useInvoices } from "@/hooks/use-sita-data";
import { useFinancialAccounts, useMoneyKPIs } from "@/hooks/use-domain-data";
import { useDataMode } from "@/contexts/DataModeContext";
import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  DollarSign, Wallet, PiggyBank, CreditCard, AlertTriangle, Receipt,
  Shield, Activity, ArrowRight, BarChart3, Zap, Gauge, Calendar, CheckCircle
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

  // Confidence banner state
  const urgentCount = useMemo(() => {
    const now = new Date();
    return bills.filter((b: any) => {
      const d = new Date(b.due_date);
      return Math.ceil((d.getTime() - now.getTime()) / 86400000) <= 2 && Math.ceil((d.getTime() - now.getTime()) / 86400000) >= 0;
    }).length;
  }, [bills]);

  const confidenceState = urgentCount === 0
    ? { label: "Your finances are stable", color: "hsl(152 55% 48%)", icon: Shield }
    : { label: `${urgentCount} item${urgentCount !== 1 ? "s" : ""} need attention`, color: "hsl(38 85% 55%)", icon: AlertTriangle };

  const heroMetrics: HeroMetric[] = useMemo(() => [
    { label: "Balance", value: `$${(kpis?.totalBalance || 24800).toLocaleString()}`, icon: Wallet },
    { label: "Safe to Spend", value: `$${(kpis?.safeToSpend || 3200).toLocaleString()}`, icon: Shield },
    { label: "Bills Due (7d)", value: `$${(kpis?.billsDue7d || 1450).toLocaleString()}`, change: `${kpis?.billsDue7dCount || 3} bills`, changeDirection: "down" as const, icon: Calendar },
    { label: "Reserve Health", value: `${kpis?.reserveHealth || 60}%`, change: kpis?.reserveHealth && kpis.reserveHealth >= 80 ? "On track" : "Below target", changeDirection: kpis?.reserveHealth && kpis.reserveHealth >= 80 ? "up" as const : "down" as const, icon: PiggyBank },
  ], [kpis]);

  const priorities: PriorityItem[] = useMemo(() => [
    { id: "fp1", title: "3 bills due within 48 hours — $1,450", subtitle: "Bill collision detected. Review payment plan.", urgency: "high" as const, icon: Receipt, actionLabel: "Review", onAction: () => navigate("/money/bills") },
    { id: "fp2", title: "Emergency reserve at 60%", subtitle: "Below 3-month target. Consider allocation.", urgency: "medium" as const, icon: PiggyBank, actionLabel: "Plan", onAction: () => navigate("/money/reserves") },
    { id: "fp3", title: "Subscription creep: +8% over 90 days", subtitle: "Monthly total increasing. Review waste.", urgency: "low" as const, icon: CreditCard, actionLabel: "Audit", onAction: () => navigate("/money/subscriptions") },
  ], [navigate]);

  const prepared: PreparedAction[] = useMemo(() => [
    { id: "fp1", title: "Friday payment plan prepared", description: "Groups 3 bills due this week into one payment session", type: "automation" as const, confidence: 0.94 },
    { id: "fp2", title: "Waste subscription review", description: "2 subscriptions flagged for potential cancellation — $38/mo savings", type: "suggestion" as const, confidence: 0.82 },
  ], []);

  const changes: ChangeEvent[] = useMemo(() => [
    { id: "fc1", icon: <DollarSign className="h-3 w-3 text-[hsl(152_55%_48%)]" />, title: "Payroll deposit received — $4,800", subtitle: "Direct deposit from employer", time: "6h ago" },
    { id: "fc2", icon: <CreditCard className="h-3 w-3 text-destructive" />, title: "Unusual charge: $120 pharmacy", subtitle: "Flagged as atypical — review recommended", time: "Yesterday" },
    { id: "fc3", icon: <Receipt className="h-3 w-3 text-primary" />, title: "Auto-pay: Internet bill — $89", subtitle: "Recurring payment processed", time: "Yesterday" },
  ], []);

  const advisorInsights = useMemo(() => [
    { id: "fa1", text: "Your reserves cover 4.2 months of obligations — aim for 6 months", confidence: 91 },
    { id: "fa2", text: "2 subscriptions could be optimized — save $38/mo", confidence: 82, action: "Review", onAction: () => navigate("/money/subscriptions") },
  ], [navigate]);

  if (!hasLiveData) {
    return (
      <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <EmptyStateCTA
          icon={DollarSign}
          title="Set up your financial command center"
          description="Add your first bill or subscription to unlock cash flow intelligence."
          actions={[
            { label: "Add a Bill", icon: Receipt, to: "/money/bills" },
            { label: "Track Subscription", icon: CreditCard, to: "/money/subscriptions", variant: "secondary" },
          ]}
          tip="The money advisor detects waste and protects your runway automatically"
        />
      </motion.div>
    );
  }

  return (
    <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <DemoModeBadge />

      {/* Confidence Banner */}
      <motion.div
        className="flex items-center gap-3 rounded-xl border px-4 py-3"
        style={{
          borderColor: `${confidenceState.color}20`,
          background: `linear-gradient(135deg, ${confidenceState.color}08, transparent)`,
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <confidenceState.icon className="h-5 w-5" style={{ color: confidenceState.color }} />
        <p className="text-sm font-semibold text-foreground">{confidenceState.label}</p>
      </motion.div>

      {/* Operating State */}
      <OperatingStateHero
        metrics={heroMetrics}
        accentFrom="hsl(152 55% 48%)"
        accentTo="hsl(165 50% 42%)"
      />

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PriorityQueue items={priorities} title="Attention Needed" accentColor="hsl(152 55% 48%)" />
        <WhatChangedFeed events={changes} />
      </div>

      <PreparedActions actions={prepared} />

      <DomainAdvisorCard domain="finance" insights={advisorInsights} />

      {/* Navigation tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Bills", count: `${kpis?.billsDue7dCount || 3} due`, icon: Receipt, path: "/money/bills" },
          { label: "Spending", count: "Pulse view", icon: Activity, path: "/money/spending-pulse" },
          { label: "Budgets", count: "Review", icon: BarChart3, path: "/money/budgets" },
          { label: "Reserves", count: `${kpis?.reserveHealth || 60}%`, icon: PiggyBank, path: "/money/reserves" },
        ].map(tile => (
          <button key={tile.label} onClick={() => navigate(tile.path)}
            className="group rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3 text-left hover:bg-[hsl(0_0%_100%/0.05)] transition-colors">
            <tile.icon className="h-4 w-4 text-[hsl(152_55%_48%)] mb-2" />
            <p className="text-[12px] font-semibold text-foreground">{tile.label}</p>
            <p className="text-[10px] text-muted-foreground">{tile.count}</p>
            <ArrowRight className="h-3 w-3 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default MoneyOverview;
