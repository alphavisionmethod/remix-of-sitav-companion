import { SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton, SitaPageHeader } from "@/components/sita/SitaCard";
import { KPITile, RiskCard, OpportunityCard, ProofCard, SitaTabs } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { useState } from "react";
import {
  BarChart3, CheckCircle, AlertTriangle, Sparkles, DollarSign, Shield, TrendingUp, PiggyBank,
  CreditCard, Calendar, ArrowRight, Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";

const MoneyBoardroom = () => {
  const [mode, setMode] = useState("weekly");

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SitaPageHeader
        title="Finance Boardroom"
        subtitle="Executive financial review — cash, reserves, waste, and strategy"
        actions={<SitaButton variant="accent" size="sm"><Calendar className="h-3.5 w-3.5" /> Schedule Review</SitaButton>}
      />

      <SitaTabs
        tabs={[
          { key: "weekly", label: "Weekly Review" },
          { key: "reserves", label: "Reserve Review" },
          { key: "waste", label: "Waste Review" },
          { key: "monthly", label: "Monthly Planning" },
        ]}
        active={mode}
        onChange={setMode}
      />

      {/* Hero */}
      <SitaCard hover={false} className="gradient-sita-subtle p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="rounded-xl gradient-sita p-2.5"><BarChart3 className="h-5 w-5 text-primary-foreground" /></div>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Week of March 25 — Finance Review</h2>
            <p className="text-xs text-muted-foreground">Generated today · Based on all financial activity and projections</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total Balance</p><p className="mt-1 font-display text-2xl font-bold text-foreground">$58,570</p></div>
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Safe to Spend</p><p className="mt-1 font-display text-2xl font-bold text-trust-verified">$3,180</p></div>
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Reserve Health</p><p className="mt-1 font-display text-2xl font-bold text-foreground">94%</p></div>
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Monthly Waste</p><p className="mt-1 font-display text-2xl font-bold text-urgency-high">$28</p></div>
        </div>
      </SitaCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Priorities */}
        <SitaCard hover={false}>
          <SitaCardTitle sub="Top items for this week">Financial Priorities</SitaCardTitle>
          <div className="mt-4 space-y-2.5">
            {[
              { text: "Pay quarterly tax estimate — $3,200 due Apr 15", urgency: "high" },
              { text: "Cancel Zoom Pro before renewal Apr 6 — save $192/yr", urgency: "medium" },
              { text: "Transfer $1,000 to personal checking — below threshold", urgency: "medium" },
              { text: "Follow up on overdue Invoice #1035 — $1,800 from David Kim", urgency: "high" },
              { text: "Increase emergency fund contribution — 80% of target", urgency: "low" },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-secondary/30 p-3.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full gradient-sita font-display text-xs font-bold text-primary-foreground shrink-0">{i + 1}</span>
                <p className="text-sm text-foreground flex-1">{p.text}</p>
                <span className={`text-[10px] font-semibold shrink-0 ${p.urgency === "high" ? "text-urgency-high" : p.urgency === "medium" ? "text-trust-review" : "text-muted-foreground"}`}>{p.urgency}</span>
              </div>
            ))}
          </div>
        </SitaCard>

        {/* Reserve Health */}
        <SitaCard hover={false}>
          <SitaCardTitle>Reserve Health Summary</SitaCardTitle>
          <div className="mt-4 space-y-4">
            {[
              { name: "Emergency Fund", current: 12000, target: 15000 },
              { name: "Tax Reserve", current: 8400, target: 12000 },
              { name: "Equipment Fund", current: 2800, target: 5000 },
              { name: "Vacation Fund", current: 1600, target: 4000 },
            ].map((r) => {
              const pct = Math.round((r.current / r.target) * 100);
              return (
                <div key={r.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground">{r.name}</span>
                    <span className="text-xs text-muted-foreground">${r.current.toLocaleString()} / ${r.target.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full rounded-full ${pct >= 80 ? "bg-trust-verified" : pct >= 50 ? "bg-trust-review" : "bg-urgency-high"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </SitaCard>

        {/* Waste Opportunities */}
        <div className="space-y-4">
          <SitaSectionHeader title="Waste Reduction Opportunities" />
          <OpportunityCard title="Cancel Zoom Pro — $192/yr savings" description="Low usage, free alternative available. Renewal in 4 days." action="Cancel Now" />
          <OpportunityCard title="Cancel Calendly Pro — $144/yr savings" description="Very low usage. Free tier covers current needs." action="Review" />
          <OpportunityCard title="Review Dropbox Plus — $144/yr savings" description="Low usage, Google Drive already active. Potential duplicate." action="Review" />
        </div>

        {/* Timing Risks */}
        <div className="space-y-4">
          <SitaSectionHeader title="Timing Risks" />
          <RiskCard title="Apr 15 payment cluster — $3,685" description="Car loan + quarterly tax on same day. Ensure sufficient balance." severity="high" />
          <RiskCard title="Overdue receivable — $1,800" description="David Kim Invoice #1035, 12 days overdue. Follow-up needed." severity="medium" />
        </div>
      </div>

      {/* Proof + Next Moves */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SitaCard hover={false}>
          <SitaCardTitle>Proof Summary</SitaCardTitle>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <KPITile label="Bills Paid" value="4" icon={CheckCircle} sub="This week" className="text-sm" />
            <KPITile label="Savings Contributed" value="$2,900" icon={PiggyBank} sub="On track" className="text-sm" />
            <KPITile label="Approvals Processed" value="2" icon={Shield} sub="All resolved" className="text-sm" />
            <KPITile label="Proofs Generated" value="6" icon={TrendingUp} sub="All verified" className="text-sm" />
          </div>
        </SitaCard>

        <SitaCard hover={false}>
          <SitaCardTitle sub="AI-generated financial action plan">Recommended Next Moves</SitaCardTitle>
          <div className="mt-4 space-y-2.5">
            {[
              "Schedule quarterly tax payment before Apr 15",
              "Cancel Zoom Pro before Apr 6 renewal",
              "Transfer $1,000 to personal checking",
              "Follow up on David Kim overdue invoice",
              "Increase emergency fund to $700/mo",
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-2 rounded-xl bg-secondary/30 p-3">
                <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{r}</p>
              </div>
            ))}
          </div>
        </SitaCard>
      </div>
      <LiveAdvisorCard
        advisor="money"
        intent="financial_review"
        demoName="Finance Executive Advisor"
        demoRole="Strategic Intelligence"
        demoConfidence="High"
        demoRecommendation="Total balance $58,570 with $3,180 safe to spend. Reserve health at 94%. Priority: schedule tax payment and cancel Zoom Pro before renewal to save $192/yr."
        demoReasoning="Based on weekly financial review, reserve health analysis, waste detection, and cash flow projections."
      />
    </motion.div>
  );
};

export default MoneyBoardroom;
