import { SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton, SitaPageHeader } from "@/components/sita/SitaCard";
import { KPITile, RiskCard, OpportunityCard, SitaTabs } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useState } from "react";
import {
  BarChart3, CheckCircle, AlertTriangle, Sparkles, DollarSign, Shield,
  TrendingUp, PiggyBank, CreditCard, Calendar, ArrowRight, Clock,
  Sun, Users, Briefcase, Eye, ArrowDownLeft, Repeat
} from "lucide-react";
import { motion } from "framer-motion";
import { useMoneyKPIs, useReservesSavings } from "@/hooks/use-domain-data";
import { useSubscriptions } from "@/hooks/use-sita-data";

const MoneyBoardroom = () => {
  const [mode, setMode] = useState("daily");
  const { data: kpis, isLoading } = useMoneyKPIs();
  const { data: reserves = [] } = useReservesSavings();
  const { data: subscriptions = [] } = useSubscriptions();

  const k = kpis || { totalBalance: 0, safeToSpend: 0, reserveHealth: 0, estWaste: 0, wasteCount: 0, billsDue7d: 0, monthlyBurn: 0 };
  const wasteSubscriptions = subscriptions.filter((s: Record<string, any>) => s.is_waste);
  const totalReserved = reserves.reduce((s: number, r: Record<string, any>) => s + (r.current_amount || 0), 0);

  if (isLoading) return <SectionSkeleton cards={4} columns={2} />;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <SitaPageHeader
        title="Finance Boardroom"
        subtitle="Calm executive review — clarity, confidence, and next moves"
        actions={<SitaButton variant="accent" size="sm"><Calendar className="h-3.5 w-3.5" /> Schedule Review</SitaButton>}
      />

      <SitaTabs
        tabs={[
          { key: "daily", label: "Daily Pulse" },
          { key: "weekly", label: "Weekly Review" },
          { key: "household", label: "Household" },
          { key: "founder", label: "Founder Mode" },
          { key: "receivables", label: "Receivables" },
          { key: "subscriptions", label: "Subscriptions" },
        ]}
        active={mode}
        onChange={setMode}
      />

      {/* Hero KPI strip — always visible */}
      <SitaCard hover={false} className="gradient-sita-subtle p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="rounded-xl gradient-sita p-2.5"><BarChart3 className="h-5 w-5 text-primary-foreground" /></div>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">
              {mode === "daily" ? "Morning Money Pulse" : mode === "weekly" ? "Weekly Finance Review" : mode === "household" ? "Household Finance" : mode === "founder" ? "Founder Mixed Mode" : mode === "receivables" ? "Receivables Focus" : "Subscription Review"}
            </h2>
            <p className="text-xs text-muted-foreground">Generated today · Based on all financial activity</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total Balance</p><p className="mt-1 font-display text-2xl font-bold text-foreground">${k.totalBalance.toLocaleString()}</p></div>
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Safe to Spend</p><p className="mt-1 font-display text-2xl font-bold text-trust-verified">${k.safeToSpend.toLocaleString()}</p></div>
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Reserve Health</p><p className="mt-1 font-display text-2xl font-bold text-foreground">{k.reserveHealth}%</p></div>
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{mode === "subscriptions" ? "Recurring Burden" : "Bills Due (7d)"}</p><p className="mt-1 font-display text-2xl font-bold text-urgency-high">${mode === "subscriptions" ? k.monthlyBurn.toLocaleString() : k.billsDue7d.toLocaleString()}</p></div>
        </div>
      </SitaCard>

      {/* ── Daily Pulse ── */}
      {mode === "daily" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SitaCard hover={false}>
            <SitaCardTitle sub="What needs your attention today">
              <Sun className="h-4 w-4 text-accent inline mr-2" />Today's Focus
            </SitaCardTitle>
            <div className="mt-4 space-y-2.5">
              {[
                k.billsDue7d > 0 && { text: `$${k.billsDue7d.toLocaleString()} in bills due this week`, urgency: "medium" },
                k.wasteCount > 0 && { text: `${k.wasteCount} subscription${k.wasteCount > 1 ? "s" : ""} flagged as waste ($${k.estWaste}/mo)`, urgency: "low" },
                k.reserveHealth < 80 && { text: `Reserve health at ${k.reserveHealth}% — below 80% target`, urgency: "high" },
                { text: "No overdue approvals — all clear", urgency: "none" },
              ].filter(Boolean).map((item: any, i) => (
                <div key={i} className={`flex items-start gap-2 rounded-xl p-3 ${item.urgency === "high" ? "bg-urgency-high/10" : item.urgency === "medium" ? "bg-trust-review/10" : "bg-secondary/30"}`}>
                  {item.urgency === "high" ? <AlertTriangle className="h-4 w-4 text-urgency-high shrink-0 mt-0.5" /> :
                   item.urgency === "none" ? <CheckCircle className="h-4 w-4 text-trust-verified shrink-0 mt-0.5" /> :
                   <Clock className="h-4 w-4 text-trust-review shrink-0 mt-0.5" />}
                  <p className="text-sm text-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </SitaCard>

          <SitaCard hover={false}>
            <SitaCardTitle sub="Prepared by your finance advisor">Quick Actions</SitaCardTitle>
            <div className="mt-4 space-y-2">
              <SitaButton variant="secondary" size="sm" className="w-full justify-start"><Eye className="h-3.5 w-3.5" /> Review upcoming bills</SitaButton>
              <SitaButton variant="secondary" size="sm" className="w-full justify-start"><ArrowDownLeft className="h-3.5 w-3.5" /> Check overdue receivables</SitaButton>
              <SitaButton variant="secondary" size="sm" className="w-full justify-start"><PiggyBank className="h-3.5 w-3.5" /> Review reserve progress</SitaButton>
              <SitaButton variant="secondary" size="sm" className="w-full justify-start"><Repeat className="h-3.5 w-3.5" /> Scan subscription changes</SitaButton>
            </div>
          </SitaCard>
        </div>
      )}

      {/* ── Weekly Review ── */}
      {mode === "weekly" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SitaCard hover={false}>
            <SitaCardTitle>Reserve Health Summary</SitaCardTitle>
            <div className="mt-4 space-y-4">
              {reserves.length > 0 ? reserves.map((r: Record<string, any>) => {
                const pct = r.target_amount > 0 ? Math.round((r.current_amount / r.target_amount) * 100) : 0;
                return (
                  <div key={r.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">{r.name}</span>
                      <span className="text-xs text-muted-foreground">${(r.current_amount || 0).toLocaleString()} / ${(r.target_amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div className={`h-full rounded-full ${pct >= 80 ? "bg-trust-verified" : pct >= 50 ? "bg-trust-review" : "bg-urgency-high"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              }) : <p className="text-sm text-muted-foreground">No reserves configured</p>}
            </div>
          </SitaCard>

          <SitaCard hover={false}>
            <SitaCardTitle sub="AI-generated action plan">Recommended Next Moves</SitaCardTitle>
            <div className="mt-4 space-y-2.5">
              {[
                k.billsDue7d > 0 && `Review $${k.billsDue7d.toLocaleString()} in upcoming bills`,
                k.wasteCount > 0 && `Cancel ${k.wasteCount} waste subscription${k.wasteCount > 1 ? "s" : ""} to save $${k.estWaste * 12}/yr`,
                k.reserveHealth < 80 && "Increase reserve contributions — below target",
                "Review cash timing for stress windows",
                "Reconcile any flagged transactions",
              ].filter(Boolean).map((r, i) => (
                <div key={i} className="flex items-start gap-2 rounded-xl bg-secondary/30 p-3">
                  <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{r}</p>
                </div>
              ))}
            </div>
          </SitaCard>

          <SitaCard hover={false}>
            <SitaCardTitle>Proof Summary</SitaCardTitle>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <KPITile label="Total Balance" value={`$${(k.totalBalance / 1000).toFixed(1)}K`} icon={DollarSign} sub="Across all accounts" className="text-sm" />
              <KPITile label="Savings Reserved" value={`$${(totalReserved / 1000).toFixed(1)}K`} icon={PiggyBank} sub="On track" className="text-sm" />
              <KPITile label="Bills Due" value={`$${k.billsDue7d.toLocaleString()}`} icon={Shield} sub="Next 7 days" className="text-sm" />
              <KPITile label="Monthly Burn" value={`$${k.monthlyBurn.toLocaleString()}`} icon={TrendingUp} sub="Projected" className="text-sm" />
            </div>
          </SitaCard>

          <div className="space-y-4">
            <SitaSectionHeader title="Waste Reduction Opportunities" />
            {wasteSubscriptions.length > 0 ? wasteSubscriptions.map((sub: Record<string, any>) => (
              <OpportunityCard key={sub.id} title={`Cancel ${sub.name} — $${(Number(sub.cost) * 12).toFixed(0)}/yr savings`} description={`Usage: ${sub.usage_level || "Low"}. Cost: $${Number(sub.cost).toFixed(2)}/mo`} action="Review" />
            )) : <SitaCard hover={false} className="p-4"><p className="text-sm text-muted-foreground">No waste detected</p></SitaCard>}
          </div>
        </div>
      )}

      {/* ── Household Finance Review ── */}
      {mode === "household" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SitaCard hover={false}>
            <SitaCardTitle><Users className="h-4 w-4 inline mr-2 text-accent" />Household Obligations</SitaCardTitle>
            <div className="mt-4 space-y-3">
              {[
                { label: "Mortgage / Rent", amount: "$2,500", status: "paid", due: "Apr 1" },
                { label: "Utilities (combined)", amount: "$340", status: "due", due: "Apr 15" },
                { label: "Insurance (auto + home)", amount: "$890", status: "upcoming", due: "Apr 20" },
                { label: "Childcare / Education", amount: "$1,200", status: "paid", due: "Apr 1" },
                { label: "Groceries (est.)", amount: "$600", status: "ongoing", due: "Weekly" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-secondary/20 p-3">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">Due {item.due}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-sm font-bold">{item.amount}</p>
                    <TrustBadge level={item.status === "paid" ? "verified" : item.status === "due" ? "degraded" : "review"} label={item.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </SitaCard>

          <SitaCard hover={false}>
            <SitaCardTitle>Shared Finance Summary</SitaCardTitle>
            <div className="mt-4 space-y-2.5">
              <div className="rounded-xl bg-trust-verified/10 p-3">
                <p className="text-sm font-medium text-foreground">Household runway: 2.8 months</p>
                <p className="text-xs text-muted-foreground">Based on current reserves and projected obligations</p>
              </div>
              <div className="rounded-xl bg-secondary/30 p-3">
                <p className="text-sm font-medium">Family subscriptions: 8 active ($142/mo)</p>
                <p className="text-xs text-muted-foreground">2 flagged for review</p>
              </div>
              <div className="rounded-xl bg-secondary/30 p-3">
                <p className="text-sm font-medium">Joint account balance: $8,400</p>
                <p className="text-xs text-muted-foreground">Safe to spend: $3,200</p>
              </div>
            </div>
          </SitaCard>
        </div>
      )}

      {/* ── Founder Mixed Mode ── */}
      {mode === "founder" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SitaCard hover={false}>
            <SitaCardTitle><Briefcase className="h-4 w-4 inline mr-2 text-accent" />Business Cash Position</SitaCardTitle>
            <div className="mt-4 space-y-3">
              {[
                { label: "Business checking", amount: "$24,680", type: "Available" },
                { label: "Business savings", amount: "$15,000", type: "Reserve" },
                { label: "Accounts receivable", amount: "$18,200", type: "Expected" },
                { label: "Payroll due (Apr 15)", amount: "$12,400", type: "Obligation" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-secondary/20 p-3">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.type}</p>
                  </div>
                  <p className="font-display text-sm font-bold">{item.amount}</p>
                </div>
              ))}
            </div>
          </SitaCard>

          <SitaCard hover={false}>
            <SitaCardTitle>Personal vs Business Split</SitaCardTitle>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-accent/10 p-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Founder Advisory</p>
                    <p className="text-xs text-muted-foreground mt-1">Business runway: 2.6 months at current burn. Personal reserves healthy. Consider scheduling quarterly tax payment ($4,200 due Apr 15).</p>
                  </div>
                </div>
              </div>
              <RiskCard title="Tax estimate due in 5 days" description="$4,200 quarterly estimate — ensure funds are allocated" severity="medium" />
              <OpportunityCard title="Move $5K to business reserve" description="Current reserve below 3-month target" action="Plan Transfer" />
            </div>
          </SitaCard>
        </div>
      )}

      {/* ── Receivables Focus ── */}
      {mode === "receivables" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SitaCard hover={false}>
            <SitaCardTitle><ArrowDownLeft className="h-4 w-4 inline mr-2 text-accent" />Receivables Snapshot</SitaCardTitle>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <KPITile label="Total Outstanding" value="$26.4K" icon={DollarSign} sub="8 invoices" className="text-sm" />
              <KPITile label="Overdue" value="$18.2K" icon={AlertTriangle} sub="5 past due" className="text-sm" />
              <KPITile label="Expected This Week" value="$3.6K" icon={Clock} sub="2 invoices" className="text-sm" />
              <KPITile label="Collections Risk" value="2" icon={Shield} sub="60+ days" className="text-sm" />
            </div>
          </SitaCard>

          <SitaCard hover={false}>
            <SitaCardTitle>Recovery Actions</SitaCardTitle>
            <div className="mt-4 space-y-2.5">
              {[
                "Send follow-up to Acme Corp ($4,200 — 45 days overdue)",
                "Escalate DataFlow Systems ($5,400 — 91 days, no response)",
                "Draft final notice for Summit Advisory ($7,500 — 22 days)",
                "Schedule call with TechStart Inc re: disputed line item",
              ].map((action, i) => (
                <div key={i} className="flex items-start gap-2 rounded-xl bg-secondary/30 p-3">
                  <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{action}</p>
                </div>
              ))}
            </div>
          </SitaCard>
        </div>
      )}

      {/* ── Subscription Review ── */}
      {mode === "subscriptions" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SitaCard hover={false}>
            <SitaCardTitle><Repeat className="h-4 w-4 inline mr-2 text-accent" />Recurring Burden</SitaCardTitle>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-secondary/30 p-3">
                  <p className="font-display text-xl font-bold">{subscriptions.length || 12}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Active</p>
                </div>
                <div className="rounded-xl bg-urgency-high/10 p-3">
                  <p className="font-display text-xl font-bold text-urgency-high">{wasteSubscriptions.length || 3}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Waste</p>
                </div>
                <div className="rounded-xl bg-trust-review/10 p-3">
                  <p className="font-display text-xl font-bold text-trust-review">2</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Changed</p>
                </div>
              </div>
              <div className="rounded-xl bg-secondary/20 p-3">
                <p className="text-sm font-medium">Monthly recurring: ${k.monthlyBurn.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Annual impact: ${(k.monthlyBurn * 12).toLocaleString()}</p>
              </div>
            </div>
          </SitaCard>

          <div className="space-y-4">
            <SitaSectionHeader title="Review Recommendations" />
            {wasteSubscriptions.length > 0 ? wasteSubscriptions.map((sub: Record<string, any>) => (
              <OpportunityCard key={sub.id} title={`Cancel ${sub.name}`} description={`$${Number(sub.cost).toFixed(2)}/mo · ${sub.usage_level || "Low"} usage · $${(Number(sub.cost) * 12).toFixed(0)}/yr savings`} action="Review" />
            )) : (
              <>
                <OpportunityCard title="Review Adobe Creative Cloud" description="$54.99/mo · Low usage detected · $660/yr" action="Review" />
                <OpportunityCard title="Cancel duplicate Dropbox" description="$11.99/mo · Already using Google Drive · $144/yr savings" action="Cancel" />
                <OpportunityCard title="Downgrade Slack plan" description="$12.50/mo · Under 5 active users · Free tier eligible" action="Review" />
              </>
            )}
          </div>
        </div>
      )}

      <LiveAdvisorCard
        advisor="money"
        intent="financial_review"
        demoName="Finance Executive Advisor"
        demoRole="Strategic Intelligence"
        demoConfidence="High"
        demoRecommendation={`Total balance $${k.totalBalance.toLocaleString()} with $${k.safeToSpend.toLocaleString()} safe to spend. Reserve health at ${k.reserveHealth}%.`}
        demoReasoning="Based on comprehensive financial review including reserve health, waste detection, receivables aging, and cash flow projections."
      />
    </motion.div>
  );
};

export default MoneyBoardroom;
