// ═══════════════════════════════════════════════════════════════
// Business OS — Customers (Premium Split Workspace)
// Resizable list/detail with badges, surfaces, domain motion
// ═══════════════════════════════════════════════════════════════

import { SplitWorkspace } from "@/platform/sita/components/sita/surfaces/SplitWorkspace";
import { AppSurface } from "@/platform/sita/components/sita/surfaces/AppSurface";
import { HeroCard, SummaryCard, AdvisorCard } from "@/components/sita/cards";
import { FreshnessBadge, TrustBadge } from "@/components/sita/badges";
import { ListReveal, ListRevealItem } from "@/platform/sita/components/sita/motion/AppTransitions";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import { CustomerDetailPane } from "@/modules/business/components/business/CustomerDetailPane";
import { ConfidenceBar } from "@/platform/sita/components/sita/primitives/ConfidenceBar";
import { SitaButton } from "@/platform/sita/components/sita/SitaCard";
import { SectionSkeleton, KPISkeleton } from "@/platform/sita/components/sita/SectionSkeleton";
import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { useAction } from "@/hooks/useAction";
import { useBusinessNavigation } from "@/contexts/BusinessNavigationContext";
import {
  Users, Search, DollarSign, Heart, AlertTriangle, Plus, X, Plug
} from "lucide-react";
import { motion } from "framer-motion";
import CustomerAutopilotPanel from "@/platform/orchestration/components/autopilot/CustomerAutopilotPanel";
import { useCustomers } from "@/hooks/use-domain-data";
import type { MockCustomer } from "@/data/repositories/business-data-service";
import { useCRMSync } from "@/hooks/use-backend-actions";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { CrossAppAction } from "@/platform/sita/components/sita/CrossAppAction";

type Customer = MockCustomer;
type Tab = "all" | "active" | "at-risk" | "new" | "inactive";

const healthColor = (score: number | null) => {
  if (!score) return "text-muted-foreground";
  if (score >= 80) return "text-[hsl(152_55%_48%)]";
  if (score >= 50) return "text-[hsl(38_85%_58%)]";
  return "text-[hsl(0_70%_55%)]";
};

const healthBg = (score: number | null) => {
  if (!score) return "bg-muted";
  if (score >= 80) return "bg-[hsl(152_55%_48%)]";
  if (score >= 50) return "bg-[hsl(38_85%_58%)]";
  return "bg-[hsl(0_70%_55%)]";
};

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

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "at-risk", label: "At Risk" },
  { key: "new", label: "New" },
  { key: "inactive", label: "Inactive" },
];

const CustomersPage = () => {
  const { primaryMode, adaptations } = useBusinessProfile();
  const customerLabel = adaptations.crm?.language?.contactLabel || "Customer";
  const { user } = useAuth();
  const { navigateTo } = useBusinessNavigation();
  const crmSync = useCRMSync();
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const { data: customers = [], isLoading } = useCustomers();

  const createCustomer = useAction("business", "customer.create", {
    successMessage: "Customer created",
    invalidateKeys: [["customers"]],
    onSuccess: () => { setShowAdd(false); setFormName(""); setFormEmail(""); setFormCompany(""); setFormPhone(""); },
  });

  const deleteCustomer = useAction("business", "customer.delete", {
    successMessage: "Customer deleted",
    invalidateKeys: [["customers"]],
    onSuccess: () => { setSelectedId(null); },
  });

  const filtered = customers
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.company?.toLowerCase().includes(search.toLowerCase()))
    .filter(c => {
      if (tab === "all") return true;
      if (tab === "active") return c.status === "active";
      if (tab === "at-risk") return (c.health_score ?? 80) < 50;
      if (tab === "new") return c.status === "new" || c.relationship_type === "prospect";
      if (tab === "inactive") return c.status === "inactive";
      return true;
    });

  const selected = customers.find(c => c.id === selectedId);
  const totalRevenue = customers.reduce((s, c) => s + (c.lifetime_revenue || 0), 0);
  const avgHealth = customers.length ? Math.round(customers.reduce((s, c) => s + (c.health_score || 80), 0) / customers.length) : 0;
  const atRisk = customers.filter(c => (c.health_score ?? 80) < 50).length;

  if (isLoading) {
    return (
      <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
<KPISkeleton count={4} />
        <SectionSkeleton cards={3} columns={1} />
      </motion.div>
    );
  }

  if (customers.length === 0) {
    return (
      <PremiumEmptyState
        variant="no-data"
        icon={Users}
        title="No customers yet"
        description="Add your first customer to start tracking relationships and revenue."
        actions={[
          { label: "Add Customer", icon: Plus, onClick: () => setShowAdd(true) },
          { label: "Integrations", icon: Plug, onClick: () => navigateTo("integrations"), variant: "secondary" as const },
        ]}
        domain="business"
      />
    );
  }

  const listPane = (
    <div className="p-3 space-y-2">
      {/* Actions bar */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-2">
          <SitaButton variant="primary" size="sm" onClick={() => setShowAdd(true)}><Plus className="h-3.5 w-3.5" /> Add</SitaButton>
          <SitaButton variant="ghost" size="sm" onClick={() => navigateTo("integrations")}><Plug className="h-3.5 w-3.5" /></SitaButton>
          <CrossAppAction to="/concierge/appointments" label="Appointments" variant="chip" context={{ entityType: "customer", entityId: selectedId || "all" }} />
          <CrossAppAction to="/business/quotes" label="Quotes" variant="chip" context={{ entityType: "customer", entityId: selectedId || "all" }} />
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_12%)] p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_85%)]")}>New Customer</span>
            <button onClick={() => setShowAdd(false)}><X className="h-3.5 w-3.5 text-[hsl(0_0%_50%)]" /></button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Name *" className="rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_6%)] px-3 py-2 text-sm text-foreground" />
            <input value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="Email" className="rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_6%)] px-3 py-2 text-sm text-foreground" />
            <input value={formCompany} onChange={e => setFormCompany(e.target.value)} placeholder="Company" className="rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_6%)] px-3 py-2 text-sm text-foreground" />
            <input value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="Phone" className="rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_6%)] px-3 py-2 text-sm text-foreground" />
          </div>
          <SitaButton variant="primary" size="sm" onClick={() => createCustomer.mutate({ name: formName, email: formEmail || null, company: formCompany || null, phone: formPhone || null, status: "active" })} disabled={!formName.trim()}>Create</SitaButton>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(0_0%_40%)]" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="w-full rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_6%)] py-2 pl-9 pr-3 text-[12px] text-foreground placeholder:text-[hsl(0_0%_40%)] focus:border-[hsl(265_55%_58%/0.4)] focus:outline-none transition-colors"
          placeholder="Search customers..." />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap",
              tab === t.key ? "bg-[hsl(0_0%_100%/0.08)] text-foreground" : "text-[hsl(0_0%_50%)] hover:text-[hsl(0_0%_70%)]"
            )}>
            {t.label}
          </button>
        ))}
      </div>

      {/* KPI strip */}
      <SummaryCard
        title="Portfolio"
        kpis={[
          { label: "Customers", value: String(customers.length) },
          { label: "Revenue", value: `$${(totalRevenue / 1000).toFixed(0)}K`, trend: "up" },
          { label: "Health", value: `${avgHealth}%`, trend: avgHealth >= 80 ? "up" : "down" },
          { label: "At Risk", value: String(atRisk), trend: atRisk > 0 ? "down" : "flat" },
        ]}
        className="border-0 bg-transparent shadow-none"
      />

      {/* Customer list */}
      <ListReveal className="space-y-1" domain="business">
        {filtered.map((c) => {
          const health = c.health_score ?? 80;
          return (
            <ListRevealItem key={c.id}>
              <button
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3",
                  selectedId === c.id
                    ? "bg-[hsl(265_55%_58%/0.12)] border border-[hsl(265_55%_58%/0.20)]"
                    : "hover:bg-[hsl(0_0%_100%/0.04)] border border-transparent"
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(265_55%_58%/0.10)] text-[11px] font-semibold text-[hsl(265_55%_58%)] shrink-0">
                  {initials(c.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_88%)] truncate")}>{c.name}</p>
                  <p className="text-[10px] text-[hsl(0_0%_50%)] truncate">{c.company || c.relationship_type || "Client"} · {timeAgo(c.last_contact_at)}</p>
                </div>
                <div className="text-right shrink-0 space-y-0.5">
                  <p className="text-[11px] font-semibold tabular-nums text-[hsl(0_0%_85%)]">${(c.lifetime_revenue || 0).toLocaleString()}</p>
                  <div className="flex items-center justify-end gap-1">
                    <div className="h-1 w-6 rounded-full bg-[hsl(0_0%_100%/0.06)] overflow-hidden">
                      <div className={cn("h-full rounded-full", healthBg(health))} style={{ width: `${health}%` }} />
                    </div>
                    <span className={cn("text-[9px] font-bold tabular-nums", healthColor(health))}>{health}%</span>
                  </div>
                </div>
              </button>
            </ListRevealItem>
          );
        })}
      </ListReveal>
    </div>
  );

  const detailPane = selected ? (
    <div className="p-4">
      <CustomerDetailPane customer={selected} onDelete={(id) => deleteCustomer.mutate({ id })} />
      <div className="mt-4">
        <AdvisorCard
          advisorName="CRM Advisor"
          insight={atRisk > 0 ? `${atRisk} customer${atRisk !== 1 ? 's' : ''} at risk — prioritize re-engagement` : "All customers healthy — great relationship management"}
          confidence={85}
          domain="Business"
          accentColor="hsl(265 55% 58%)"
          action={atRisk > 0 ? { label: "View at-risk", onClick: () => setTab("at-risk") } : undefined}
        />
      </div>
    </div>
  ) : (
    <PremiumEmptyState
      variant="no-data"
      icon={Users}
      title="Select a customer"
      description="Click on a customer to see details, history, and advisor insights."
      domain="business"
    />
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
<SplitWorkspace
        list={listPane}
        detail={detailPane}
        hasSelection={!!selected}
        defaultSplit={40}
        className="h-[calc(100vh-200px)] rounded-xl border border-[hsl(0_0%_100%/0.06)] overflow-hidden"
      />
      <div className="mt-4">
        <CustomerAutopilotPanel customers={customers.map(c => ({
          id: c.id, name: c.name, status: c.status, health_score: c.health_score,
          lifetime_revenue: c.lifetime_revenue, last_contact_at: c.last_contact_at,
          company: c.company, email: c.email, phone: c.phone,
        }))} />
      </div>
    </motion.div>
  );
};

export default CustomersPage;
