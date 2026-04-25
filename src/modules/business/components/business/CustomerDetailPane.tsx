// ═══════════════════════════════════════════════════════════════
// Customer Detail Pane — Right panel for ModuleWorkspace
// ═══════════════════════════════════════════════════════════════

import { Phone, Mail, Building, CheckCircle, AlertTriangle, MessageSquare, Receipt, ArrowRight, Trash2, Clock } from "lucide-react";
import { SitaCard, SitaCardTitle, SitaButton } from "@/platform/sita/components/sita/SitaCard";
import { ConfidenceBar } from "@/platform/sita/components/sita/primitives/ConfidenceBar";
import { TrustBadge, TrustLevel } from "@/platform/sita/components/sita/TrustBadge";
import { TimelineItem } from "@/platform/sita/components/sita/SitaComponents";
import { RelationshipGraphPanel } from "@/modules/business/components/business/RelationshipGraphPanel";
import type { MockCustomer } from "@/data/repositories/business-data-service";
import { useBusinessNavigation } from "@/contexts/BusinessNavigationContext";

interface CustomerDetailPaneProps {
  customer: MockCustomer;
  onDelete?: (id: string) => void;
}

const initials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

const timeAgo = (dt: string | null) => {
  if (!dt) return "No contact";
  const d = Date.now() - new Date(dt).getTime();
  const hrs = Math.floor(d / 3600000);
  if (hrs < 1) return "Just now";
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

const trustFromHealth = (score: number | null): TrustLevel => {
  if (!score) return "low-confidence";
  if (score >= 80) return "verified";
  if (score >= 50) return "review";
  return "degraded";
};

export function CustomerDetailPane({ customer, onDelete }: CustomerDetailPaneProps) {
  const { navigateTo } = useBusinessNavigation();
  const health = customer.health_score ?? 80;

  return (
    <div className="space-y-4">
      {/* Identity Card */}
      <SitaCard hover={false} glow className="text-center p-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-sita font-display text-xl font-bold text-primary-foreground">
          {initials(customer.name)}
        </div>
        <h3 className="mt-4 font-display text-lg font-bold text-foreground">{customer.name}</h3>
        {customer.company && (
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Building className="h-3 w-3" />{customer.company}
          </p>
        )}
        {customer.email && <p className="text-xs text-muted-foreground">{customer.email}</p>}
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize ${customer.status === "active" ? "bg-chart-2/10 text-chart-2 border-chart-2/20" : "bg-muted text-muted-foreground border-border"}`}>
            {customer.status}
          </span>
          <TrustBadge level={trustFromHealth(health)} size="sm" />
        </div>
        <div className="mt-4 flex gap-2">
          <SitaButton variant="accent" size="sm" className="flex-1"><Phone className="h-3.5 w-3.5" /> Call</SitaButton>
          <SitaButton variant="accent" size="sm" className="flex-1"><Mail className="h-3.5 w-3.5" /> Email</SitaButton>
          <SitaButton variant="primary" size="sm" className="flex-1" onClick={() => navigateTo(`customer-detail:${customer.id}`)}>
            <ArrowRight className="h-3.5 w-3.5" /> Detail
          </SitaButton>
          {onDelete && (
            <SitaButton variant="accent" size="sm" onClick={() => onDelete(customer.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </SitaButton>
          )}
        </div>
      </SitaCard>

      {/* Relationship Summary */}
      <SitaCard hover={false}>
        <SitaCardTitle>Relationship Summary</SitaCardTitle>
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Lifetime Revenue</span>
            <span className="font-semibold text-foreground">${(customer.lifetime_revenue || 0).toLocaleString()}</span>
          </div>
          <ConfidenceBar value={health} label="Health Score" size="md" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last Contact</span>
            <span className="text-foreground">{timeAgo(customer.last_contact_at)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Type</span>
            <span className="text-foreground capitalize">{customer.relationship_type || "Client"}</span>
          </div>
        </div>
      </SitaCard>

      {/* Timeline */}
      <SitaCard hover={false}>
        <SitaCardTitle>Timeline</SitaCardTitle>
        <div className="mt-3">
          {[
            { icon: CheckCircle, color: "text-[hsl(var(--trust-safe))]", title: "Onboarded", subtitle: `Customer since ${new Date(customer.created_at).toLocaleDateString()}`, time: new Date(customer.created_at).toLocaleDateString() },
            { icon: MessageSquare, color: "text-primary", title: "Last interaction", subtitle: customer.last_contact_at ? `Contacted ${timeAgo(customer.last_contact_at)}` : "No contact recorded", time: timeAgo(customer.last_contact_at) },
            ...(customer.lifetime_revenue && customer.lifetime_revenue > 0 ? [{ icon: Receipt, color: "text-[hsl(var(--trust-safe))]", title: `$${customer.lifetime_revenue.toLocaleString()} lifetime revenue`, subtitle: "Total payments received", time: "All time" }] : []),
            ...((health) < 50 ? [{ icon: AlertTriangle, color: "text-[hsl(var(--destructive))]", title: "Health declining", subtitle: "Re-engagement recommended", time: "Now" }] : []),
          ].map((event, i) => (
            <TimelineItem key={i} {...event} />
          ))}
        </div>
      </SitaCard>

      {/* Notes */}
      {customer.notes && (
        <SitaCard hover={false}>
          <SitaCardTitle>Notes</SitaCardTitle>
          <p className="mt-2 text-sm text-foreground leading-relaxed">{customer.notes}</p>
        </SitaCard>
      )}

      {/* Relationship Graph */}
      <RelationshipGraphPanel customerName={customer.name} customerId={customer.id} />
    </div>
  );
}
