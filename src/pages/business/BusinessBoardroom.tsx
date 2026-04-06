import { SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton, SitaPageHeader } from "@/components/sita/SitaCard";
import { KPITile, OpportunityCard, RiskCard, ProofCard, SitaTabs } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { StateBadge } from "@/components/sita/StateBadge";
import { useState } from "react";
import { BarChart3, CheckCircle, AlertTriangle, Sparkles, Clock, DollarSign, Users, TrendingUp, ArrowRight, Calendar, FileText, Target } from "lucide-react";
import { motion } from "framer-motion";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const BusinessBoardroom = () => {
  const [mode, setMode] = useState("weekly");

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
            <h2 className="font-display text-lg font-bold text-foreground">Week of March 25 — Business Review</h2>
            <p className="text-xs text-muted-foreground">Generated today at 9:00 AM · Based on all business activity</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Revenue This Week</p><p className="mt-1 font-display text-2xl font-bold text-trust-verified">$8,420 ↑</p></div>
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">New Leads</p><p className="mt-1 font-display text-2xl font-bold text-foreground">5</p></div>
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">At Risk Revenue</p><p className="mt-1 font-display text-2xl font-bold text-urgency-high">$5,400</p></div>
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Actions Completed</p><p className="mt-1 font-display text-2xl font-bold text-foreground">12</p></div>
        </div>
      </SitaCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Priorities */}
        <SitaCard hover={false}>
          <SitaCardTitle sub="Top 5 items for this week">Priorities</SitaCardTitle>
          <div className="mt-4 space-y-2.5">
            {[
              { text: "Follow up on Quote #1039 — Apex Corp ($12K) expiring tomorrow", urgency: "critical" },
              { text: "Collect overdue Invoice #1035 — David Kim ($1,800, 12 days)", urgency: "high" },
              { text: "Call Sarah Chen — new lead with high conversion potential", urgency: "high" },
              { text: "Close retainer deal with Marcus Johnson ($4,800/mo)", urgency: "medium" },
              { text: "Re-engage Emily Watson before lead goes fully cold", urgency: "medium" },
            ].map((p, i) => (
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
          <RiskCard title="Invoice #1032 severely overdue" description="Green Valley LLC — $2,400, 33 days overdue. 4 reminders sent. Consider escalation." severity="high" />
          <RiskCard title="Quote #1039 expiring" description="Apex Corp — $12,000 deal at risk. No response to proposal." severity="high" />
          <RiskCard title="2 stale leads going cold" description="Emily Watson and David Torres — combined $3,900 potential" severity="medium" />
        </div>

        {/* Opportunities */}
        <div className="space-y-4">
          <SitaSectionHeader title="Opportunities" />
          <OpportunityCard title="Marcus Johnson retainer upsell" description="Strong payment history + expanding scope = ideal retainer candidate. $4,800/mo potential." action="Create Proposal" />
          <OpportunityCard title="Rachel Kim brand project" description="High-value lead ($8,400) — discovery complete, ready for proposal. 78% confidence." action="Draft Proposal" />
          <OpportunityCard title="Referral program launch" description="3 satisfied customers eligible for referral ask — potential 2-3 warm leads" action="Start Outreach" />
        </div>

        {/* Proof Summary */}
        <div className="space-y-4">
          <SitaSectionHeader title="Proof & Execution Summary" />
          <div className="grid gap-3 sm:grid-cols-2">
            <KPITile label="Actions Completed" value="12" icon={CheckCircle} sub="This week" className="text-sm" />
            <KPITile label="Proofs Generated" value="8" icon={FileText} sub="Verified" className="text-sm" />
            <KPITile label="Approvals Processed" value="3" icon={Target} sub="All resolved" className="text-sm" />
            <KPITile label="Workflows Active" value="5" icon={TrendingUp} sub="On track" className="text-sm" />
          </div>
          <ProofCard title="12 actions completed this week" artifact="All proof artifacts verified — receipts available" time="Summary" trust="verified" state="verified" />
        </div>
      </div>

      {/* Recommended Next Moves */}
      <SitaCard hover={false}>
        <SitaCardTitle sub="AI-generated action plan based on this week's data">Recommended Next Moves</SitaCardTitle>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { text: "Call Apex Corp about Quote #1039 before expiry", confidence: "High", icon: "🔴" },
            { text: "Send collections escalation to Green Valley LLC", confidence: "High", icon: "🟠" },
            { text: "Schedule callback with Sarah Chen", confidence: "High", icon: "🟡" },
            { text: "Draft retainer proposal for Marcus Johnson", confidence: "Medium", icon: "🟢" },
            { text: "Send re-engagement email to Emily Watson", confidence: "Medium", icon: "🔵" },
            { text: "Launch referral ask to top 3 customers", confidence: "Medium", icon: "🟣" },
          ].map((r, i) => (
            <div key={i} className="flex items-start gap-2 rounded-xl bg-secondary/30 p-3.5">
              <span className="text-sm">{r.icon}</span>
              <div>
                <p className="text-sm text-foreground">{r.text}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">Confidence: {r.confidence}</p>
              </div>
            </div>
          ))}
        </div>
      </SitaCard>

      {/* Carryover */}
      <SitaCard hover={false}>
        <SitaCardTitle>Carryover from Last Week</SitaCardTitle>
        <div className="mt-3 space-y-2">
          {["Follow up on David Kim payment — still unresolved", "Emily Watson re-engagement — attempted once, no response"].map((item, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-urgency-high/5 border border-urgency-high/10 p-3">
              <AlertTriangle className="h-3.5 w-3.5 text-urgency-high shrink-0" />
              <p className="text-sm text-foreground">{item}</p>
            </div>
          ))}
        </div>
      </SitaCard>
      <LiveAdvisorCard
        advisor="business"
        intent="executive_briefing"
        demoName="Executive Advisor"
        demoRole="Strategic Intelligence"
        demoConfidence="High"
        demoRecommendation="This week's top priority: close the $12K Apex Corp deal before quote expiry. Revenue is up 8% but at-risk revenue ($5,400) needs immediate attention."
        demoReasoning="Based on weekly pipeline analysis, revenue trends, and risk scoring across all business operations."
      />
    </motion.div>
  );
};

export default BusinessBoardroom;
