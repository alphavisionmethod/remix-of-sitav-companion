// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Boardroom (Deep Review Environment)
// ═══════════════════════════════════════════════════════════════

import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, RiskCard, OpportunityCard, SitaTabs } from "@/components/sita/SitaComponents";
import { SurfaceTrustStrip } from "@/components/sita/SurfaceTrustStrip";
import { DomainAdvisorCard } from "@/components/advisors/DomainAdvisorCard";
import { ListStagger, ListStaggerItem } from "@/components/sita/motion/AppTransitions";
import { useState, useMemo } from "react";
import { BarChart3, CheckCircle, AlertTriangle, Users, TrendingUp, Calendar, FileText, Target, ArrowRight, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useLeads, useCustomers, useInvoices, useOpportunities } from "@/hooks/use-sita-data";
import { AdvisorCouncilShell, type AdvisorConfig } from "@/components/advisors/AdvisorCouncilShell";

const businessAdvisors: AdvisorConfig[] = [
  { id: "pipeline", name: "Pipeline Advisor", role: "Deal Flow & Velocity", domain: "business", confidence: 84, status: "active", advisorId: "pipeline", mission: "Optimize deal pipeline velocity", specialAbility: "Weighted pipeline forecasting" },
  { id: "customer-health", name: "Customer Health Advisor", role: "Retention & Expansion", domain: "business", confidence: 87, status: "active", advisorId: "customer-health", mission: "Monitor customer satisfaction", specialAbility: "Churn early warning" },
  { id: "revenue", name: "Revenue Advisor", role: "Collections & Growth", domain: "business", confidence: 82, status: "active", advisorId: "revenue", mission: "Maximize revenue collection", specialAbility: "Invoice aging analysis" },
  { id: "strategy", name: "Strategy Advisor", role: "Long-term Planning", domain: "boardroom", confidence: 76, status: "active", advisorId: "strategy", mission: "Strategic resource allocation", specialAbility: "MECE framework analysis" },
];

const BusinessBoardroom = () => {
  const { isDemoMode } = useDataMode();
  const [mode, setMode] = useState("weekly");
  const { data: leads = [] } = useLeads();
  const { data: customers = [] } = useCustomers();
  const { data: invoices = [] } = useInvoices();
  const { data: opportunities = [] } = useOpportunities();

  const kpis = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const weekStr = weekAgo.toISOString();
    const paidThisWeek = invoices.filter((i: Record<string, any>) => i.created_at >= weekStr && i.status === "paid");
    const revenue = paidThisWeek.reduce((sum: number, i: Record<string, any>) => sum + (i.amount || 0), 0);
    const newLeads = leads.filter((l: Record<string, any>) => l.created_at >= weekStr).length;
    const overdue = invoices.filter((i: Record<string, any>) => i.status === "overdue");
    const atRisk = overdue.reduce((sum: number, i: Record<string, any>) => sum + (i.amount || 0), 0);
    return { revenue, newLeads, atRisk, overdueInvoices: overdue };
  }, [leads, invoices]);

  const priorities = useMemo(() => {
    const items: Array<{ text: string; urgency: string }> = [];
    kpis.overdueInvoices.slice(0, 2).forEach((inv: Record<string, any>) => {
      items.push({ text: `Collect overdue — ${inv.customer_name || "Customer"} ($${(inv.amount || 0).toLocaleString()})`, urgency: "critical" });
    });
    leads.filter((l: Record<string, any>) => l.status === "new" || l.status === "contacted").slice(0, 2).forEach((l: Record<string, any>) => {
      items.push({ text: `Follow up: ${l.name || l.company || "Lead"} — ${l.source || "Inbound"}`, urgency: "high" });
    });
    opportunities.filter((o: Record<string, any>) => o.stage === "proposal" || o.stage === "negotiation").slice(0, 2).forEach((o: Record<string, any>) => {
      items.push({ text: `Close: ${o.title || o.customer_name || "Opportunity"} — $${(o.value || 0).toLocaleString()}`, urgency: "medium" });
    });
    return items.length > 0 ? items.slice(0, 5) : [{ text: "No active priorities — add leads or invoices to start", urgency: "low" }];
  }, [leads, opportunities, kpis.overdueInvoices]);

  const risks = useMemo(() => {
    const items: Array<{ title: string; description: string; severity: "high" | "medium" | "low" }> = [];
    kpis.overdueInvoices.forEach((inv: Record<string, any>) => {
      const days = Math.ceil((Date.now() - new Date(inv.due_date || inv.created_at).getTime()) / 86400000);
      items.push({ title: `Invoice overdue — ${inv.customer_name || "Customer"}`, description: `$${(inv.amount || 0).toLocaleString()} — ${days}d overdue`, severity: days > 30 ? "high" : "medium" });
    });
    leads.filter((l: Record<string, any>) => l.status === "cold" || l.status === "stale").slice(0, 2).forEach((l: Record<string, any>) => {
      items.push({ title: `Lead going cold: ${l.name || l.company}`, description: "Needs re-engagement", severity: "medium" });
    });
    return items.slice(0, 4);
  }, [leads, kpis.overdueInvoices]);

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />

      <SitaTabs
        tabs={[
          { key: "weekly", label: "Weekly Review" },
          { key: "council", label: "Advisor Council" },
          { key: "pipeline", label: "Pipeline" },
          { key: "collections", label: "Collections" },
        ]}
        active={mode}
        onChange={setMode}
      />

      {mode === "council" ? (
        <AdvisorCouncilShell advisors={businessAdvisors} domainLabel="Business" />
      ) : (
        <>
          {/* Hero KPIs */}
          <SitaCard hover={false} className="gradient-sita-subtle p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="rounded-xl gradient-sita p-2.5"><BarChart3 className="h-5 w-5 text-primary-foreground" /></div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Business Review — {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}</h2>
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

          <SurfaceTrustStrip config={{
            evidenceGrade: isDemoMode ? "C" : leads.length > 0 || invoices.length > 0 ? "B" : "D",
            gradeLabel: isDemoMode ? "Simulated data" : undefined,
            dataSources: ["Lead pipeline", "Invoice records", "Opportunity tracker", "Customer database"],
            lastRefreshed: new Date(),
            assumptions: [
              { statement: "Revenue = invoices marked paid this week", impact: "high" },
              { statement: "At-risk counts overdue invoices only", impact: "medium" },
            ],
            caveats: isDemoMode ? ["Demo data — connect live accounts for real figures"] : undefined,
          }} />

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Priorities */}
            <SitaCard hover={false}>
              <SitaCardTitle sub="Top items this week">Priorities</SitaCardTitle>
              <ListStagger className="mt-4 space-y-2.5">
                {priorities.map((p, i) => (
                  <ListStaggerItem key={i}>
                    <div className="flex items-center gap-3 rounded-xl bg-secondary/30 p-3.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full gradient-sita font-display text-xs font-bold text-primary-foreground shrink-0">{i + 1}</span>
                      <p className="text-sm text-foreground flex-1">{p.text}</p>
                      <span className={`text-[10px] font-semibold shrink-0 ${p.urgency === "critical" ? "text-urgency-critical" : p.urgency === "high" ? "text-urgency-high" : "text-muted-foreground"}`}>{p.urgency}</span>
                    </div>
                  </ListStaggerItem>
                ))}
              </ListStagger>
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

            {/* What Changed */}
            <SitaCard hover={false}>
              <SitaCardTitle sub="Delta since last review"><Clock className="h-4 w-4 inline mr-2" />What Changed</SitaCardTitle>
              <div className="mt-4 space-y-2">
                {[
                  kpis.newLeads > 0 && `${kpis.newLeads} new lead${kpis.newLeads > 1 ? "s" : ""} entered pipeline`,
                  kpis.overdueInvoices.length > 0 && `${kpis.overdueInvoices.length} invoice${kpis.overdueInvoices.length > 1 ? "s" : ""} became overdue`,
                  opportunities.length > 0 && `${opportunities.length} opportunity(ies) active`,
                  "No new customer churn signals",
                ].filter(Boolean).map((change, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-secondary/20 p-2.5">
                    <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground">{change}</p>
                  </div>
                ))}
              </div>
            </SitaCard>

            {/* Next Moves */}
            <SitaCard hover={false}>
              <SitaCardTitle sub="AI-prepared action queue"><Sparkles className="h-4 w-4 inline mr-2" />Next Moves</SitaCardTitle>
              <div className="mt-4 space-y-2">
                {[
                  kpis.atRisk > 0 && `Address $${kpis.atRisk.toLocaleString()} in at-risk revenue`,
                  kpis.newLeads > 0 && `Follow up on ${kpis.newLeads} new lead${kpis.newLeads > 1 ? "s" : ""}`,
                  "Review customer health scores for churn risk",
                  "Prepare weekly outreach cadence",
                ].filter(Boolean).map((move, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-accent/5 p-2.5">
                    <Target className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground">{move}</p>
                  </div>
                ))}
              </div>
            </SitaCard>
          </div>

          {/* Advisor */}
          <DomainAdvisorCard
            domain="business"
            insights={[
              { id: "rev", text: `Revenue this week: $${kpis.revenue.toLocaleString()}`, confidence: 85 },
              { id: "risk", text: kpis.atRisk > 0 ? `$${kpis.atRisk.toLocaleString()} at risk from ${kpis.overdueInvoices.length} overdue invoice(s)` : "No at-risk revenue", confidence: kpis.atRisk > 0 ? 92 : 85, action: kpis.atRisk > 0 ? "Review" : undefined },
              { id: "pipe", text: `${opportunities.length} active opportunities in pipeline`, confidence: 78 },
            ]}
          />
        </>
      )}
    </motion.div>
  );
};

const BusinessBoardroomWithBoundary = () => (
  <GlobalErrorBoundary>
    <BusinessBoardroom />
  </GlobalErrorBoundary>
);

export default BusinessBoardroomWithBoundary;
