import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { SectionSkeleton, KPISkeleton } from "@/components/sita/SectionSkeleton";
import { KPITile, OpportunityCard, RiskCard, ProofCard, TimelineItem } from "@/components/sita/SitaComponents";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { RevenuePipelineChart, RevenueOverTimeChart } from "@/components/sita/SitaCharts";
import { EmptyStateCTA } from "@/components/sita/EmptyStateCTA";
import { AmbientHeader, StaggerReveal, StaggerItem, MetricHighlight, GlassCard, ChartContainer } from "@/components/sita/PremiumPageComponents";
import { WhatMattersNow, WhatChangedFeed, PreparedActions, QuickActionBar } from "@/components/sita/domain-shared";
import type { MatterItem, ChangeEvent, PreparedAction } from "@/components/sita/domain-shared";
import { useNavigate } from "react-router-dom";
import { useLeads, useCustomers, useInvoices } from "@/hooks/use-sita-data";
import { useDataMode } from "@/contexts/DataModeContext";
import { useOSRuntime } from "@/lib/hooks/useOSRuntime";
import {
  Phone, Clock, AlertTriangle, DollarSign, Users, FileText, Sparkles, CheckCircle, Briefcase,
  Calendar, TrendingUp, ArrowRight, BarChart3, UserPlus, Receipt, Mail, Target, Zap,
  Activity, ArrowUpRight, ArrowDownRight, Flame, Shield, Eye
} from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useCRMSync } from "@/hooks/use-backend-actions";

const todayCallbacks = [
  { name: "Sarah Chen", time: "10:30 AM", reason: "Quote follow-up — $2,500 website redesign", stale: false },
  { name: "James Rodriguez", time: "2:00 PM", reason: "Onboarding check-in — started last week", stale: false },
  { name: "Emily Watson", time: "Overdue", reason: "No contact in 3 days — stale risk", stale: true },
];

const recentProof = [
  { title: "Follow-up sent to James Rodriguez", artifact: "Email delivered — 2 opens tracked", time: "1h ago", trust: "verified" as const, state: "completed" as const },
  { title: "Quote #1042 generated for Sarah Chen", artifact: "PDF created — $2,500", time: "3h ago", trust: "verified" as const, state: "approval-requested" as const },
];

const changes = [
  { icon: DollarSign, color: "text-chart-2", title: "Invoice #1038 paid — $4,200", subtitle: "Marcus Johnson via Stripe", time: "2h ago" },
  { icon: UserPlus, color: "text-primary", title: "New lead: Michael Park", subtitle: "Website form — web design inquiry", time: "4h ago" },
  { icon: AlertTriangle, color: "text-destructive", title: "Invoice #1035 now 7 days overdue", subtitle: "David Kim — $1,800 outstanding", time: "Today" },
  { icon: CheckCircle, color: "text-chart-2", title: "Callback completed: James Rodriguez", subtitle: "18 min call — discussed Q2 projects", time: "Yesterday" },
];

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

/* ── Revenue Leakage Panel ── */
const BusinessLeakagePanel = () => {
  const { engines } = useOSRuntime();
  const navigate = useNavigate();
  const leakageData = useMemo(() => {
    engines.revenue.detectLeakage({ type: "stale_lead", domain: "business", title: "Emily Watson — 3 days no contact", description: "$1,800 at risk", estimatedValue: 1800, currency: "USD", confidence: 0.78, source: "Pipeline scan", entityId: "lead-emily", relatedRecords: [{ type: "contact", id: "c-emily" }], suggestedAction: "Send follow-up", assignedAdvisor: "business-advisor" });
    engines.revenue.detectLeakage({ type: "cold_repeat_customer", domain: "business", title: "Apex Corp — quote expiring", description: "$3,200 quote, no response", estimatedValue: 3200, currency: "USD", confidence: 0.72, source: "Quote tracker", entityId: "cust-apex", relatedRecords: [{ type: "quote", id: "q-1039" }], suggestedAction: "Call contact", assignedAdvisor: "business-advisor" });
    return { rankings: engines.revenue.rankOpportunities().slice(0, 3), stats: engines.revenue.getStats() };
  }, [engines.revenue]);

  if (leakageData.rankings.length === 0) return null;
  return (
    <div className="space-y-2">
      {leakageData.rankings.map(r => {
        const signalMap = engines.revenue.getSignals();
        const matchedSignal = Array.from(signalMap.values()).find((s: unknown) => typeof s === "object" && s !== null && "id" in s && (s as Record<string, unknown>).id === r.opportunityId);
        const autoDecision = engines.revenue.shouldAutoRecover(matchedSignal as Parameters<typeof engines.revenue.shouldAutoRecover>[0]);
        return (
          <div key={r.opportunityId} className="flex items-center gap-3 rounded-xl bg-accent/5 border border-accent/10 px-3 py-2">
            <Zap className="h-3.5 w-3.5 text-accent shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">Rank #{r.rank} · Score {(r.score * 100).toFixed(0)}</p>
              <p className="text-[10px] text-muted-foreground">Val: {(r.factors.value * 100).toFixed(0)}% · Urg: {(r.factors.urgency * 100).toFixed(0)}%</p>
            </div>
            <SitaButton variant="accent" size="sm" className="text-[10px] shrink-0">
              {autoDecision?.auto ? "Auto-Recover" : "Review"}
            </SitaButton>
          </div>
        );
      })}
    </div>
  );
};

/* ── Conversion Funnel Mini ── */
const FunnelMini = () => {
  const stages = [
    { label: "Leads", count: 24, width: "100%", color: "bg-primary/20" },
    { label: "Contacted", count: 18, width: "75%", color: "bg-primary/35" },
    { label: "Qualified", count: 12, width: "50%", color: "bg-primary/55" },
    { label: "Proposal", count: 6, width: "25%", color: "bg-primary/75" },
    { label: "Won", count: 3, width: "12.5%", color: "bg-primary" },
  ];
  return (
    <div className="space-y-1.5">
      {stages.map(s => (
        <div key={s.label} className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-16 shrink-0">{s.label}</span>
          <div className="flex-1 h-5 rounded-md overflow-hidden bg-secondary/30">
            <motion.div
              className={`h-full rounded-md ${s.color} flex items-center justify-end pr-2`}
              initial={{ width: 0 }}
              animate={{ width: s.width }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span className="text-[10px] font-bold text-foreground">{s.count}</span>
            </motion.div>
          </div>
        </div>
      ))}
    </div>
  );
};

const BusinessOverview = () => {
  const navigate = useNavigate();
  const { isDemoMode } = useDataMode();
  const crmSync = useCRMSync();
  const crmHealth = crmSync.healthCheck.data as Record<string, unknown> | undefined;
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const { data: customers = [], isLoading: custLoading } = useCustomers();
  const { data: invoices = [], isLoading: invLoading } = useInvoices();

  const isLoading = leadsLoading || custLoading || invLoading;
  const hasLiveData = isDemoMode || leads.length > 0 || customers.length > 0 || invoices.length > 0;

  const businessMatters: MatterItem[] = useMemo(() => [
    { id: "bm1", title: "Emily Watson — 3 days no contact", subtitle: "Quote follow-up at risk · $1,800", urgency: "high" as const, action: "Call", onAction: () => navigate("/business/follow-through") },
    { id: "bm2", title: "Invoice #1035 now 7 days overdue", subtitle: "David Kim — $1,800 outstanding", urgency: "high" as const, action: "Review" },
    { id: "bm3", title: "Quote #1039 expiring tomorrow", subtitle: "Apex Corp — $3,200", urgency: "medium" as const, action: "Follow up" },
    { id: "bm4", title: "New lead: Michael Park", subtitle: "Website form — web design inquiry", urgency: "low" as const, action: "Respond" },
  ], [navigate]);

  const businessPrepared: PreparedAction[] = useMemo(() => [
    { id: "bp1", title: "Follow-up draft for Emily Watson", description: "Gentle re-touch referencing original quote discussion", type: "draft" as const, confidence: 0.88 },
    { id: "bp2", title: "Invoice reminder for David Kim", description: "Payment reminder with 7-day overdue notice", type: "reminder" as const, confidence: 0.92 },
    { id: "bp3", title: "Re-engage Apex Corp", description: "Quote expiry notice with discount incentive", type: "suggestion" as const, confidence: 0.74 },
  ], []);

  const businessChanges: ChangeEvent[] = useMemo(() => [
    { id: "bc1", icon: <DollarSign className="h-3 w-3 text-chart-2" />, title: "Invoice #1038 paid — $4,200", subtitle: "Marcus Johnson via Stripe", time: "2h ago" },
    { id: "bc2", icon: <UserPlus className="h-3 w-3 text-primary" />, title: "New lead: Michael Park", subtitle: "Website form — web design inquiry", time: "4h ago" },
    { id: "bc3", icon: <AlertTriangle className="h-3 w-3 text-destructive" />, title: "Invoice #1035 now 7 days overdue", subtitle: "David Kim — $1,800 outstanding", time: "Today" },
    { id: "bc4", icon: <CheckCircle className="h-3 w-3 text-chart-2" />, title: "Callback completed: James Rodriguez", subtitle: "18 min call — discussed Q2 projects", time: "Yesterday" },
  ], []);

  if (isLoading) {

  const businessPrepared: PreparedAction[] = useMemo(() => [
    { id: "bp1", title: "Follow-up draft for Emily Watson", description: "Gentle re-touch referencing original quote discussion", type: "draft", confidence: 0.88 },
    { id: "bp2", title: "Invoice reminder for David Kim", description: "Payment reminder with 7-day overdue notice", type: "reminder", confidence: 0.92 },
    { id: "bp3", title: "Re-engage Apex Corp", description: "Quote expiry notice with discount incentive", type: "suggestion", confidence: 0.74 },
  ], []);

  const businessChanges: ChangeEvent[] = useMemo(() => [
    { id: "bc1", icon: <DollarSign className="h-3 w-3 text-chart-2" />, title: "Invoice #1038 paid — $4,200", subtitle: "Marcus Johnson via Stripe", time: "2h ago" },
    { id: "bc2", icon: <UserPlus className="h-3 w-3 text-primary" />, title: "New lead: Michael Park", subtitle: "Website form — web design inquiry", time: "4h ago" },
    { id: "bc3", icon: <AlertTriangle className="h-3 w-3 text-destructive" />, title: "Invoice #1035 now 7 days overdue", subtitle: "David Kim — $1,800 outstanding", time: "Today" },
    { id: "bc4", icon: <CheckCircle className="h-3 w-3 text-chart-2" />, title: "Callback completed: James Rodriguez", subtitle: "18 min call — discussed Q2 projects", time: "Yesterday" },
  ], []);

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <DemoModeBadge />
      <AmbientHeader
        title="Business Center"
        subtitle="Revenue intelligence, pipeline, and execution command"
        icon={<Briefcase className="h-5 w-5 text-primary" />}
        accentColor="hsl(var(--primary))"
        actions={
          <div className="flex items-center gap-3">
            {crmHealth && (
              <span className="text-[10px] text-muted-foreground">
                CRM: {String((crmHealth as Record<string, Record<string, unknown>>)?.leads?.count ?? 0)} leads
              </span>
            )}
            <SitaButton variant="primary" onClick={() => navigate("/business/leads")}><UserPlus className="h-4 w-4" /> New Lead</SitaButton>
          </div>
        }
      />

      {/* ═══ WHAT MATTERS NOW ═══ */}
      <WhatMattersNow items={businessMatters} domain="business" />

      {/* ═══ PREPARED ACTIONS ═══ */}
      <PreparedActions actions={businessPrepared} />

      {/* ═══ QUICK ACTIONS ═══ */}
      <QuickActionBar
        actions={[
          { label: "New Lead", icon: UserPlus, onClick: () => navigate("/business/leads"), variant: "accent" },
          { label: "Follow-Through", icon: Phone, onClick: () => navigate("/business/follow-through") },
          { label: "Create Quote", icon: FileText, onClick: () => navigate("/business/quotes") },
          { label: "Send Invoice", icon: Receipt, onClick: () => navigate("/business/invoices") },
        ]}
      />

      {/* ═══ WHAT CHANGED ═══ */}
      <WhatChangedFeed events={businessChanges} />

      {/* ═══ BENTO GRID ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-min">

        {/* Hero Metric — 2×1 */}
        <BentoCell span="col-span-1 md:col-span-2">
          <GlassCard glow="primary" intensity="medium" className="p-5 h-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Pipeline Value</p>
                <p className="font-display text-4xl font-bold text-foreground tracking-tight">$42,800</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <ArrowUpRight className="h-3.5 w-3.5 text-chart-2" />
                  <span className="text-xs font-semibold text-chart-2">+12% this month</span>
                </div>
              </div>
              <div className="rounded-2xl bg-primary/10 p-3">
                <Activity className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border/20">
              {[
                { label: "Won this month", value: "$18.2K", icon: CheckCircle, color: "text-chart-2" },
                { label: "In negotiation", value: "$14.6K", icon: Target, color: "text-primary" },
                { label: "At risk", value: "$5.4K", icon: AlertTriangle, color: "text-destructive" },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex items-center gap-1 mb-1">
                    <m.icon className={`h-3 w-3 ${m.color}`} />
                    <span className="text-[10px] text-muted-foreground">{m.label}</span>
                  </div>
                  <p className="font-display text-lg font-bold text-foreground">{m.value}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </BentoCell>

        {/* Conversion Rate */}
        <BentoCell>
          <GlassCard glow="emerald" intensity="subtle" className="p-4 h-full">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-muted-foreground">Conversion Rate</p>
              <Target className="h-3.5 w-3.5 text-chart-2" />
            </div>
            <p className="font-display text-3xl font-bold text-foreground">34%</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-chart-2" />
              <span className="text-[10px] text-chart-2 font-medium">+4pts vs last month</span>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-secondary/40 overflow-hidden">
              <motion.div className="h-full rounded-full bg-chart-2" initial={{ width: 0 }} animate={{ width: "34%" }} transition={{ duration: 1 }} />
            </div>
          </GlassCard>
        </BentoCell>

        {/* Recovered Revenue */}
        <BentoCell>
          <GlassCard glow="gold" intensity="subtle" className="p-4 h-full">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-muted-foreground">Recovered Revenue</p>
              <Zap className="h-3.5 w-3.5 text-accent" />
            </div>
            <p className="font-display text-3xl font-bold text-foreground">$4,200</p>
            <p className="text-[10px] text-muted-foreground mt-1">This week via autopilot</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex -space-x-1">
                {[1,2,3].map(i => (
                  <div key={i} className="h-5 w-5 rounded-full bg-accent/20 border-2 border-card flex items-center justify-center">
                    <span className="text-[8px] text-accent font-bold">{i}</span>
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">3 auto-recovered</span>
            </div>
          </GlassCard>
        </BentoCell>

        {/* Conversion Funnel — 1×2 tall */}
        <BentoCell span="col-span-1" row="row-span-2">
          <GlassCard glow="primary" intensity="subtle" className="p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-foreground">Pipeline Funnel</p>
                <p className="text-[10px] text-muted-foreground">Live conversion stages</p>
              </div>
              <Eye className="h-4 w-4 text-primary" />
            </div>
            <FunnelMini />
            <button onClick={() => navigate("/business/opportunities")} className="mt-4 text-[10px] text-primary hover:underline flex items-center gap-1">
              View pipeline <ArrowRight className="h-3 w-3" />
            </button>
          </GlassCard>
        </BentoCell>

        {/* Revenue Over Time Chart — 2×1 */}
        <BentoCell span="col-span-1 md:col-span-2">
          <GlassCard glow="none" className="p-4 h-full">
            <ChartContainer title="Revenue Over Time">
              <RevenueOverTimeChart />
            </ChartContainer>
          </GlassCard>
        </BentoCell>

        {/* Quick Stats */}
        <BentoCell>
          <GlassCard glow="none" className="p-4 h-full">
            <p className="text-xs font-semibold text-foreground mb-3">Quick Stats</p>
            <div className="space-y-3">
              {[
                { label: "New Leads", value: "5", sub: "2 today", color: "text-primary" },
                { label: "Stale Leads", value: "3", sub: "Needs attention", color: "text-destructive" },
                { label: "Callbacks", value: "3", sub: "1 overdue", color: "text-accent" },
                { label: "Active Quotes", value: "4", sub: "$11.2K", color: "text-chart-2" },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-muted-foreground">{s.label}</p>
                    <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                  </div>
                  <p className={`font-display text-lg font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </BentoCell>

        {/* Revenue Leakage — 2×1 */}
        <BentoCell span="col-span-1 md:col-span-2">
          <GlassCard glow="rose" intensity="subtle" className="p-4 h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-destructive" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Revenue Leakage Signals</p>
                  <p className="text-[10px] text-muted-foreground">From Revenue Intelligence Engine</p>
                </div>
              </div>
              <button onClick={() => navigate("/recovered-value")} className="text-[10px] text-primary hover:underline">Full ledger →</button>
            </div>
            <BusinessLeakagePanel />
          </GlassCard>
        </BentoCell>

        {/* Callbacks — 1×1 */}
        <BentoCell>
          <GlassCard glow="none" className="p-4 h-full">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-foreground">Callbacks Due</p>
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              {todayCallbacks.map((cb, i) => (
                <div key={i} className={`flex items-center gap-2 rounded-lg px-2.5 py-2 ${cb.stale ? "bg-destructive/5 border border-destructive/10" : "bg-secondary/30"}`}>
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                    {cb.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-foreground truncate">{cb.name}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{cb.reason}</p>
                  </div>
                  <span className={`text-[10px] font-semibold shrink-0 ${cb.stale ? "text-destructive" : "text-muted-foreground"}`}>{cb.time}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </BentoCell>

        {/* Revenue Risks — 1×1 */}
        <BentoCell>
          <GlassCard glow="rose" intensity="subtle" className="p-4 h-full">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-foreground">Revenue Risks</p>
              <Shield className="h-3.5 w-3.5 text-destructive" />
            </div>
            <div className="space-y-2">
              {[
                { title: "Invoice #1035 — 7d overdue", amount: "$1,800", severity: "high" },
                { title: "Quote #1039 expiring", amount: "$3,200", severity: "medium" },
                { title: "No-show: Michael Park", amount: "—", severity: "medium" },
              ].map((r, i) => (
                <div key={i} className={`rounded-lg px-2.5 py-2 border ${r.severity === "high" ? "border-destructive/20 bg-destructive/5" : "border-border bg-secondary/20"}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium text-foreground">{r.title}</p>
                    <span className="text-[10px] font-bold text-foreground">{r.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </BentoCell>

        {/* Pipeline Chart — 2×1 */}
        <BentoCell span="col-span-1 md:col-span-2">
          <GlassCard glow="none" className="p-4 h-full">
            <ChartContainer title="Revenue Pipeline">
              <RevenuePipelineChart />
            </ChartContainer>
          </GlassCard>
        </BentoCell>

        {/* What Changed — 1×1 */}
        <BentoCell>
          <GlassCard glow="none" className="p-4 h-full max-h-80 overflow-y-auto">
            <p className="text-xs font-semibold text-foreground mb-3">What Changed Today</p>
            <div className="space-y-0">
              {changes.map((c, i) => <TimelineItem key={i} {...c} />)}
            </div>
          </GlassCard>
        </BentoCell>

        {/* AI Advisor — 1×1 */}
        <BentoCell>
          <LiveAdvisorCard
            advisor="business"
            intent="pipeline_analysis"
            demoName="Business Advisor"
            demoRole="Revenue Intelligence"
            demoConfidence="High"
            demoRecommendation="Focus today: Call Emily Watson before she goes cold, then follow up on Quote #1042. $5,400 recoverable revenue if you act on overdue invoices this week."
            demoReasoning="3 stale leads, 2 overdue invoices, and 1 expiring quote."
          />
        </BentoCell>

        {/* Opportunities — 2×1 */}
        <BentoCell span="col-span-1 md:col-span-2">
          <GlassCard glow="emerald" intensity="subtle" className="p-4 h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-chart-2" />
                <p className="text-xs font-semibold text-foreground">Opportunities Detected</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <OpportunityCard title="Re-engage Emily Watson" description="No follow-up in 3 days — estimated $1,800 at risk." action="Draft Follow-up" />
              <OpportunityCard title="Upsell Marcus Johnson" description="Payment history strong — propose monthly retainer." action="Create Proposal" />
            </div>
          </GlassCard>
        </BentoCell>

        {/* Recent Proof — 1×1 */}
        <BentoCell>
          <GlassCard glow="none" className="p-4 h-full">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-foreground">Recent Proof</p>
              <button onClick={() => navigate("/business/proof")} className="text-[10px] text-primary hover:underline">All →</button>
            </div>
            <div className="space-y-2">
              {recentProof.map((p, i) => <ProofCard key={i} {...p} />)}
            </div>
          </GlassCard>
        </BentoCell>

        {/* Boardroom CTA — 1×1 */}
        <BentoCell>
          <GlassCard glow="primary" intensity="medium" className="p-5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-primary" />
                <SitaCardTitle>Business Boardroom</SitaCardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Weekly review ready — 3 priorities, 2 risks, 4 opportunities</p>
            </div>
            <SitaButton variant="accent" size="sm" className="mt-4" onClick={() => navigate("/business/boardroom")}>
              Open Review <ArrowRight className="h-3 w-3" />
            </SitaButton>
          </GlassCard>
        </BentoCell>
      </div>
    </motion.div>
  );
};

export default BusinessOverview;
