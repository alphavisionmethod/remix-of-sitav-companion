import { SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton, SitaPageHeader } from "@/components/sita/SitaCard";
import { KPITile, TimelineItem, ProofCard, OpportunityCard, RiskCard, SitaTabs } from "@/components/sita/SitaComponents";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { StateBadge } from "@/components/sita/StateBadge";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft, Phone, Mail, Clock, MapPin, Globe, Building, DollarSign, FileText, CheckCircle,
  AlertTriangle, Briefcase, MessageSquare, Calendar, Receipt, BarChart3, Sparkles, Star, TrendingUp, TrendingDown, Shield
} from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

// Mock customer data keyed by ID
const customersData: Record<string, {
  name: string; initials: string; email: string; phone: string; company?: string; location: string; website?: string;
  since: string; trust: "verified" | "review" | "degraded"; health: number; healthLabel: string; healthTrend: "up" | "down" | "flat";
  totalRevenue: string; invoicesPaid: number; invoicesTotal: number; outstanding: string; avgPayDays: number;
}> = {
  "marcus-johnson": {
    name: "Marcus Johnson", initials: "MJ", email: "marcus@johnson.co", phone: "(555) 234-5678", company: "Johnson Consulting",
    location: "Austin, TX", website: "johnson.co", since: "Jan 2023", trust: "verified", health: 92, healthLabel: "Excellent", healthTrend: "up",
    totalRevenue: "$12,400", invoicesPaid: 8, invoicesTotal: 9, outstanding: "$1,800", avgPayDays: 4,
  },
  "apex-corp": {
    name: "Apex Corp", initials: "AC", email: "billing@apexcorp.com", phone: "(555) 987-6543", company: "Apex Corporation",
    location: "San Francisco, CA", website: "apexcorp.com", since: "Mar 2023", trust: "verified", health: 88, healthLabel: "Strong", healthTrend: "flat",
    totalRevenue: "$28,600", invoicesPaid: 12, invoicesTotal: 12, outstanding: "$0", avgPayDays: 7,
  },
  "david-kim": {
    name: "David Kim", initials: "DK", email: "david@kimdesign.io", phone: "(555) 111-2233", company: "Kim Design Studio",
    location: "Seattle, WA", website: "kimdesign.io", since: "Aug 2023", trust: "degraded", health: 45, healthLabel: "At Risk", healthTrend: "down",
    totalRevenue: "$4,200", invoicesPaid: 2, invoicesTotal: 4, outstanding: "$3,600", avgPayDays: 22,
  },
  "sarah-chen": {
    name: "Sarah Chen", initials: "SC", email: "sarah@chenventures.com", phone: "(555) 444-7788", location: "Portland, OR",
    since: "Mar 2024", trust: "review", health: 60, healthLabel: "New", healthTrend: "flat",
    totalRevenue: "$0", invoicesPaid: 0, invoicesTotal: 0, outstanding: "$0", avgPayDays: 0,
  },
};

const timeline = [
  { icon: CheckCircle, color: "text-trust-verified", title: "Invoice #1038 paid — $4,200", subtitle: "Payment received via Stripe", time: "2 hours ago" },
  { icon: FileText, color: "text-primary", title: "Quote #1037 sent — $3,200", subtitle: "Website maintenance package", time: "5 days ago" },
  { icon: Phone, color: "text-accent", title: "Follow-up call completed", subtitle: "Discussed Q2 projects — 18 min", time: "1 week ago" },
  { icon: Mail, color: "text-sita-purple-light", title: "Proposal email opened", subtitle: "Opened 3 times, spent 4 min reading", time: "1 week ago" },
  { icon: Calendar, color: "text-trust-review", title: "Onsite meeting — project kickoff", subtitle: "At client office, 2 attendees", time: "3 weeks ago" },
  { icon: DollarSign, color: "text-trust-verified", title: "Invoice #1032 paid — $2,800", subtitle: "On time — 3 days early", time: "1 month ago" },
  { icon: Briefcase, color: "text-primary", title: "Customer onboarded", subtitle: "Referred by Lisa Thompson", time: "Jan 2023" },
];

const actions = [
  { title: "Send follow-up on Quote #1037", priority: "high", state: "queued" as const, reason: "Quote viewed 3x but no response in 5 days" },
  { title: "Schedule Q2 planning call", priority: "medium", state: "proposed" as const, reason: "Annual review cycle — relationship maintenance" },
  { title: "Collect on Invoice #1035", priority: "high", state: "escalated" as const, reason: "7 days overdue, 2 reminders sent" },
];

const documents = [
  { name: "Invoice_1038.pdf", type: "Invoice", date: "Mar 28", trust: "verified" as const },
  { name: "Quote_1037_Maintenance.pdf", type: "Quote", date: "Mar 23", trust: "verified" as const },
  { name: "Service_Agreement_v2.pdf", type: "Contract", date: "Jan 15", trust: "verified" as const },
  { name: "Meeting_Notes_Q1.docx", type: "Notes", date: "Mar 15", trust: "review" as const },
  { name: "Invoice_1032.pdf", type: "Invoice", date: "Feb 28", trust: "verified" as const },
];

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const customer = customersData[id || "marcus-johnson"] || customersData["marcus-johnson"];

  const healthColor = customer.health >= 80 ? "text-trust-verified" : customer.health >= 50 ? "text-trust-review" : "text-urgency-high";
  const healthBg = customer.health >= 80 ? "bg-trust-verified" : customer.health >= 50 ? "bg-trust-review" : "bg-urgency-high";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DemoModeBadge />
      {/* Back + Header */}
      <div>
        <button onClick={() => navigate("/business")} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
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
              <SitaSectionHeader title="Action Queue" subtitle={`${actions.length} items pending`} />
              {actions.map((a, i) => (
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
              <LiveAdvisorCard
                advisor="business"
                intent="customer_insight"
                context={{ customer_name: customer.name, lifetime_revenue: customer.totalRevenue }}
                demoName="Business Advisor"
                demoRole="Relationship Intelligence"
                demoConfidence="High"
                demoRecommendation={`${customer.name} has been consistently paying on time and expanding scope. Consider offering a retainer package to lock in recurring revenue.`}
                demoReasoning="Payment history shows 4-day avg, 89% on-time rate, and 3 scope expansion conversations in 6 months."
              />
            </div>

            {/* Recent Timeline */}
            <div className="space-y-3">
              <SitaSectionHeader title="Recent Activity" action={<button onClick={() => setTab("timeline")} className="text-xs text-primary hover:underline">View all</button>} />
              <SitaCard hover={false} className="p-4">
                {timeline.slice(0, 4).map((t, i) => (
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
            {timeline.map((t, i) => <TimelineItem key={i} {...t} />)}
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
          {documents.map((doc, i) => (
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
