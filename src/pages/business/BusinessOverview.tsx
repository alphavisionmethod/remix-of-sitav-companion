import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, OpportunityCard, RiskCard, ProofCard, TimelineItem } from "@/components/sita/SitaComponents";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { StateBadge } from "@/components/sita/StateBadge";
import { RevenuePipelineChart, RevenueOverTimeChart } from "@/components/sita/SitaCharts";
import { EmptyStateCTA } from "@/components/sita/EmptyStateCTA";
import { useNavigate } from "react-router-dom";
import { useLeads, useCustomers, useInvoices } from "@/hooks/use-sita-data";
import { useDataMode } from "@/contexts/DataModeContext";
import { useOSRuntime } from "@/lib/hooks/useOSRuntime";
import {
  Phone, Clock, AlertTriangle, DollarSign, Users, FileText, Sparkles, CheckCircle, Briefcase,
  Calendar, TrendingUp, ArrowRight, BarChart3, UserPlus, Receipt, Mail, Target, Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";

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
  { icon: DollarSign, color: "text-trust-verified", title: "Invoice #1038 paid — $4,200", subtitle: "Marcus Johnson via Stripe", time: "2h ago" },
  { icon: UserPlus, color: "text-primary", title: "New lead: Michael Park", subtitle: "Website form — web design inquiry", time: "4h ago" },
  { icon: AlertTriangle, color: "text-urgency-high", title: "Invoice #1035 now 7 days overdue", subtitle: "David Kim — $1,800 outstanding", time: "Today" },
  { icon: CheckCircle, color: "text-trust-verified", title: "Callback completed: James Rodriguez", subtitle: "18 min call — discussed Q2 projects", time: "Yesterday" },
];

// ── Revenue Leakage Panel (wired to OS runtime) ──────────────
const BusinessLeakagePanel = () => {
  const { engines } = useOSRuntime();
  const navigate = useNavigate();

  const leakageData = useMemo(() => {
    // Seed signals from the revenue engine
    engines.revenue.detectLeakage({ type: "stale_lead", domain: "business", title: "Emily Watson — 3 days no contact", description: "$1,800 at risk", estimatedValue: 1800, currency: "USD", confidence: 0.78, source: "Pipeline scan", entityId: "lead-emily", relatedRecords: [{ type: "contact", id: "c-emily" }], suggestedAction: "Send follow-up", assignedAdvisor: "business-advisor" });
    engines.revenue.detectLeakage({ type: "cold_repeat_customer", domain: "business", title: "Apex Corp — quote expiring", description: "$3,200 quote, no response", estimatedValue: 3200, currency: "USD", confidence: 0.72, source: "Quote tracker", entityId: "cust-apex", relatedRecords: [{ type: "quote", id: "q-1039" }], suggestedAction: "Call contact", assignedAdvisor: "business-advisor" });

    return {
      rankings: engines.revenue.rankOpportunities().slice(0, 3),
      stats: engines.revenue.getStats(),
    };
  }, [engines.revenue]);

  if (leakageData.rankings.length === 0) return null;

  return (
    <div className="space-y-3">
      <SitaSectionHeader title="Revenue Leakage Signals" subtitle="From Revenue Intelligence Engine" action={<button onClick={() => navigate("/recovered-value")} className="text-xs text-primary hover:underline">Full ledger →</button>} />
      {leakageData.rankings.map(r => {
        const autoDecision = engines.revenue.shouldAutoRecover(Array.from((engines.revenue as any).signals?.values?.() || []).find((s: any) => s.id === r.opportunityId) as any);
        return (
          <SitaCard key={r.opportunityId} lane="action" className="p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 shrink-0">
                <Zap className="h-3.5 w-3.5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">Rank #{r.rank} · Score {(r.score * 100).toFixed(0)}</p>
                <p className="text-[10px] text-muted-foreground">Val: {(r.factors.value * 100).toFixed(0)}% · Urg: {(r.factors.urgency * 100).toFixed(0)}% · Conf: {(r.factors.probability * 100).toFixed(0)}%</p>
              </div>
              <SitaButton variant="accent" size="sm" className="text-[10px] shrink-0">
                {autoDecision?.auto ? "Auto-Recover" : "Review"}
              </SitaButton>
            </div>
          </SitaCard>
        );
      })}
    </div>
  );
};

const BusinessOverview = () => {
  const navigate = useNavigate();
  const { isDemoMode } = useDataMode();
  const { data: leads = [] } = useLeads();
  const { data: customers = [] } = useCustomers();
  const { data: invoices = [] } = useInvoices();

  const hasLiveData = isDemoMode || leads.length > 0 || customers.length > 0 || invoices.length > 0;

  if (!hasLiveData) {
    return (
      <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <SitaPageHeader title="Business Center" subtitle="Your operating overview — leads, revenue, and execution" />
        <EmptyStateCTA
          icon={Briefcase}
          title="Welcome to Business Center"
          description="Start by adding your first lead or customer. Your AI advisor will help you track opportunities and close deals."
          actions={[
            { label: "Add First Lead", icon: Target, to: "/business/leads" },
            { label: "Import Customers", icon: Users, to: "/business/customers", variant: "secondary" },
            { label: "Create Invoice", icon: Receipt, to: "/business/invoices", variant: "secondary" },
          ]}
          tip="Your AI business advisor activates once you have data"
        />
      </motion.div>
    );
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SitaPageHeader
        title="Business Center"
        subtitle="Your operating overview — leads, revenue, and execution"
        actions={<SitaButton variant="primary" onClick={() => navigate("/business/leads")}><UserPlus className="h-4 w-4" /> New Lead</SitaButton>}
      />

      {/* KPI Strip */}
      <motion.div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }} initial="hidden" animate="show">
        {[
          { label: "New Leads", value: "5", trend: "up" as const, sub: "2 today" },
          { label: "Stale Leads", value: "3", sub: "Needs attention" },
          { label: "Callbacks Due", value: "3", sub: "1 overdue" },
          { label: "Active Quotes", value: "4", sub: "$11,200 total" },
          { label: "Overdue Invoices", value: "2", sub: "$5,400 at risk" },
          { label: "Recovered This Week", value: "$4,200", trend: "up" as const },
          { label: "Pipeline Value", value: "$42K", trend: "up" as const },
          { label: "Conversion Rate", value: "34%", trend: "up" as const, sub: "+4pts" },
        ].map((kpi, i) => (
          <motion.div key={i} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
            <KPITile {...kpi} />
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenuePipelineChart />
        <RevenueOverTimeChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Column 1 — Priorities & Callbacks */}
        <div className="space-y-6">
          <div className="space-y-3">
            <SitaSectionHeader title="Callbacks Due Today" subtitle={`${todayCallbacks.length} scheduled`} action={<button onClick={() => navigate("/business/leads")} className="text-xs text-primary hover:underline">View all</button>} />
            {todayCallbacks.map((cb, i) => (
              <SitaCard key={i} lane={cb.stale ? "action" : undefined} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/8 font-display text-xs font-semibold text-primary">
                      {cb.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{cb.name}</p>
                      <p className="text-xs text-muted-foreground">{cb.reason}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-semibold ${cb.stale ? "text-urgency-high" : "text-foreground"}`}>{cb.time}</span>
                    <div className="mt-1 flex gap-1">
                      <SitaButton variant="accent" size="sm"><Phone className="h-3 w-3" /></SitaButton>
                      <SitaButton variant="ghost" size="sm"><Clock className="h-3 w-3" /></SitaButton>
                    </div>
                  </div>
                </div>
              </SitaCard>
            ))}
          </div>

          {/* Revenue Leakage Intelligence — wired to OS runtime */}
          <BusinessLeakagePanel />

          {/* Opportunities */}
          <div className="space-y-3">
            <SitaSectionHeader title="Opportunities Detected" />
            <OpportunityCard title="Re-engage Emily Watson" description="No follow-up in 3 days — estimated $1,800 at risk. Similar leads convert at 18% after re-engagement." action="Draft Follow-up" />
            <OpportunityCard title="Upsell Marcus Johnson" description="Payment history strong — propose monthly retainer to lock recurring revenue" action="Create Proposal" />
          </div>
        </div>

        {/* Column 2 — What Changed + Risks */}
        <div className="space-y-6">
          <div className="space-y-3">
            <SitaSectionHeader title="What Changed Today" />
            <SitaCard hover={false} className="p-4">
              {changes.map((c, i) => <TimelineItem key={i} {...c} />)}
            </SitaCard>
          </div>

          <div className="space-y-3">
            <SitaSectionHeader title="Revenue Risks" />
            <RiskCard title="Invoice #1035 — 7 days overdue" description="$1,800 — David Kim. 2 reminders sent, no response." severity="high" />
            <RiskCard title="Quote #1039 expiring tomorrow" description="$3,200 — Apex Corp. No response after send." severity="medium" />
            <RiskCard title="No-show risk: Michael Park" description="Consultation tomorrow — no confirmation received" severity="medium" />
          </div>
        </div>

        {/* Column 3 — Proof + Advisor + Boardroom */}
        <div className="space-y-6">
          <div className="space-y-3">
            <SitaSectionHeader title="Recent Proof" action={<button onClick={() => navigate("/business/proof")} className="text-xs text-primary hover:underline">View all</button>} />
            {recentProof.map((p, i) => <ProofCard key={i} {...p} />)}
          </div>

          <LiveAdvisorCard
            advisor="business"
            intent="pipeline_analysis"
            demoName="Business Advisor"
            demoRole="Revenue Intelligence"
            demoConfidence="High"
            demoRecommendation="Focus today: Call Emily Watson before she goes cold, then follow up on Quote #1042. You have $5,400 recoverable revenue if you act on overdue invoices this week."
            demoReasoning="3 stale leads, 2 overdue invoices, and 1 expiring quote detected in your pipeline."
          />

          <SitaCard hover={false} className="gradient-sita-subtle p-5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-primary" />
              <SitaCardTitle>Business Boardroom</SitaCardTitle>
            </div>
            <p className="text-xs text-muted-foreground">Weekly review ready — 3 priorities, 2 risks, 4 opportunities</p>
            <SitaButton variant="accent" size="sm" className="mt-3" onClick={() => navigate("/business/boardroom")}>
              Open Review <ArrowRight className="h-3 w-3" />
            </SitaButton>
          </SitaCard>
        </div>
      </div>
    </motion.div>
  );
};

export default BusinessOverview;
