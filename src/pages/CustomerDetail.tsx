import { SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton, SitaPageHeader } from "@/components/sita/SitaCard";
import { KPITile, TimelineItem, ProofCard, OpportunityCard, RiskCard, SitaTabs } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { StateBadge } from "@/components/sita/StateBadge";
import { useNavigate, useParams } from "react-router-dom";
import { useBusinessNavigation } from "@/contexts/BusinessNavigationContext";
import { useState } from "react";
import {
  ArrowLeft, Phone, Mail, Clock, MapPin, Globe, Building, DollarSign, FileText, CheckCircle,
  AlertTriangle, Briefcase, MessageSquare, Calendar, Receipt, BarChart3, Sparkles, Star, TrendingUp, TrendingDown, Shield
} from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

// Production fallback — seed data removed
const TIMELINE_ITEMS: any[] = [];

// Mock customer data keyed by ID
const CustomerDetail = ({
  customerId: propId }: { customerId?: string }) => {
  const params = useParams<{ id: string }>();
  const id = propId || params.id;
  const { navigateTo } = useBusinessNavigation();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const customer = CUSTOMERS_DATA[id || "marcus-johnson"] || CUSTOMERS_DATA["marcus-johnson"];

  const healthColor = customer.health >= 80 ? "text-trust-verified" : customer.health >= 50 ? "text-trust-review" : "text-urgency-high";
  const healthBg = customer.health >= 80 ? "bg-trust-verified" : customer.health >= 50 ? "bg-trust-review" : "bg-urgency-high";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
{/* Back + Header */}
      <div>
        <button onClick={() => navigateTo("customers")} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Business Center
        </button>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl gradient-sita font-display text-2xl font-bold text-primary-foreground shadow-glow-purple">
              {customer.initials}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{customer.name}</h1>
                <TrustBadge level={customer.trust} />
              </div>
              {customer.company && <p className="mt-0.5 text-sm text-muted-foreground flex items-center gap-1.5"><Building className="h-3.5 w-3.5" /> {customer.company}</p>}
              <div className="mt-1.5 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {customer.location}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Customer since {customer.since}</span>
                {customer.website && <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {customer.website}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SitaButton variant="accent" size="sm"><Phone className="h-3.5 w-3.5" /> Call</SitaButton>
            <SitaButton variant="accent" size="sm"><Mail className="h-3.5 w-3.5" /> Email</SitaButton>
            <SitaButton variant="primary" size="sm"><FileText className="h-3.5 w-3.5" /> New Quote</SitaButton>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPITile label="Total Revenue" value={customer.totalRevenue} trend="up" icon={DollarSign} />
        <KPITile label="Invoices Paid" value={`${customer.invoicesPaid}/${customer.invoicesTotal}`} icon={CheckCircle} />
        <KPITile label="Outstanding" value={customer.outstanding} icon={AlertTriangle} />
        <KPITile label="Avg Pay Days" value={customer.avgPayDays} sub={customer.avgPayDays <= 7 ? "Excellent" : customer.avgPayDays <= 14 ? "Good" : "Slow"} icon={Clock} />
        {/* Health */}
        <div className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-card-hover">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Health</p>
            {customer.healthTrend === "up" ? <TrendingUp className="h-4 w-4 text-trust-safe" /> : customer.healthTrend === "down" ? <TrendingDown className="h-4 w-4 text-urgency-high" /> : null}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className={`font-display text-2xl font-bold tracking-tight ${healthColor}`}>{customer.health}%</p>
            <span className="text-xs text-muted-foreground">{customer.healthLabel}</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div className={`h-full rounded-full transition-all ${healthBg}`} style={{ width: `${customer.health}%` }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <SitaTabs
        tabs={[
          { key: "overview", label: "Overview" },
          { key: "timeline", label: "Timeline" },
          { key: "financials", label: "Financials" },
          { key: "documents", label: "Documents" },
          { key: "boardroom", label: "Boardroom" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {/* ============ OVERVIEW TAB ============ */}
      {tab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-6">
            {/* Action Queue */}
            <div className="space-y-3">
              <SitaSectionHeader title="Action Queue" subtitle={`${([] as any[]).length} items pending`} />
              {([] as any[]).map((a, i) => (
                <SitaCard key={i} lane="action" className="p-4 pl-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1"><StateBadge state={a.state} size="sm" /></div>
                      <p className="text-sm font-medium text-foreground">{a.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.reason}</p>
                    </div>
                    <SitaButton variant="accent" size="sm">Act</SitaButton>
                  </div>
                </SitaCard>
              ))}
            </div>

            {/* Advisor */}
            <div className="space-y-3">
              <SitaSectionHeader title="Advisor Insight" />
</div>

            {/* Recent Timeline */}
            <div className="space-y-3">
              <SitaSectionHeader title="Recent Activity" action={<button onClick={() => setTab("timeline")} className="text-xs text-primary hover:underline">View all</button>} />
              <SitaCard hover={false} className="p-4">
                {([] as any[]).slice(0, 4).map((t, i) => (
                  <TimelineItem key={i} {...t} />
                ))}
              </SitaCard>
            </div>
          </div>

          {/* Right side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <SitaCard hover={false}>
              <SitaCardTitle>Contact Information</SitaCardTitle>
              <div className="mt-4 space-y-3">
                {[
                  { icon: Mail, label: "Email", value: customer.email },
                  { icon: Phone, label: "Phone", value: customer.phone },
                  { icon: MapPin, label: "Location", value: customer.location },
                  ...(customer.website ? [{ icon: Globe, label: "Website", value: customer.website }] : []),
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <row.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">{row.label}</p>
                      <p className="text-sm text-foreground">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SitaCard>

            {/* Opportunities */}
            <div className="space-y-3">
              <SitaSectionHeader title="Opportunities" />
              <OpportunityCard title="Retainer package upsell" description="Strong relationship — propose monthly retainer to increase LTV" action="Create Proposal" />
              <OpportunityCard title="Referral program" description="High satisfaction — ask for referrals during next call" action="Prepare" />
            </div>

            {/* Recent Proof */}
            <div className="space-y-3">
              <SitaSectionHeader title="Proof & Receipts" action={<button onClick={() => setTab("documents")} className="text-xs text-primary hover:underline">View all</button>} />
              <ProofCard title="Invoice #1038 paid" artifact="Stripe confirmation — $4,200" time="2h ago" trust="verified" state="verified" />
              <ProofCard title="Quote #1037 delivered" artifact="Email opened 3x" time="5d ago" trust="verified" state="completed" />
            </div>
          </div>
        </div>
      )}

      {/* ============ TIMELINE TAB ============ */}
      {tab === "timeline" && (
        <SitaCard hover={false} className="p-5">
          <SitaCardTitle sub="Complete relationship history">Full Timeline</SitaCardTitle>
          <div className="mt-4">
            {([] as any[]).map((t, i) => <TimelineItem key={i} {...t} />)}
          </div>
        </SitaCard>
      )}

      {/* ============ FINANCIALS TAB ============ */}
      {tab === "financials" && (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <KPITile label="Lifetime Revenue" value={customer.totalRevenue} trend="up" className="gradient-sita-subtle" />
            <KPITile label="Payment Reliability" value={customer.avgPayDays <= 7 ? "Excellent" : customer.avgPayDays <= 14 ? "Good" : "Needs Attention"} sub={`${customer.avgPayDays} day avg`} />
            <KPITile label="Collection Risk" value={customer.outstanding === "$0" ? "None" : customer.outstanding} sub={customer.outstanding === "$0" ? "All paid" : "Outstanding balance"} />
          </div>
          <SitaCard hover={false}>
            <SitaCardTitle sub="All invoices and payments">Invoice History</SitaCardTitle>
            <div className="mt-4 space-y-2">
              {[
                { id: "#1038", amount: "$4,200", date: "Mar 28", status: "Paid", days: "3 days", trust: "verified" as const },
                { id: "#1037", amount: "$3,200", date: "Mar 23", status: "Quoted", days: "—", trust: "review" as const },
                { id: "#1035", amount: "$1,800", date: "Mar 15", status: "Overdue", days: "7 days late", trust: "degraded" as const },
                { id: "#1032", amount: "$2,800", date: "Feb 28", status: "Paid", days: "On time", trust: "verified" as const },
                { id: "#1028", amount: "$2,200", date: "Jan 30", status: "Paid", days: "2 days", trust: "verified" as const },
              ].map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded-xl bg-secondary/30 p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/8 p-2"><FileText className="h-4 w-4 text-primary" /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Invoice {inv.id} — {inv.amount}</p>
                      <p className="text-xs text-muted-foreground">{inv.date} · {inv.days}</p>
                    </div>
                  </div>
                  <TrustBadge level={inv.trust} label={inv.status} size="sm" />
                </div>
              ))}
            </div>
          </SitaCard>
        </div>
      )}

      {/* ============ DOCUMENTS TAB ============ */}
      {tab === "documents" && (
        <div className="space-y-3">
          <SitaSectionHeader title="Customer Documents" subtitle="All files linked to this customer" />
          {([] as any[]).map((doc, i) => (
            <SitaCard key={i} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-secondary p-2.5"><FileText className="h-4 w-4 text-primary" /></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.type} · {doc.date}</p>
                  </div>
                </div>
                <TrustBadge level={doc.trust} size="sm" />
              </div>
            </SitaCard>
          ))}
        </div>
      )}

      {/* ============ BOARDROOM TAB ============ */}
      {tab === "boardroom" && (
        <div className="space-y-6">
          <SitaCard hover={false} className="gradient-sita-subtle p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl gradient-sita p-2.5"><BarChart3 className="h-5 w-5 text-primary-foreground" /></div>
              <SitaCardTitle sub={`Account review for ${customer.name}`}>Mini Boardroom Packet</SitaCardTitle>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Relationship Health</p>
                <p className={`mt-1 font-display text-xl font-bold ${healthColor}`}>{customer.health}% — {customer.healthLabel}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Revenue Trend</p>
                <p className="mt-1 font-display text-xl font-bold text-trust-safe">↑ Growing</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Risk Level</p>
                <p className="mt-1 font-display text-xl font-bold text-trust-review">{customer.outstanding === "$0" ? "Low" : "Medium"}</p>
              </div>
            </div>
          </SitaCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <SitaCard hover={false}>
              <SitaCardTitle>Priorities</SitaCardTitle>
              <div className="mt-3 space-y-2.5">
                {["Close outstanding quote #1037 ($3,200)", "Collect overdue invoice #1035", "Propose retainer package"].map((p, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full gradient-sita font-display text-xs font-bold text-primary-foreground">{i + 1}</span>
                    <p className="text-sm text-foreground">{p}</p>
                  </div>
                ))}
              </div>
            </SitaCard>
            <SitaCard hover={false}>
              <SitaCardTitle>Recommended Next Moves</SitaCardTitle>
              <div className="mt-3 space-y-2.5">
                {[
                  { text: "Call to discuss Quote #1037 — decision likely this week", confidence: "High" },
                  { text: "Send friendly reminder on Invoice #1035", confidence: "High" },
                  { text: "Draft retainer proposal for Q2", confidence: "Medium" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-accent shrink-0" />
                      <p className="text-sm text-foreground">{r.text}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{r.confidence}</span>
                  </div>
                ))}
              </div>
            </SitaCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail;
