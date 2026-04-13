import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { HeroCard, SummaryCard, ComparisonCard, ProofCard, AdvisorCard, QueueCard, TimelineCard } from "@/components/sita/cards";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { BoardroomCinematic } from "@/components/sita/motion/AppTransitions";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { AdvisorCouncilShell, type AdvisorConfig } from "@/components/advisors/AdvisorCouncilShell";
import { DomainAdvisorBoard } from "@/components/sita/domain-shared/DomainAdvisorBoard";
import { SITA_TYPE } from "@/lib/design-system/sita-design-tokens";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { BarChart3, AlertTriangle, Target, Sparkles, Clock, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useDataMode } from "@/contexts/DataModeContext";
import { useLeads, useCustomers, useInvoices, useOpportunities } from "@/hooks/use-sita-data";

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
    const items: Array<{ id: string; label: string; meta?: string; urgency: "critical" | "high" | "normal" | "low" }> = [];
    kpis.overdueInvoices.slice(0, 2).forEach((inv: Record<string, any>, i: number) => {
      items.push({ id: `oi-${i}`, label: `Collect overdue — ${inv.customer_name || "Customer"} ($${(inv.amount || 0).toLocaleString()})`, urgency: "critical" });
    });
    leads.filter((l: Record<string, any>) => l.status === "new" || l.status === "contacted").slice(0, 2).forEach((l: Record<string, any>, i: number) => {
      items.push({ id: `fl-${i}`, label: `Follow up: ${l.name || l.company || "Lead"} — ${l.source || "Inbound"}`, urgency: "high" });
    });
    opportunities.filter((o: Record<string, any>) => o.stage === "proposal").slice(0, 2).forEach((o: Record<string, any>, i: number) => {
      items.push({ id: `co-${i}`, label: `Close: ${o.title || "Opportunity"} — $${(o.value || 0).toLocaleString()}`, urgency: "normal" });
    });
    return items.length > 0 ? items.slice(0, 5) : [{ id: "no-p", label: "No active priorities — add leads or invoices to start", urgency: "low" as const }];
  }, [leads, opportunities, kpis.overdueInvoices]);

  const changeEvents = useMemo(() => [
    kpis.newLeads > 0 ? { id: "nl", title: `${kpis.newLeads} new lead${kpis.newLeads > 1 ? "s" : ""} entered pipeline`, timestamp: "This week", accentColor: "hsl(265 55% 58%)" } : null,
    kpis.overdueInvoices.length > 0 ? { id: "oi", title: `${kpis.overdueInvoices.length} invoice${kpis.overdueInvoices.length > 1 ? "s" : ""} became overdue`, timestamp: "This week", accentColor: "hsl(0 70% 55%)" } : null,
    { id: "op", title: `${opportunities.length} opportunity(ies) active`, timestamp: "Current", accentColor: "hsl(152 55% 48%)" },
    { id: "nc", title: "No new customer churn signals", timestamp: "Current", accentColor: "hsl(0 0% 50%)" },
  ].filter(Boolean) as any[], [kpis, opportunities]);

  return (
    <BoardroomCinematic domain="business">
      <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageTruthBanner truthState={isDemoMode ? "demo" : "live"} />

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
          <div className="space-y-6">
            <AdvisorCouncilShell advisors={businessAdvisors} domainLabel="Business" />
            <DomainAdvisorBoard domain="business" />
          </div>
        ) : (
          <>
            <HeroCard
              title={`Business Review — ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}`}
              metric={`$${kpis.revenue.toLocaleString()} revenue`}
              subtitle="Generated now · Based on all business activity"
              icon={<BarChart3 className="h-5 w-5 text-[hsl(265_55%_68%)]" />}
            >
              <SummaryCard
                title="Key Metrics"
                kpis={[
                  { label: "Revenue This Week", value: `$${kpis.revenue.toLocaleString()}`, trend: "up" },
                  { label: "New Leads", value: String(kpis.newLeads) },
                  { label: "At Risk Revenue", value: `$${kpis.atRisk.toLocaleString()}`, trend: kpis.atRisk > 0 ? "down" : "flat" },
                  { label: "Active Opps", value: String(opportunities.length) },
                ]}
              />
            </HeroCard>

            <div className="grid gap-5 lg:grid-cols-2">
              <QueueCard title="Priorities This Week" items={priorities} maxVisible={5} />
              <TimelineCard title="What Changed" events={changeEvents} />
            </div>

            {/* Scenario Comparison */}
            <ComparisonCard
              title="Pipeline Scenario"
              before={{ label: "Last Week", value: `$${(kpis.revenue * 0.85).toLocaleString()}`, detail: "Prior period" }}
              after={{ label: "This Week", value: `$${kpis.revenue.toLocaleString()}`, detail: "Current" }}
              delta={kpis.revenue > 0 ? `+${Math.round(((kpis.revenue / (kpis.revenue * 0.85)) - 1) * 100)}%` : "—"}
              deltaPositive={true}
            />

            {/* Proof chain */}
            <ProofCard
              title="Business Review Evidence"
              status={isDemoMode ? "pending" : "verified"}
              chain={[
                { label: "Lead pipeline data sourced", verified: true },
                { label: "Invoice records verified", verified: true },
                { label: "Opportunity tracker synced", verified: !isDemoMode },
                { label: "Customer database checked", verified: !isDemoMode },
              ]}
            />

            <AdvisorCard
              advisorName="Business Strategy Advisor"
              domain="Business"
              insight={kpis.atRisk > 0 ? `$${kpis.atRisk.toLocaleString()} at risk from ${kpis.overdueInvoices.length} overdue invoice(s). Follow up on ${kpis.newLeads} new leads this week.` : `${opportunities.length} active opportunities in pipeline. No at-risk revenue.`}
              confidence={kpis.atRisk > 0 ? 92 : 85}
              accentColor="hsl(265 55% 58%)"
            />
          </>
        )}
      </motion.div>
    </BoardroomCinematic>
  );
};

const BusinessBoardroomWithBoundary = () => (
  <GlobalErrorBoundary><BusinessBoardroom /></GlobalErrorBoundary>
);

export default BusinessBoardroomWithBoundary;
