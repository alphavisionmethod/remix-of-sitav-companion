import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, ProofCard, TimelineItem } from "@/components/sita/SitaComponents";
import { AmbientHeader, StaggerReveal, StaggerItem, MetricHighlight, GlassCard } from "@/components/sita/PremiumPageComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { EmptyStateCTA } from "@/components/sita/EmptyStateCTA";
import { WhatMattersNow, WhatChangedFeed, PreparedActions, QuickActionBar } from "@/components/sita/domain-shared";
import type { MatterItem, ChangeEvent, PreparedAction } from "@/components/sita/domain-shared";
import { useNavigate } from "react-router-dom";
import { useBills, useSubscriptions, useInvoices } from "@/hooks/use-sita-data";
import { useFinancialAccounts, useMoneyKPIs } from "@/hooks/use-domain-data";
import { useDataMode } from "@/contexts/DataModeContext";
import { useCashflowAnalysis, useBurnRate } from "@/hooks/use-backend-actions";
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard, AlertTriangle, PiggyBank, Wallet, Briefcase,
  Building, CheckCircle, Clock, ArrowRight, BarChart3, Shield, Zap, Receipt, Calendar, ShieldAlert,
  Gauge, Flame, ArrowUpRight, ArrowDownRight, Eye, Activity, Banknote, Lock, Unlock
} from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useFraudSentinel } from "@/contexts/SitaKernelContext";
import type { FraudSummary } from "@/lib/core-services/fraud-sentinel";
import { BudgetAutomationPanel } from "@/components/sita/BudgetAutomationPanel";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const accountIcons: Record<string, typeof Briefcase> = {
  checking: Wallet, savings: PiggyBank, investment: Building, default: Briefcase,
};

/* ── Bento Cell ── */
const BentoCell = ({ children, className = "", span = "col-span-1", row = "" }: {
  children: React.ReactNode; className?: string; span?: string; row?: string;
}) => (
  <motion.div
    className={`${span} ${row} ${className}`}
    initial={{ opacity: 0, y: 20, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ type: "spring", stiffness: 100, damping: 20 }}
  >
    {children}
  </motion.div>
);

/* ── Cockpit Gauge ── */
const CockpitGauge = ({ label, value, max, color, icon: Icon, unit = "" }: {
  label: string; value: number; max: number; color: string; icon: typeof Gauge; unit?: string;
}) => {
  const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100));
  const angle = (pct / 100) * 180;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-10 overflow-hidden">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <path d="M 5 50 A 45 45 0 0 1 95 50" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" strokeLinecap="round" />
          <motion.path
            d="M 5 50 A 45 45 0 0 1 95 50"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="141.37"
            initial={{ strokeDashoffset: 141.37 }}
            animate={{ strokeDashoffset: 141.37 - (141.37 * pct / 100) }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-0">
          <Icon className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>
      <p className="font-display text-sm font-bold text-foreground mt-1">{unit}{value.toLocaleString()}</p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </div>
  );
};

/* ── Cash Flow River ── */
const CashFlowRiver = ({ inflow, outflow, net }: { inflow: number; outflow: number; net: number }) => {
  const total = inflow + outflow || 1;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <ArrowDownRight className="h-4 w-4 text-chart-2 shrink-0" />
        <div className="flex-1">
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-muted-foreground">Inflow</span>
            <span className="font-semibold text-chart-2">${inflow.toLocaleString()}</span>
          </div>
          <div className="h-3 rounded-full bg-secondary/30 overflow-hidden">
            <motion.div className="h-full rounded-full bg-chart-2/60" initial={{ width: 0 }} animate={{ width: `${(inflow / total) * 100}%` }} transition={{ duration: 1 }} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ArrowUpRight className="h-4 w-4 text-destructive shrink-0" />
        <div className="flex-1">
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-muted-foreground">Outflow</span>
            <span className="font-semibold text-destructive">${outflow.toLocaleString()}</span>
          </div>
          <div className="h-3 rounded-full bg-secondary/30 overflow-hidden">
            <motion.div className="h-full rounded-full bg-destructive/50" initial={{ width: 0 }} animate={{ width: `${(outflow / total) * 100}%` }} transition={{ duration: 1 }} />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border/20">
        <span className="text-xs text-muted-foreground">Net Position</span>
        <span className={`font-display text-lg font-bold ${net >= 0 ? "text-chart-2" : "text-destructive"}`}>
          {net >= 0 ? "+" : ""}${net.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

const MoneyOverview = () => {
  const navigate = useNavigate();
  const { isDemoMode } = useDataMode();
  const { data: bills = [] } = useBills();
  const { data: subscriptions = [] } = useSubscriptions();
  const { data: invoices = [] } = useInvoices();
  const { data: accounts = [] } = useFinancialAccounts();
  const { data: kpis } = useMoneyKPIs();
  const { data: cfAnalysis } = useCashflowAnalysis();
  const { data: burnRateData } = useBurnRate();

  const hasLiveData = isDemoMode || bills.length > 0 || subscriptions.length > 0 || invoices.length > 0 || accounts.length > 0;

  const sentinel = useFraudSentinel();
  const fraudSummary = useMemo<FraudSummary>(() => {
    sentinel.evaluate({ userId: "demo", timestamp: Date.now(), amount: 28000, isNewRecipient: true, method: "wire", recentTransactionCount: 5, recentTotalAmount: 35000 });
    sentinel.evaluate({ userId: "demo", timestamp: Date.now(), amount: 500, method: "ach", recentTransactionCount: 2, recentTotalAmount: 1000 });
    return sentinel.getSummary();
  }, [sentinel]);

  const activeSignals = useMemo(() => sentinel.getActiveSignals(), [sentinel]);

  const upcomingBills = useMemo(() => {
    const now = new Date();
    return bills
      .filter((b: Record<string, any>) => { const d = new Date(b.due_date); return Math.ceil((d.getTime() - now.getTime()) / 86400000) >= 0 && Math.ceil((d.getTime() - now.getTime()) / 86400000) <= 7; })
      .map((b: Record<string, any>) => { const d = new Date(b.due_date); return { name: b.name || b.payee, amount: Number(b.amount), due: d.toLocaleDateString("en", { month: "short", day: "numeric" }), daysLeft: Math.max(0, Math.ceil((d.getTime() - now.getTime()) / 86400000)) }; })
      .slice(0, 5);
  }, [bills]);

  const wasteSubscriptions = useMemo(() => subscriptions.filter((s: Record<string, any>) => s.is_waste).slice(0, 3), [subscriptions]);
  const pendingInvoices = useMemo(() => invoices.filter((i: Record<string, any>) => i.status !== "paid").slice(0, 3), [invoices]);

  const kBase = kpis || { totalBalance: 0, safeToSpend: 0, billsDue7d: 0, billsDue7dCount: 0, reserveHealth: 0, subscriptionMonthly: 0, subscriptionCount: 0, estWaste: 0, wasteCount: 0, receivables: 0, receivableCount: 0, monthlyBurn: 0 };
  const k = {
    ...kBase,
    totalBalance: cfAnalysis?.total_liquid_cents ? Math.round(cfAnalysis.total_liquid_cents / 100) : kBase.totalBalance,
    receivables: cfAnalysis?.total_receivable_cents ? Math.round(cfAnalysis.total_receivable_cents / 100) : kBase.receivables,
    monthlyBurn: burnRateData?.monthly_burn_cents ? Math.round(burnRateData.monthly_burn_cents / 100) : kBase.monthlyBurn,
    safeToSpend: cfAnalysis?.net_position_cents ? Math.round(cfAnalysis.net_position_cents / 100) : kBase.safeToSpend,
  };

  const financeMatters: MatterItem[] = useMemo(() => [
    { id: "fm1", title: "3 bills due within 48 hours — $1,450", subtitle: "Bill collision detected. Review payment plan.", urgency: "high", action: "Review", onAction: () => navigate("/money/bills") },
    { id: "fm2", title: "Emergency reserve at 60%", subtitle: "Below 3-month target. Consider allocation.", urgency: "medium", action: "Plan" },
    { id: "fm3", title: "Subscription creep: +8% over 90 days", subtitle: "Monthly total increasing. Review waste.", urgency: "low", action: "Audit", onAction: () => navigate("/money/subscriptions") },
  ], [navigate]);

  const financePrepared: PreparedAction[] = useMemo(() => [
    { id: "fp1", title: "Friday payment plan prepared", description: "Groups 3 bills due this week into one payment session", type: "automation", confidence: 0.94 },
    { id: "fp2", title: "Waste subscription review", description: "2 subscriptions flagged for potential cancellation — $38/mo savings", type: "suggestion", confidence: 0.82 },
    { id: "fp3", title: "Invoice follow-up for Apex Corp", description: "14-day overdue invoice — reminder draft ready", type: "draft", confidence: 0.87 },
  ], []);

  const financeChanges: ChangeEvent[] = useMemo(() => [
    { id: "fc1", icon: <DollarSign className="h-3 w-3 text-chart-2" />, title: "Payroll deposit received — $4,800", subtitle: "Direct deposit from employer", time: "6h ago" },
    { id: "fc2", icon: <CreditCard className="h-3 w-3 text-destructive" />, title: "Unusual charge: $120 pharmacy", subtitle: "Flagged as atypical — review recommended", time: "Yesterday" },
    { id: "fc3", icon: <Receipt className="h-3 w-3 text-primary" />, title: "Auto-pay: Internet bill — $89", subtitle: "Recurring payment processed", time: "Yesterday" },
    { id: "fc4", icon: <AlertTriangle className="h-3 w-3 text-amber-500" />, title: "Cloud storage plan increased to $12.99/mo", subtitle: "Previously $9.99/mo — auto-detected", time: "2d ago" },
  ], []);

  if (!hasLiveData) {
    return (
      <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <DemoModeBadge />
        <SitaPageHeader title="Money Center" subtitle="Cash posture, obligations, and financial intelligence" />
        <EmptyStateCTA
          icon={DollarSign}
          title="Set up your financial command center"
          description="Add your first bill, subscription, or budget to unlock AI-powered cash flow intelligence."
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
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <DemoModeBadge />
      <AmbientHeader
        title="Financial Cockpit"
        subtitle="Real-time cash posture, obligation radar, and wealth intelligence"
        icon={<Gauge className="h-5 w-5 text-chart-2" />}
        accentColor="hsl(150 60% 45%)"
      />

      {/* ═══ WHAT MATTERS NOW ═══ */}
      <WhatMattersNow items={financeMatters} domain="finance" />

      {/* ═══ PREPARED ACTIONS ═══ */}
      <PreparedActions actions={financePrepared} />

      {/* ═══ QUICK ACTIONS ═══ */}
      <QuickActionBar
        actions={[
          { label: "Pay Bills", icon: Receipt, onClick: () => navigate("/money/bills"), variant: "accent" },
          { label: "Spending Pulse", icon: Activity, onClick: () => navigate("/money/spending-pulse") },
          { label: "Check Budget", icon: BarChart3, onClick: () => navigate("/money/budgets") },
          { label: "Review Waste", icon: Zap, onClick: () => navigate("/money/subscriptions") },
        ]}
      />

      {/* ═══ WHAT CHANGED ═══ */}
      <WhatChangedFeed events={financeChanges} />

      {/* ═══ COCKPIT GAUGES ═══ */}
      <GlassCard glow="emerald" intensity="medium" className="p-5">
        <div className="flex items-center gap-2 mb-5">
          <Activity className="h-4 w-4 text-chart-2" />
          <p className="text-xs font-semibold text-foreground">Financial Instruments</p>
          <span className="ml-auto text-[10px] bg-chart-2/10 text-chart-2 rounded-full px-2 py-0.5 font-medium">Live</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center">
          <CockpitGauge label="Balance" value={k.totalBalance} max={100000} color="hsl(150, 60%, 45%)" icon={Wallet} unit="$" />
          <CockpitGauge label="Safe to Spend" value={k.safeToSpend} max={k.totalBalance || 50000} color="hsl(var(--primary))" icon={Shield} unit="$" />
          <CockpitGauge label="Reserve Health" value={k.reserveHealth} max={100} color="hsl(45, 90%, 55%)" icon={PiggyBank} unit="" />
          <CockpitGauge label="Burn Rate" value={k.monthlyBurn} max={k.totalBalance || 50000} color="hsl(350, 70%, 55%)" icon={Flame} unit="$" />
        </div>
      </GlassCard>

      {/* ═══ BENTO GRID ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-min">

        {/* Cash Flow River — 2×1 */}
        <BentoCell span="col-span-1 md:col-span-2">
          <GlassCard glow="emerald" intensity="subtle" className="p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-foreground">Cash Flow River</p>
                <p className="text-[10px] text-muted-foreground">30-day rolling view</p>
              </div>
              <button onClick={() => navigate("/money/cash-timing")} className="text-[10px] text-primary hover:underline">Details →</button>
            </div>
            <CashFlowRiver inflow={k.receivables + k.totalBalance * 0.3} outflow={k.monthlyBurn + k.billsDue7d} net={k.safeToSpend} />
          </GlassCard>
        </BentoCell>

        {/* Money Twin — 2×1 */}
        <BentoCell span="col-span-1 md:col-span-2">
          <GlassCard glow="primary" intensity="subtle" className="p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold text-foreground">Money Twin</p>
              <span className="ml-auto text-[10px] bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">Live Model</span>
            </div>
            {(() => {
              const committed = k.billsDue7d * 4 + k.subscriptionMonthly;
              const flexible = k.safeToSpend;
              const risky = Math.round(k.totalBalance * 0.08);
              const safe = Math.round(k.totalBalance * 0.1);
              const flows = [
                { label: "Committed", amount: committed, color: "bg-destructive/60", icon: Lock },
                { label: "Flexible", amount: flexible, color: "bg-chart-2/60", icon: Unlock },
                { label: "At Risk", amount: risky, color: "bg-amber-500/60", icon: AlertTriangle },
                { label: "Protected", amount: safe, color: "bg-primary/60", icon: Shield },
              ];
              const total = flows.reduce((s, f) => s + f.amount, 0) || 1;
              return (
                <div className="space-y-2">
                  {/* Stacked bar */}
                  <div className="flex h-4 rounded-full overflow-hidden bg-secondary/30">
                    {flows.map(f => (
                      <motion.div key={f.label} className={`h-full ${f.color}`} initial={{ width: 0 }} animate={{ width: `${Math.max(2, (f.amount / total) * 100)}%` }} transition={{ duration: 0.8 }} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {flows.map(f => (
                      <div key={f.label} className="flex items-center gap-2">
                        <f.icon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{f.label}</span>
                        <span className="text-[10px] font-semibold text-foreground ml-auto">${f.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </GlassCard>
        </BentoCell>

        {/* Stress Radar — 2×1 */}
        <BentoCell span="col-span-1 md:col-span-2">
          <GlassCard glow="gold" intensity="subtle" className="p-4 h-full">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <p className="text-xs font-semibold text-foreground">Stress Radar</p>
              <button onClick={() => navigate("/money/stress-radar")} className="ml-auto text-[10px] text-primary hover:underline">Full radar →</button>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { signal: "Bill collision in 5 days", severity: "high", desc: "3 bills totaling $1,450 due within 48h" },
                { signal: "Reserve weakness", severity: "medium", desc: "Emergency fund at 60%" },
                { signal: "Subscription creep", severity: "low", desc: "Monthly total up 8% over 90d" },
              ].map((s, i) => (
                <div key={i} className={`rounded-xl p-3 ${s.severity === "high" ? "bg-destructive/5 border border-destructive/20" : s.severity === "medium" ? "bg-amber-500/5 border border-amber-500/20" : "bg-secondary/30 border border-border"}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={`h-2 w-2 rounded-full ${s.severity === "high" ? "bg-destructive" : s.severity === "medium" ? "bg-amber-500" : "bg-muted-foreground"}`} />
                    <p className="text-[11px] font-semibold text-foreground">{s.signal}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </BentoCell>

        {/* Score Tiles — 4×1 */}
        {[
          { label: "Peace Score", value: "72", sub: "/ 100", color: "text-primary", to: "/money/peace-score" },
          { label: "Health Grade", value: "B+", sub: "76/100", color: "text-chart-2", to: "/money/health" },
          { label: "Active Mode", value: "Stable", sub: "Balanced", color: "text-primary", to: "/money/modes" },
          { label: "Integrity", value: "64", sub: "/ 100", color: "text-amber-500", to: "/money/boundaries" },
        ].map(tile => (
          <BentoCell key={tile.label}>
            <GlassCard glow="none" hover className="p-4 h-full text-center cursor-pointer" onClick={() => navigate(tile.to)}>
              <p className="text-[10px] text-muted-foreground mb-1">{tile.label}</p>
              <p className={`font-display text-2xl font-bold ${tile.color}`}>{tile.value}</p>
              <p className="text-[10px] text-muted-foreground">{tile.sub}</p>
            </GlassCard>
          </BentoCell>
        ))}

        {/* Fraud Monitor — 2×1 */}
        <BentoCell span="col-span-1 md:col-span-2">
          <GlassCard glow="rose" intensity="subtle" className="p-4 h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-xl bg-destructive/10 p-2"><ShieldAlert className="h-4 w-4 text-destructive" /></div>
              <div>
                <p className="text-xs font-semibold text-foreground">Fraud Monitor</p>
                <p className="text-[10px] text-muted-foreground">{fraudSummary.activeAlerts} active alerts</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Risk</span>
                <span className={`font-display text-lg font-bold ${fraudSummary.riskScore > 50 ? "text-destructive" : fraudSummary.riskScore > 20 ? "text-accent" : "text-chart-2"}`}>
                  {fraudSummary.riskScore}
                </span>
              </div>
            </div>
            {activeSignals.length > 0 && (
              <div className="space-y-1.5">
                {activeSignals.slice(0, 3).map((signal, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-1.5 text-xs">
                    <AlertTriangle className={`h-3 w-3 shrink-0 ${signal.severity === "critical" ? "text-destructive" : "text-accent"}`} />
                    <span className="text-foreground">{signal.description}</span>
                    <span className="ml-auto text-muted-foreground text-[10px]">{signal.severity}</span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </BentoCell>

        {/* Bill Calendar — 1×1 */}
        <BentoCell>
          <GlassCard glow="none" className="p-4 h-full">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-foreground">Bill Calendar</p>
              <button onClick={() => navigate("/money/bills")} className="text-[10px] text-primary hover:underline">All →</button>
            </div>
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: 7 }, (_, i) => {
                const d = new Date(); d.setDate(d.getDate() + i);
                const hasBill = upcomingBills.some(b => b.daysLeft === i);
                return (
                  <div key={i} className={`flex-1 text-center rounded-lg py-1.5 ${i === 0 ? "bg-primary/10 border border-primary/20" : hasBill ? "bg-amber-500/10 border border-amber-500/20" : "bg-secondary/30"}`}>
                    <p className="text-[9px] text-muted-foreground">{d.toLocaleDateString("en", { weekday: "narrow" })}</p>
                    <p className={`text-xs font-semibold ${i === 0 ? "text-primary" : "text-foreground"}`}>{d.getDate()}</p>
                    {hasBill && <div className="h-1 w-1 rounded-full bg-amber-500 mx-auto mt-0.5" />}
                  </div>
                );
              })}
            </div>
            <div className="space-y-1.5">
              {upcomingBills.slice(0, 3).map((b, i) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <span className="text-foreground truncate">{b.name}</span>
                  <span className="font-semibold text-foreground shrink-0">${b.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </BentoCell>

        {/* Waste Detector — 1×1 */}
        <BentoCell>
          <GlassCard glow="gold" intensity="subtle" className="p-4 h-full">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-foreground">Waste Detector</p>
              <button onClick={() => navigate("/money/subscriptions")} className="text-[10px] text-primary hover:underline">All →</button>
            </div>
            <div className="text-center mb-3">
              <p className="font-display text-2xl font-bold text-amber-500">${k.estWaste * 12}</p>
              <p className="text-[10px] text-muted-foreground">Annual savings potential</p>
            </div>
            <div className="space-y-1.5">
              {wasteSubscriptions.map((sub: any, i: number) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-amber-500/5 px-2 py-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <span className="text-[10px] text-foreground flex-1 truncate">{sub.name}</span>
                  <span className="text-[10px] font-semibold text-chart-2">${(Number(sub.cost) * 12).toFixed(0)}/yr</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </BentoCell>

        {/* Accounts — 2×1 */}
        <BentoCell span="col-span-1 md:col-span-2">
          <GlassCard glow="none" className="p-4 h-full">
            <p className="text-xs font-semibold text-foreground mb-3">Accounts</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {accounts.slice(0, 4).map((acc: Record<string, any>) => {
                const Icon = accountIcons[acc.account_type] || accountIcons.default;
                return (
                  <div key={acc.id} className="flex items-center gap-3 rounded-xl bg-secondary/20 border border-border/50 p-3">
                    <div className="rounded-lg bg-primary/10 p-2"><Icon className="h-3.5 w-3.5 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-foreground truncate">{acc.name}</p>
                      <p className="text-[9px] text-muted-foreground">{acc.institution}</p>
                    </div>
                    <p className="font-display text-sm font-bold text-foreground">${Number(acc.balance).toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </BentoCell>

        {/* Expected Inflows — 1×1 */}
        <BentoCell>
          <GlassCard glow="emerald" intensity="subtle" className="p-4 h-full">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-foreground">Expected Inflows</p>
              <Banknote className="h-3.5 w-3.5 text-chart-2" />
            </div>
            <div className="space-y-2">
              {pendingInvoices.map((inv: Record<string, any>) => (
                <div key={inv.id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-foreground truncate">{inv.client_name || inv.description || `#${inv.invoice_number}`}</p>
                    <p className="text-[9px] text-muted-foreground">{new Date(inv.due_date).toLocaleDateString("en", { month: "short", day: "numeric" })}</p>
                  </div>
                  <p className="font-display text-sm font-bold text-chart-2 shrink-0">${Number(inv.amount).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </BentoCell>

        {/* Advisor — 1×1 */}
        <BentoCell>
          <LiveAdvisorCard
            advisor="money"
            intent="cash_posture"
            context={{ total_balance: k.totalBalance, monthly_burn: k.monthlyBurn, safe_to_spend: k.safeToSpend }}
            demoName="Money Advisor"
            demoRole="Cash Intelligence"
            demoConfidence="High"
            demoRecommendation={`Cash: $${k.totalBalance.toLocaleString()}. Safe to spend: $${k.safeToSpend.toLocaleString()}.${k.wasteCount > 0 ? ` ${k.wasteCount} waste subs detected.` : ""}`}
            demoReasoning={`${accounts.length}-account analysis.`}
          />
        </BentoCell>

        {/* Boardroom + Budget — 2×1 */}
        <BentoCell span="col-span-1 md:col-span-2">
          <div className="grid gap-3 grid-cols-2 h-full">
            <GlassCard glow="primary" intensity="medium" className="p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <SitaCardTitle>Finance Boardroom</SitaCardTitle>
                </div>
                <p className="text-[10px] text-muted-foreground">Weekly review ready</p>
              </div>
              <SitaButton variant="accent" size="sm" className="mt-3" onClick={() => navigate("/money/boardroom")}>
                Open <ArrowRight className="h-3 w-3" />
              </SitaButton>
            </GlassCard>
            <BudgetAutomationPanel />
          </div>
        </BentoCell>
      </div>
    </motion.div>
  );
};

export default MoneyOverview;
