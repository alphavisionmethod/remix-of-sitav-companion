import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, RiskCard, OpportunityCard, ProofCard, TimelineItem } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { EmptyStateCTA } from "@/components/sita/EmptyStateCTA";
import { useNavigate } from "react-router-dom";
import { useBills, useSubscriptions, useInvoices } from "@/hooks/use-sita-data";
import { useDataMode } from "@/contexts/DataModeContext";
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard, AlertTriangle, PiggyBank, Wallet, Briefcase,
  Building, CheckCircle, Clock, ArrowRight, BarChart3, Shield, Zap, Receipt, Calendar, ShieldAlert
} from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { FraudSentinelService, type FraudSummary } from "@/lib/core-services/fraud-sentinel";
import { BudgetAutomationPanel } from "@/components/sita/BudgetAutomationPanel";

const accounts = [
  { name: "Business Checking", balance: "$14,230", institution: "Chase", trend: "up" as const, icon: Briefcase },
  { name: "Business Savings", balance: "$28,500", institution: "Chase", trend: "flat" as const, icon: PiggyBank },
  { name: "Personal Checking", balance: "$3,840", institution: "Wells Fargo", trend: "down" as const, icon: Wallet },
  { name: "Emergency Fund", balance: "$12,000", institution: "Ally", trend: "flat" as const, icon: Building },
];

const upcomingBills = [
  { name: "Office Rent", amount: "$2,400", due: "Apr 1", daysLeft: 1 },
  { name: "AWS Hosting", amount: "$340", due: "Apr 3", daysLeft: 3 },
  { name: "Phone & Internet", amount: "$189", due: "Apr 5", daysLeft: 5 },
];

const changes = [
  { icon: CheckCircle, color: "text-trust-verified", title: "Rent payment scheduled — $2,400", subtitle: "Auto-pay confirmed for Apr 1", time: "2h ago" },
  { icon: AlertTriangle, color: "text-urgency-high", title: "Zoom Pro renewal in 3 days — $15.99", subtitle: "Usage: Low — consider canceling", time: "Today" },
  { icon: DollarSign, color: "text-trust-verified", title: "Invoice #1038 payment received — $4,200", subtitle: "Marcus Johnson via Stripe", time: "2h ago" },
  { icon: TrendingDown, color: "text-urgency-medium", title: "Personal checking below $4,000", subtitle: "Consider transferring from savings", time: "Today" },
];

const MoneyOverview = () => {
  const navigate = useNavigate();
  const { isDemoMode } = useDataMode();
  const { data: bills = [] } = useBills();
  const { data: subscriptions = [] } = useSubscriptions();
  const { data: invoices = [] } = useInvoices();

  const hasLiveData = isDemoMode || bills.length > 0 || subscriptions.length > 0 || invoices.length > 0;

  const fraudSummary = useMemo<FraudSummary>(() => {
    const sentinel = new FraudSentinelService();
    sentinel.evaluate({ userId: "demo", timestamp: Date.now(), amount: 28000, isNewRecipient: true, method: "wire", recentTransactionCount: 5, recentTotalAmount: 35000 });
    sentinel.evaluate({ userId: "demo", timestamp: Date.now(), amount: 500, method: "ach", recentTransactionCount: 2, recentTotalAmount: 1000 });
    sentinel.evaluate({ userId: "demo", timestamp: Date.now(), amount: 12000, isNewRecipient: false, method: "ach", recentTransactionCount: 1, recentTotalAmount: 12000 });
    return sentinel.getSummary();
  }, []);

  const activeSignals = useMemo(() => {
    const sentinel = new FraudSentinelService();
    sentinel.evaluate({ userId: "demo", timestamp: Date.now(), amount: 28000, isNewRecipient: true, method: "wire", recentTransactionCount: 5, recentTotalAmount: 35000 });
    return sentinel.getActiveSignals();
  }, []);

  if (!hasLiveData) {
    return (
      <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
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
      <DomainHeader
        title="Money Center"
        subtitle="Cash posture, obligations, and financial intelligence"
        icon={DollarSign}
        domain="money"
      />

      {/* KPI Strip */}
      <motion.div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }} initial="hidden" animate="show">
        {[
          { label: "Total Balance", value: "$58,570", trend: "up" as const, sub: "4 accounts", className: "gradient-sita-subtle" },
          { label: "Safe to Spend", value: "$3,180", sub: "After obligations" },
          { label: "Bills Due (7d)", value: "$2,929", sub: "3 bills" },
          { label: "Reserve Health", value: "94%", trend: "up" as const, sub: "On target" },
          { label: "Subscriptions", value: "$105/mo", sub: "5 active" },
          { label: "Est. Waste", value: "$28/mo", sub: "2 flagged" },
          { label: "Receivables", value: "$7,400", sub: "2 expected" },
          { label: "Monthly Burn", value: "$6,200", trend: "down" as const, sub: "-$300" },
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
        {/* Column 1 — Accounts + Cash Timing */}
        <div className="space-y-6">
          <div className="space-y-3">
            <SitaSectionHeader title="Accounts" />
            {accounts.map((acc, i) => (
              <SitaCard key={i} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/8 p-2.5"><acc.icon className="h-4 w-4 text-primary" /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{acc.name}</p>
                      <p className="text-xs text-muted-foreground">{acc.institution}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-base font-bold text-foreground">{acc.balance}</p>
                    {acc.trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-trust-safe ml-auto" />}
                    {acc.trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-urgency-high ml-auto" />}
                  </div>
                </div>
              </SitaCard>
            ))}
          </div>

          {/* Safe-to-Spend — Deterministic Calculation */}
          <SitaCard hover={false} className="gradient-sita-subtle p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-4 w-4 text-primary" />
              <SitaCardTitle>Safe to Spend</SitaCardTitle>
              <span className="ml-auto text-[10px] text-muted-foreground rounded-full bg-secondary px-2 py-0.5">Deterministic</span>
            </div>
            <p className="font-display text-4xl font-bold text-foreground tracking-tight">$3,180</p>
            <p className="mt-1 text-xs text-muted-foreground">Available after all obligations</p>
            
            {/* Breakdown */}
            <div className="mt-4 space-y-2 border-t border-border/30 pt-4">
              {[
                { label: "Total Cash", value: "$58,570", color: "text-foreground" },
                { label: "− Bills due (7d)", value: "−$2,929", color: "text-[hsl(var(--sita-gold))]" },
                { label: "− Reserve minimum", value: "−$12,000", color: "text-muted-foreground" },
                { label: "− Scheduled payments", value: "−$40,461", color: "text-muted-foreground" },
                { label: "= Safe to spend", value: "$3,180", color: "text-[hsl(var(--trust-safe))]" },
              ].map((row, i) => (
                <div key={i} className={`flex items-center justify-between text-[12px] ${i === 4 ? "font-semibold pt-2 border-t border-border/20" : ""}`}>
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className={`font-mono tabular-nums ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>
            
            <ConfidenceBar value={42} label="Spending capacity" size="md" className="mt-4" />
            
            <SitaButton variant="accent" size="sm" className="mt-3" onClick={() => navigate("/money/cash-timing")}>
              View Cash Timing <ArrowRight className="h-3 w-3" />
            </SitaButton>
          </SitaCard>
        </div>

        {/* Column 2 — Bills + Obligations */}
        <div className="space-y-6">
          <div className="space-y-3">
            <SitaSectionHeader title="Bill Calendar" action={<button onClick={() => navigate("/money/bills")} className="text-xs text-primary hover:underline">View all</button>} />
            {/* Visual calendar strip */}
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

          {/* Waste Detection */}
          <div className="space-y-3">
            <SitaSectionHeader title="Waste Detector" action={<button onClick={() => navigate("/money/subscriptions")} className="text-xs text-primary hover:underline">View all</button>} />
            <SitaCard hover={false} className="p-4 border-l-4 border-l-[hsl(var(--sita-gold))]">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-[hsl(var(--sita-gold))]" />
                <span className="text-sm font-semibold text-foreground">$336/yr potential savings</span>
                <span className="ml-auto text-[10px] text-muted-foreground bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))] rounded-full px-2 py-0.5 font-medium">2 flagged</span>
              </div>
              <div className="space-y-2">
                {[
                  { name: "Zoom Pro", cost: "$15.99/mo", usage: "Low", savings: "$192/yr", lastUsed: "3 weeks ago", risk: "medium" as const },
                  { name: "Calendly Pro", cost: "$12/mo", usage: "Very Low", savings: "$144/yr", lastUsed: "5 weeks ago", risk: "low" as const },
                ].map((sub, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-secondary/30 px-3 py-2.5">
                    <div className={`h-2 w-2 rounded-full ${sub.risk === "medium" ? "bg-[hsl(var(--sita-gold))]" : "bg-muted-foreground/40"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-foreground">{sub.name} — {sub.cost}</p>
                      <p className="text-[10px] text-muted-foreground">Usage: {sub.usage} · Last used {sub.lastUsed}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-[hsl(var(--trust-safe))]">Save {sub.savings}</span>
                  </div>
                ))}
              </div>
            </SitaCard>
          </div>

          {/* Receivables */}
          <div className="space-y-3">
            <SitaSectionHeader title="Expected Inflows" action={<button onClick={() => navigate("/money/receivables")} className="text-xs text-primary hover:underline">View all</button>} />
            <SitaCard className="p-4" lane="opportunity">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Invoice #1039 — Apex Corp</p>
                  <p className="text-xs text-muted-foreground">Expected Apr 5</p>
                </div>
                <p className="font-display text-sm font-bold text-trust-verified">$3,200</p>
              </div>
            </SitaCard>
            <SitaCard className="p-4" lane="opportunity">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Invoice #1040 — Lisa Thompson</p>
                  <p className="text-xs text-muted-foreground">Expected Apr 12</p>
                </div>
                <p className="font-display text-sm font-bold text-trust-verified">$4,200</p>
              </div>
            </SitaCard>
          </div>
        </div>

        {/* Column 3 — What Changed + Advisor + Boardroom */}
        <div className="space-y-6">
          <div className="space-y-3">
            <SitaSectionHeader title="What Changed Today" />
            <SitaCard hover={false} className="p-4">
              {changes.map((c, i) => <TimelineItem key={i} {...c} />)}
            </SitaCard>
          </div>

          <LiveAdvisorCard
            advisor="money"
            intent="cash_posture"
            context={{ total_balance: 58570, monthly_burn: 6200, safe_to_spend: 3180 }}
            demoName="Money Advisor"
            demoRole="Cash & Obligation Intelligence"
            demoConfidence="High"
            demoRecommendation="Cash position is stable. Office rent auto-pays tomorrow — confirmed. Consider canceling Zoom Pro before renewal in 3 days to save $192/yr. Personal checking is getting low — transfer $1,000 from savings."
            demoReasoning="Based on 4-account analysis, upcoming bills, and subscription usage patterns."
          />

          <div className="space-y-3">
            <SitaSectionHeader title="Recent Proof" />
            <ProofCard title="Rent payment scheduled" artifact="Auto-pay confirmed — $2,400 on Apr 1" time="2h ago" trust="verified" state="completed" />
            <ProofCard title="Invoice payment received" artifact="Stripe — $4,200 from Marcus Johnson" time="2h ago" trust="verified" state="verified" />
          </div>

          {/* Budget Automation */}
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
