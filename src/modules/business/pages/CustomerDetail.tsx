import { SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/platform/sita/components/sita/SitaCard";
import { KPITile, TimelineItem, ProofCard, OpportunityCard, SitaTabs } from "@/platform/sita/components/sita/SitaComponents";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import { useNavigate, useParams } from "react-router-dom";
import { useBusinessNavigation } from "@/modules/business/contexts/BusinessNavigationContext";
import { useState } from "react";
import {
  ArrowLeft, Phone, Mail, Clock, MapPin, Globe, Building, DollarSign, FileText, CheckCircle,
  AlertTriangle, Calendar, BarChart3, Sparkles, TrendingUp, TrendingDown
} from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import { useCustomerDetail } from "@/modules/business/hooks/use-customer-detail";
import { CRMFinanceLinkage } from "@/modules/business/components/business/crm/CRMFinanceLinkage";
import { CRMConciergeLinkage } from "@/modules/business/components/business/crm/CRMConciergeLinkage";

const TIMELINE_ICONS: Record<string, typeof FileText> = {
  invoice: DollarSign,
  quote: FileText,
  document: FileText,
  support: AlertTriangle,
  default: Clock,
};

function pickTimelineIcon(kind: string | undefined): typeof FileText {
  if (!kind) return TIMELINE_ICONS.default;
  return TIMELINE_ICONS[kind] ?? TIMELINE_ICONS.default;
}

const CustomerDetail = ({ customerId: propId }: { customerId?: string }) => {
  const params = useParams<{ id: string }>();
  const id = propId || params.id || null;
  const { navigateTo } = useBusinessNavigation();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const { customer, isLoading, isEmpty } = useCustomerDetail(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <PageTruthBanner />
        <div className="text-sm text-muted-foreground">Loading customer…</div>
      </div>
    );
  }

  if (isEmpty || !customer) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <PageTruthBanner />
        <PremiumEmptyState
          variant="no-data"
          icon={Building}
          title="Customer not found"
          description="This customer no longer exists or you don't have access to it."
          actions={[{ label: "Back to Customers", onClick: () => navigateTo("customers") }]}
          domain="business"
        />
      </div>
    );
  }

  const healthColor = customer.healthScore >= 80 ? "text-trust-verified" : customer.healthScore >= 50 ? "text-trust-review" : "text-urgency-high";
  const healthBg = customer.healthScore >= 80 ? "bg-trust-verified" : customer.healthScore >= 50 ? "bg-trust-review" : "bg-urgency-high";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageTruthBanner />
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
                {customer.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {customer.location}</span>}
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPITile label="Total Revenue" value={customer.totalRevenue} trend="up" icon={DollarSign} />
        <KPITile label="Invoices Paid" value={`${customer.invoicesPaid}/${customer.invoicesTotal}`} icon={CheckCircle} />
        <KPITile label="Outstanding" value={customer.outstanding} icon={AlertTriangle} />
        <KPITile label="Avg Pay Days" value={String(customer.avgPayDays)} sub={customer.avgPayDays <= 7 ? "Excellent" : customer.avgPayDays <= 14 ? "Good" : "Slow"} icon={Clock} />
        <div className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-card-hover">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Health</p>
            {customer.healthTrend === "up" ? <TrendingUp className="h-4 w-4 text-trust-safe" /> : customer.healthTrend === "down" ? <TrendingDown className="h-4 w-4 text-urgency-high" /> : null}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className={`font-display text-2xl font-bold tracking-tight ${healthColor}`}>{customer.healthScore}%</p>
            <span className="text-xs text-muted-foreground">{customer.healthLabel}</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div className={`h-full rounded-full transition-all ${healthBg}`} style={{ width: `${customer.healthScore}%` }} />
          </div>
        </div>
      </div>

      <SitaTabs
        tabs={[
          { key: "overview", label: "Overview" },
          { key: "timeline", label: "Timeline", count: customer.timeline.length },
          { key: "financials", label: "Financials", count: customer.invoices.length },
          { key: "concierge", label: "Concierge" },
          { key: "documents", label: "Documents", count: customer.documents.length },
          { key: "boardroom", label: "Boardroom" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-6">
            <div className="space-y-3">
              <SitaSectionHeader title="Recent Activity" action={<button onClick={() => setTab("timeline")} className="text-xs text-primary hover:underline">View all</button>} />
              <SitaCard hover={false} className="p-4">
                {customer.timeline.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No activity yet for this customer.</p>
                ) : (
                  customer.timeline.slice(0, 5).map((t) => (
                    <TimelineItem
                      key={t.id}
                      icon={pickTimelineIcon((t as any).kind)}
                      title={t.title}
                      subtitle={t.detail}
                      time={new Date(t.occurredAt).toLocaleDateString()}
                    />
                  ))
                )}
              </SitaCard>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <SitaCard hover={false}>
              <SitaCardTitle>Contact Information</SitaCardTitle>
              <div className="mt-4 space-y-3">
                {[
                  customer.email ? { icon: Mail, label: "Email", value: customer.email } : null,
                  customer.phone ? { icon: Phone, label: "Phone", value: customer.phone } : null,
                  customer.location ? { icon: MapPin, label: "Location", value: customer.location } : null,
                  customer.website ? { icon: Globe, label: "Website", value: customer.website } : null,
                ].filter((r): r is { icon: typeof Mail; label: string; value: string } => !!r).map((row) => (
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

            <div className="space-y-3">
              <SitaSectionHeader title="Open Quotes" />
              {customer.quotes.length === 0 ? (
                <p className="text-xs text-muted-foreground">No quotes yet.</p>
              ) : (
                customer.quotes.slice(0, 3).map((q) => (
                  <OpportunityCard key={q.id} title={q.title} description={`${q.status} · ${(q.amountCents / 100).toLocaleString(undefined, { style: "currency", currency: q.currency })}`} action="Open" />
                ))
              )}
            </div>

            <div className="space-y-3">
              <SitaSectionHeader title="Recent Receipts" action={<button onClick={() => setTab("documents")} className="text-xs text-primary hover:underline">View all</button>} />
              {customer.invoices.filter((i) => i.status === "paid").slice(0, 3).map((inv) => (
                <ProofCard key={inv.id} title={`Invoice ${inv.number} paid`} artifact={`${(inv.amountCents / 100).toLocaleString(undefined, { style: "currency", currency: inv.currency })}`} time={inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : "—"} trust="verified" state="verified" />
              ))}
              {customer.invoices.filter((i) => i.status === "paid").length === 0 && (
                <p className="text-xs text-muted-foreground">No paid invoices yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "timeline" && (
        <SitaCard hover={false} className="p-5">
          <SitaCardTitle sub="Complete relationship history">Full Timeline</SitaCardTitle>
          <div className="mt-4">
            {customer.timeline.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No activity yet for this customer.</p>
            ) : customer.timeline.map((t) => (
              <TimelineItem
                key={t.id}
                icon={pickTimelineIcon((t as any).kind)}
                title={t.title}
                subtitle={t.detail}
                time={new Date(t.occurredAt).toLocaleString()}
              />
            ))}
          </div>
        </SitaCard>
      )}

      {tab === "financials" && (
        <div className="space-y-6">
          <CRMFinanceLinkage entityType="contact" entityId={customer.id} entityName={customer.name} healthScore={customer.healthScore} />
          <div className="grid gap-3 sm:grid-cols-3">
            <KPITile label="Lifetime Revenue" value={customer.totalRevenue} trend="up" className="gradient-sita-subtle" />
            <KPITile label="Payment Reliability" value={customer.avgPayDays <= 7 ? "Excellent" : customer.avgPayDays <= 14 ? "Good" : "Needs Attention"} sub={`${customer.avgPayDays} day avg`} />
            <KPITile label="Collection Risk" value={customer.outstandingCents === 0 ? "None" : customer.outstanding} sub={customer.outstandingCents === 0 ? "All paid" : "Outstanding balance"} />
          </div>
          <SitaCard hover={false}>
            <SitaCardTitle sub="All invoices and payments">Invoice History</SitaCardTitle>
            <div className="mt-4 space-y-2">
              {customer.invoices.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No invoices yet for this customer.</p>
              ) : customer.invoices.map((inv) => {
                const trust = inv.status === "paid" ? "verified" as const : inv.status === "overdue" ? "degraded" as const : "review" as const;
                return (
                  <div key={inv.id} className="flex items-center justify-between rounded-xl bg-secondary/30 p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/8 p-2"><FileText className="h-4 w-4 text-primary" /></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Invoice {inv.number} — {(inv.amountCents / 100).toLocaleString(undefined, { style: "currency", currency: inv.currency })}</p>
                        <p className="text-xs text-muted-foreground">{inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString() : "—"} · {inv.daysToPay != null ? `${inv.daysToPay} days to pay` : inv.status}</p>
                      </div>
                    </div>
                    <TrustBadge level={trust} label={inv.status} size="sm" />
                  </div>
                );
              })}
            </div>
          </SitaCard>
        </div>
      )}

      {tab === "concierge" && (
        <div className="space-y-6">
          <CRMConciergeLinkage entityType="contact" entityId={customer.id} entityName={customer.name} />
        </div>
      )}

      {tab === "documents" && (
        <div className="space-y-3">
          <SitaSectionHeader title="Customer Documents" subtitle={`${customer.documents.length} file${customer.documents.length === 1 ? "" : "s"} linked to your account`} />
          {customer.documents.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No documents uploaded yet.</p>
          ) : customer.documents.map((doc) => (
            <SitaCard key={doc.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-secondary p-2.5"><FileText className="h-4 w-4 text-primary" /></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.mime ?? "file"} · {new Date(doc.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <TrustBadge level="verified" size="sm" />
              </div>
            </SitaCard>
          ))}
        </div>
      )}

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
                <p className={`mt-1 font-display text-xl font-bold ${healthColor}`}>{customer.healthScore}% — {customer.healthLabel}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Open Cases</p>
                <p className="mt-1 font-display text-xl font-bold text-foreground">{customer.openCases} / {customer.totalCases}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Risk Level</p>
                <p className="mt-1 font-display text-xl font-bold text-trust-review">{customer.outstandingCents === 0 ? "Low" : "Medium"}</p>
              </div>
            </div>
          </SitaCard>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail;
