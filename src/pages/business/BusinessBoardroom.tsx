import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton, SitaPageHeader } from "@/components/sita/SitaCard";
import { KPITile, OpportunityCard, RiskCard, ProofCard, SitaTabs } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { StateBadge } from "@/components/sita/StateBadge";
import { useState, useMemo } from "react";
import { BarChart3, CheckCircle, AlertTriangle, Sparkles, Clock, DollarSign, Users, TrendingUp, ArrowRight, Calendar, FileText, Target } from "lucide-react";
import { motion } from "framer-motion";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useLeads, useCustomers, useInvoices, useOpportunities } from "@/hooks/use-sita-data";


interface BusinessBoardroomRow {
  amount?: number;
  company?: unknown;
  created_at?: string;
  customer_name?: unknown;
  due_date?: string;
  name?: string;
  source?: unknown;
  stage?: unknown;
  status?: string;
  title?: string;
  value?: number;
}

const BusinessBoardroom = () => {
  const { isDemoMode } = useDataMode();
  const [mode, setMode] = useState("weekly");
  const { data: leads = [] } = useLeads();
  const { data: customers = [] } = useCustomers();
  const { data: invoices = [] } = useInvoices();
  const { data: opportunities = [] } = useOpportunities();

  // Derive KPIs from live data
  const kpis = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const weekStr = weekAgo.toISOString();

    const recentInvoices = invoices.filter((i: BusinessBoardroomRow) => i.created_at >= weekStr);
    const paidThisWeek = recentInvoices.filter((i: BusinessBoardroomRow) => i.status === "paid");
    const revenue = paidThisWeek.reduce((sum: number, i: any) => sum + (i.amount || 0), 0);
    const newLeads = leads.filter((l: BusinessBoardroomRow) => l.created_at >= weekStr).length;
    const overdue = invoices.filter((i: BusinessBoardroomRow) => i.status === "overdue");
    const atRisk = overdue.reduce((sum: number, i: any) => sum + (i.amount || 0), 0);

    return { revenue, newLeads, atRisk, overdueInvoices: overdue };
  }, [leads, invoices]);

  // Derive priorities from live data
  const priorities = useMemo(() => {
    const items: Array<{ text: string; urgency: string }> = [];

    // Overdue invoices are critical
    kpis.overdueInvoices.slice(0, 2).forEach((inv: BusinessBoardroomRow) => {
      items.push({ text: `Collect overdue Invoice — ${inv.customer_name || "Customer"} ($${(inv.amount || 0).toLocaleString()})`, urgency: "critical" });
    });

    // Hot leads
    leads.filter((l: BusinessBoardroomRow) => l.status === "new" || l.status === "contacted").slice(0, 2).forEach((l: BusinessBoardroomRow) => {
      items.push({ text: `Follow up with ${l.name || l.company || "Lead"} — ${l.source || "Inbound"}`, urgency: "high" });
    });

    // Open opportunities
    opportunities.filter((o: BusinessBoardroomRow) => o.stage === "proposal" || o.stage === "negotiation").slice(0, 2).forEach((o: BusinessBoardroomRow) => {
      items.push({ text: `Close deal: ${o.title || o.customer_name || "Opportunity"} — $${(o.value || 0).toLocaleString()}`, urgency: "medium" });
    });

    return items.length > 0 ? items.slice(0, 5) : [
      { text: "No active priorities — add leads or invoices to get started", urgency: "low" },
    ];
  }, [leads, opportunities, kpis.overdueInvoices]);

  // Derive risks
  const risks = useMemo(() => {
    const items: Array<{ title: string; description: string; severity: "high" | "medium" | "low" }> = [];

    kpis.overdueInvoices.forEach((inv: BusinessBoardroomRow) => {
      const days = Math.ceil((Date.now() - new Date(inv.due_date || inv.created_at).getTime()) / 86400000);
      items.push({
        title: `Invoice overdue — ${inv.customer_name || "Customer"}`,
        description: `$${(inv.amount || 0).toLocaleString()} — ${days} days overdue`,
        severity: days > 30 ? "high" : "medium",
      });
    });

    leads.filter((l: BusinessBoardroomRow) => l.status === "cold" || l.status === "stale").slice(0, 2).forEach((l: BusinessBoardroomRow) => {
      items.push({
        title: `Lead going cold: ${l.name || l.company || "Lead"}`,
        description: `${l.source || "Unknown source"} — needs re-engagement`,
        severity: "medium",
      });
    });

    return items.slice(0, 3);
  }, [leads, kpis.overdueInvoices]);

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <SitaPageHeader
        title="Business Boardroom"
        subtitle="Executive review — insights, risks, and recommended actions"
        actions={<SitaButton variant="accent" size="sm"><Calendar className="h-3.5 w-3.5" /> Schedule Review</SitaButton>}
      />

      <SitaTabs
        tabs={[
          { key: "weekly", label: "Weekly Review" },
          { key: "pipeline", label: "Pipeline Review" },
          { key: "collections", label: "Collections Review" },
          { key: "monthly", label: "Monthly Review" },
        ]}
        active={mode}
        onChange={setMode}
      />

      {/* Hero Summary */}
      <SitaCard hover={false} className="gradient-sita-subtle p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="rounded-xl gradient-sita p-2.5"><BarChart3 className="h-5 w-5 text-primary-foreground" /></div>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Business Review — {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</h2>
            <p className="text-xs text-muted-foreground">Generated now · Based on all business activity</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Revenue This Week</p><p className="mt-1 font-display text-2xl font-bold text-trust-verified">${kpis.revenue.toLocaleString()}</p></div>
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">New Leads</p><p className="mt-1 font-display text-2xl font-bold text-foreground">{kpis.newLeads}</p></div>
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">At Risk Revenue</p><p className="mt-1 font-display text-2xl font-bold text-urgency-high">${kpis.atRisk.toLocaleString()}</p></div>
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Active Opportunities</p><p className="mt-1 font-display text-2xl font-bold text-foreground">{opportunities.length}</p></div>
        </div>
      </SitaCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Priorities */}
        <SitaCard hover={false}>
          <SitaCardTitle sub="Top items for this week">Priorities</SitaCardTitle>
          <div className="mt-4 space-y-2.5">
            {priorities.map((p, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-secondary/30 p-3.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full gradient-sita font-display text-xs font-bold text-primary-foreground shrink-0">{i + 1}</span>
                <p className="text-sm text-foreground flex-1">{p.text}</p>
                <span className={`text-[10px] font-semibold shrink-0 ${p.urgency === "critical" ? "text-urgency-critical" : p.urgency === "high" ? "text-urgency-high" : "text-muted-foreground"}`}>{p.urgency}</span>
              </div>
            ))}
          </div>
        </SitaCard>

        {/* Risks */}
        <div className="space-y-4">
          <SitaSectionHeader title="Risks & Unresolved" />
          {risks.length > 0 ? risks.map((r, i) => (
            <RiskCard key={i} title={r.title} description={r.description} severity={r.severity} />
          )) : (
            <SitaCard hover={false} className="p-4 text-center">
              <CheckCircle className="h-6 w-6 text-trust-verified mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No active risks</p>
            </SitaCard>
          )}
        </div>

        {/* Opportunities */}
        <div className="space-y-4">
          <SitaSectionHeader title="Opportunities" />
          {opportunities.slice(0, 3).map((opp: any, i: number) => (
            <OpportunityCard key={i} title={opp.title || opp.customer_name || "Opportunity"} description={`$${(opp.value || 0).toLocaleString()} — Stage: ${opp.stage || "Discovery"}`} action="View Details" />
          ))}
          {opportunities.length === 0 && (
            <SitaCard hover={false} className="p-4 text-center">
              <Target className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No active opportunities</p>
            </SitaCard>
          )}
        </div>

        {/* Proof Summary */}
        <div className="space-y-4">
          <SitaSectionHeader title="Proof & Execution Summary" />
          <div className="grid gap-3 sm:grid-cols-2">
            <KPITile label="Active Leads" value={leads.length} icon={Users} sub="All sources" className="text-sm" />
            <KPITile label="Customers" value={customers.length} icon={CheckCircle} sub="Total" className="text-sm" />
            <KPITile label="Invoices" value={invoices.length} icon={FileText} sub="All statuses" className="text-sm" />
            <KPITile label="Pipeline Value" value={`$${opportunities.reduce((s: number, o: any) => s + (o.value || 0), 0).toLocaleString()}`} icon={TrendingUp} sub="Total" className="text-sm" />
          </div>
        </div>
      </div>

      <LiveAdvisorCard
        advisor="business"
        intent="executive_briefing"
        demoName="Executive Advisor"
        demoRole="Strategic Intelligence"
        demoConfidence="High"
        demoRecommendation={kpis.atRisk > 0
          ? `Priority: address $${kpis.atRisk.toLocaleString()} in at-risk revenue from ${kpis.overdueInvoices.length} overdue invoice(s). ${kpis.newLeads > 0 ? `${kpis.newLeads} new leads need follow-up.` : ""}`
          : `Business is healthy. ${kpis.newLeads} new leads this week, $${kpis.revenue.toLocaleString()} collected.`}
        demoReasoning="Based on live pipeline, invoice, and lead data from your business operations."
      />
    </motion.div>
  );
};

const BusinessBoardroomWithBoundary = () => (
  <GlobalErrorBoundary>
    <BusinessBoardroom />
  </GlobalErrorBoundary>
);

export default BusinessBoardroomWithBoundary;
