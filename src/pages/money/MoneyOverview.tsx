import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, RiskCard, OpportunityCard, ProofCard, TimelineItem } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { EmptyStateCTA } from "@/components/sita/EmptyStateCTA";
import { useNavigate } from "react-router-dom";
import { useBills, useSubscriptions, useInvoices } from "@/hooks/use-sita-data";
import { useFinancialAccounts, useMoneyKPIs } from "@/hooks/use-domain-data";
import { useDataMode } from "@/contexts/DataModeContext";
import { useCashflowAnalysis, useBurnRate } from "@/hooks/use-backend-actions";
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard, AlertTriangle, PiggyBank, Wallet, Briefcase,
  Building, CheckCircle, Clock, ArrowRight, BarChart3, Shield, Zap, Receipt, Calendar, ShieldAlert
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

const MoneyOverview = () => {
  const navigate = useNavigate();
  const { isDemoMode } = useDataMode();
  const { data: bills = [] } = useBills();
  const { data: subscriptions = [] } = useSubscriptions();
  const { data: invoices = [] } = useInvoices();
  const { data: accounts = [] } = useFinancialAccounts();
  const { data: kpis } = useMoneyKPIs();

  // Wire to cashflow-calculate edge function
  const { data: cfAnalysis } = useCashflowAnalysis();
  const { data: burnRateData } = useBurnRate();

  const hasLiveData = isDemoMode || bills.length > 0 || subscriptions.length > 0 || invoices.length > 0 || accounts.length > 0;

  const sentinel = useFraudSentinel();

  const fraudSummary = useMemo<FraudSummary>(() => {
    sentinel.evaluate({ userId: "demo", timestamp: Date.now(), amount: 28000, isNewRecipient: true, method: "wire", recentTransactionCount: 5, recentTotalAmount: 35000 });
    sentinel.evaluate({ userId: "demo", timestamp: Date.now(), amount: 500, method: "ach", recentTransactionCount: 2, recentTotalAmount: 1000 });
    sentinel.evaluate({ userId: "demo", timestamp: Date.now(), amount: 12000, isNewRecipient: false, method: "ach", recentTransactionCount: 1, recentTotalAmount: 12000 });
    return sentinel.getSummary();
  }, [sentinel]);

  const activeSignals = useMemo(() => {
    return sentinel.getActiveSignals();
  }, [sentinel]);

  // Upcoming bills from DB (next 7 days)
  const upcomingBills = useMemo(() => {
    const now = new Date();
    return bills
      .filter((b: Record<string, any>) => {
        const due = new Date(b.due_date);
        const diff = Math.ceil((due.getTime() - now.getTime()) / 86400000);
        return diff >= 0 && diff <= 7;
      })
      .map((b: Record<string, any>) => {
        const due = new Date(b.due_date);
        const daysLeft = Math.max(0, Math.ceil((due.getTime() - now.getTime()) / 86400000));
        return { name: b.name || b.payee, amount: `$${Number(b.amount).toLocaleString()}`, due: due.toLocaleDateString("en", { month: "short", day: "numeric" }), daysLeft };
      })
      .slice(0, 5);
  }, [bills]);

  // Recent receivables from DB
  const pendingInvoices = useMemo(() =>
    invoices.filter((i: Record<string, any>) => i.status !== "paid").slice(0, 3), [invoices]);

  // Waste subscriptions from DB
  const wasteSubscriptions = useMemo(() =>
    subscriptions.filter((s: Record<string, any>) => s.is_waste).slice(0, 3), [subscriptions]);

  const kBase = kpis || { totalBalance: 0, safeToSpend: 0, billsDue7d: 0, billsDue7dCount: 0, reserveHealth: 0, subscriptionMonthly: 0, subscriptionCount: 0, estWaste: 0, wasteCount: 0, receivables: 0, receivableCount: 0, monthlyBurn: 0 };

  // Overlay edge function data when available
  const k = {
    ...kBase,
    totalBalance: cfAnalysis?.total_liquid_cents ? Math.round(cfAnalysis.total_liquid_cents / 100) : kBase.totalBalance,
    receivables: cfAnalysis?.total_receivable_cents ? Math.round(cfAnalysis.total_receivable_cents / 100) : kBase.receivables,
    monthlyBurn: burnRateData?.monthly_burn_cents ? Math.round(burnRateData.monthly_burn_cents / 100) : kBase.monthlyBurn,
    safeToSpend: cfAnalysis?.net_position_cents ? Math.round(cfAnalysis.net_position_cents / 100) : kBase.safeToSpend,
  };

  if (!hasLiveData) {
    return (
      <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <DemoModeBadge />
        <SitaPageHeader title="Money Center" subtitle="Cash posture, obligations, and financial intelligence" />
        <EmptyStateCTA
          icon={DollarSign}
          title="Set up your financial command center"
          description="Add your first bill, subscription, or budget to unlock AI-powered cash flow intelligence and fraud detection."
          actions={[
            { label: "Add a Bill", icon: Receipt, to: "/money/bills" },
            { label: "Track Subscription", icon: CreditCard, to: "/money/subscriptions", variant: "secondary" },
            { label: "Set Budget", icon: PiggyBank, to: "/money/reserves", variant: "secondary" },
          ]}
          tip="The money advisor detects waste and protects your runway automatically"
        />
      </motion.div>
    );
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DomainHeader title="Money Center" subtitle="Cash posture, obligations, and financial intelligence" icon={DollarSign} domain="money" />

      {/* KPI Strip — from DB */}
      <motion.div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }} initial="hidden" animate="show">
        {[
          { label: "Total Balance", value: `$${k.totalBalance.toLocaleString()}`, trend: "up" as const, sub: `${accounts.length} accounts`, className: "gradient-sita-subtle" },
          { label: "Safe to Spend", value: `$${k.safeToSpend.toLocaleString()}`, sub: "After obligations" },
          { label: "Bills Due (7d)", value: `$${k.billsDue7d.toLocaleString()}`, sub: `${k.billsDue7dCount} bills` },
          { label: "Reserve Health", value: `${k.reserveHealth}%`, trend: "up" as const, sub: "On target" },
          { label: "Subscriptions", value: `$${k.subscriptionMonthly}/mo`, sub: `${k.subscriptionCount} active` },
          { label: "Est. Waste", value: `$${k.estWaste}/mo`, sub: `${k.wasteCount} flagged` },
          { label: "Receivables", value: `$${k.receivables.toLocaleString()}`, sub: `${k.receivableCount} expected` },
          { label: "Monthly Burn", value: `$${k.monthlyBurn.toLocaleString()}`, trend: "down" as const, sub: "Projected" },
        ].map((kpi, i) => (
          <motion.div key={i} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
            <KPITile {...kpi} />
          </motion.div>
        ))}
      </motion.div>

      {/* Fraud Monitor */}
      <SitaCard hover={false} className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-xl bg-destructive/10 p-2"><ShieldAlert className="h-4 w-4 text-destructive" /></div>
          <SitaCardTitle sub={`${fraudSummary.activeAlerts} active alert${fraudSummary.activeAlerts !== 1 ? "s" : ""}`}>Fraud Monitor</SitaCardTitle>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">Risk Score</span>
            <span className={`font-display text-sm font-bold ${fraudSummary.riskScore > 50 ? "text-destructive" : fraudSummary.riskScore > 20 ? "text-accent" : "text-trust-safe"}`}>
              {fraudSummary.riskScore}
            </span>
          </div>
        </div>
        {activeSignals.length > 0 && (
          <div className="space-y-1.5">
            {activeSignals.slice(0, 3).map((signal, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-1.5 text-xs">
                <AlertTriangle className={`h-3 w-3 shrink-0 ${signal.severity === "critical" ? "text-destructive" : signal.severity === "alert" ? "text-urgency-high" : "text-accent"}`} />
                <span className="text-foreground">{signal.description}</span>
                <span className="ml-auto text-muted-foreground text-[10px]">{signal.severity}</span>
              </div>
            ))}
          </div>
        )}
      </SitaCard>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Column 1 — Accounts from DB */}
        <div className="space-y-6">
          <div className="space-y-3">
            <SitaSectionHeader title="Accounts" />
            {accounts.map((acc: Record<string, any>) => {
              const Icon = accountIcons[acc.account_type] || accountIcons.default;
              return (
                <SitaCard key={acc.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-primary/8 p-2.5"><Icon className="h-4 w-4 text-primary" /></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{acc.name}</p>
                        <p className="text-xs text-muted-foreground">{acc.institution}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-base font-bold text-foreground">${Number(acc.balance).toLocaleString()}</p>
                      {acc.trend > 0 && <TrendingUp className="h-3.5 w-3.5 text-trust-safe ml-auto" />}
                      {acc.trend < 0 && <TrendingDown className="h-3.5 w-3.5 text-urgency-high ml-auto" />}
                    </div>
                  </div>
                </SitaCard>
              );
            })}
          </div>

          {/* Safe-to-Spend — Deterministic */}
          <SitaCard hover={false} className="gradient-sita-subtle p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-4 w-4 text-primary" />
              <SitaCardTitle>Safe to Spend</SitaCardTitle>
              <span className="ml-auto text-[10px] text-muted-foreground rounded-full bg-secondary px-2 py-0.5">Deterministic</span>
            </div>
            <p className="font-display text-4xl font-bold text-foreground tracking-tight">${k.safeToSpend.toLocaleString()}</p>
            <p className="mt-1 text-xs text-muted-foreground">Available after all obligations</p>
            <div className="mt-4 space-y-2 border-t border-border/30 pt-4">
              {[
                { label: "Total Cash", value: `$${k.totalBalance.toLocaleString()}`, color: "text-foreground" },
                { label: "− Bills due (7d)", value: `−$${k.billsDue7d.toLocaleString()}`, color: "text-[hsl(var(--sita-gold))]" },
                { label: "= Safe to spend", value: `$${k.safeToSpend.toLocaleString()}`, color: "text-[hsl(var(--trust-safe))]" },
              ].map((row, i) => (
                <div key={i} className={`flex items-center justify-between text-[12px] ${i === 2 ? "font-semibold pt-2 border-t border-border/20" : ""}`}>
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className={`font-mono tabular-nums ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>
            <ConfidenceBar value={Math.min(100, Math.round((k.safeToSpend / Math.max(k.totalBalance, 1)) * 100))} label="Spending capacity" size="md" className="mt-4" />
            <SitaButton variant="accent" size="sm" className="mt-3" onClick={() => navigate("/money/cash-timing")}>
              View Cash Timing <ArrowRight className="h-3 w-3" />
            </SitaButton>
          </SitaCard>
        </div>

        {/* Column 2 — Bills from DB */}
        <div className="space-y-6">
          <div className="space-y-3">
            <SitaSectionHeader title="Bill Calendar" action={<button onClick={() => navigate("/money/bills")} className="text-xs text-primary hover:underline">View all</button>} />
            <SitaCard hover={false} className="p-4">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 7 }, (_, i) => {
                  const d = new Date(); d.setDate(d.getDate() + i);
                  const dayName = d.toLocaleDateString("en", { weekday: "short" });
                  const dayNum = d.getDate();
                  const hasBill = upcomingBills.some(b => b.daysLeft === i);
                  return (
                    <div key={i} className={`flex-1 text-center rounded-lg py-2 transition-colors ${i === 0 ? "bg-primary/10 border border-primary/20" : hasBill ? "bg-[hsl(var(--sita-gold))]/10 border border-[hsl(var(--sita-gold))]/20" : "bg-secondary/30"}`}>
                      <p className="text-[10px] text-muted-foreground">{dayName}</p>
                      <p className={`text-sm font-semibold ${i === 0 ? "text-primary" : "text-foreground"}`}>{dayNum}</p>
                      {hasBill && <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--sita-gold))] mx-auto mt-1" />}
                    </div>
                  );
                })}
              </div>
            </SitaCard>
            {upcomingBills.map((bill, i) => (
              <SitaCard key={i} lane={bill.daysLeft <= 2 ? "action" : undefined} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-display text-sm font-bold ${bill.daysLeft <= 1 ? "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]" : bill.daysLeft <= 3 ? "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]" : "bg-secondary text-muted-foreground"}`}>
                      {bill.daysLeft}d
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{bill.name}</p>
                      <p className="text-xs text-muted-foreground">Due {bill.due}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-sm font-bold text-foreground">{bill.amount}</p>
                    <TrustBadge level={bill.daysLeft <= 2 ? "degraded" : "review"} label={bill.daysLeft <= 1 ? "Tomorrow" : `${bill.daysLeft} days`} size="sm" />
                  </div>
                </div>
              </SitaCard>
            ))}
          </div>

          {/* Waste Detection from DB */}
          <div className="space-y-3">
            <SitaSectionHeader title="Waste Detector" action={<button onClick={() => navigate("/money/subscriptions")} className="text-xs text-primary hover:underline">View all</button>} />
            {wasteSubscriptions.length > 0 ? (
              <SitaCard hover={false} className="p-4 border-l-4 border-l-[hsl(var(--sita-gold))]">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-[hsl(var(--sita-gold))]" />
                  <span className="text-sm font-semibold text-foreground">${k.estWaste * 12}/yr potential savings</span>
                  <span className="ml-auto text-[10px] text-muted-foreground bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))] rounded-full px-2 py-0.5 font-medium">{k.wasteCount} flagged</span>
                </div>
                <div className="space-y-2">
                  {wasteSubscriptions.map((sub: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg bg-secondary/30 px-3 py-2.5">
                      <div className="h-2 w-2 rounded-full bg-[hsl(var(--sita-gold))]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-foreground">{sub.name} — ${Number(sub.cost).toFixed(2)}/mo</p>
                        <p className="text-[10px] text-muted-foreground">Usage: {sub.usage_level || "Low"}</p>
                      </div>
                      <span className="text-[11px] font-semibold text-[hsl(var(--trust-safe))]">Save ${(Number(sub.cost) * 12).toFixed(0)}/yr</span>
                    </div>
                  ))}
                </div>
              </SitaCard>
            ) : (
              <SitaCard hover={false} className="p-4">
                <p className="text-sm text-muted-foreground">No waste detected</p>
              </SitaCard>
            )}
          </div>

          {/* Receivables from DB */}
          <div className="space-y-3">
            <SitaSectionHeader title="Expected Inflows" action={<button onClick={() => navigate("/money/receivables")} className="text-xs text-primary hover:underline">View all</button>} />
            {pendingInvoices.map((inv: Record<string, any>) => (
              <SitaCard key={inv.id} className="p-4" lane="opportunity">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{inv.client_name || inv.description || `Invoice #${inv.invoice_number}`}</p>
                    <p className="text-xs text-muted-foreground">Expected {new Date(inv.due_date).toLocaleDateString("en", { month: "short", day: "numeric" })}</p>
                  </div>
                  <p className="font-display text-sm font-bold text-trust-verified">${Number(inv.amount).toLocaleString()}</p>
                </div>
              </SitaCard>
            ))}
          </div>
        </div>

        {/* Column 3 — Advisor + Proof + Boardroom */}
        <div className="space-y-6">
          <LiveAdvisorCard
            advisor="money"
            intent="cash_posture"
            context={{ total_balance: k.totalBalance, monthly_burn: k.monthlyBurn, safe_to_spend: k.safeToSpend }}
            demoName="Money Advisor"
            demoRole="Cash & Obligation Intelligence"
            demoConfidence="High"
            demoRecommendation={`Cash position: $${k.totalBalance.toLocaleString()}. Safe to spend: $${k.safeToSpend.toLocaleString()}. ${k.wasteCount > 0 ? `${k.wasteCount} waste subscription${k.wasteCount > 1 ? "s" : ""} detected.` : "No waste detected."}`}
            demoReasoning={`Based on ${accounts.length}-account analysis, upcoming bills, and subscription usage patterns.`}
          />

          <div className="space-y-3">
            <SitaSectionHeader title="Recent Proof" />
            <ProofCard title="Rent payment scheduled" artifact="Auto-pay confirmed" time="2h ago" trust="verified" state="completed" />
            <ProofCard title="Invoice payment received" artifact="Stripe payment recorded" time="2h ago" trust="verified" state="verified" />
          </div>

          <BudgetAutomationPanel />

          <SitaCard hover={false} className="gradient-sita-subtle p-5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-primary" />
              <SitaCardTitle>Finance Boardroom</SitaCardTitle>
            </div>
            <p className="text-xs text-muted-foreground">Weekly review ready — reserve health, waste savings, cash outlook</p>
            <SitaButton variant="accent" size="sm" className="mt-3" onClick={() => navigate("/money/boardroom")}>
              Open Review <ArrowRight className="h-3 w-3" />
            </SitaButton>
          </SitaCard>
        </div>
      </div>
    </motion.div>
  );
};

export default MoneyOverview;
