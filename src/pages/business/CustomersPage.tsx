import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { SectionSkeleton, KPISkeleton } from "@/components/sita/SectionSkeleton";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { ModuleWorkspace } from "@/components/sita/domain-shared/ModuleWorkspace";
import { DomainAdvisorCard } from "@/components/advisors/DomainAdvisorCard";
import { CustomerDetailPane } from "@/components/business/CustomerDetailPane";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { useState } from "react";
import { useDataMode } from "@/contexts/DataModeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAction } from "@/lib/hooks/useAction";
import { useNavigate } from "react-router-dom";
import {
  Users, Search, DollarSign, Heart, AlertTriangle, CheckCircle, Plus, X, Plug
} from "lucide-react";
import { motion } from "framer-motion";
import CustomerAutopilotPanel from "@/components/autopilot/CustomerAutopilotPanel";
import { useInspector } from "@/contexts/InspectorContext";
import { useCustomers } from "@/hooks/use-domain-data";
import type { MockCustomer } from "@/lib/data-services/business-data-service";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useCRMSync } from "@/hooks/use-backend-actions";
import { RefreshCw } from "lucide-react";

type Customer = MockCustomer;
type Tab = "all" | "active" | "at-risk" | "new" | "inactive";

const healthBg = (score: number | null) => {
  if (!score) return "bg-muted";
  if (score >= 80) return "bg-chart-2";
  if (score >= 50) return "bg-amber-500";
  return "bg-destructive";
};

const healthColor = (score: number | null) => {
  if (!score) return "text-muted-foreground";
  if (score >= 80) return "text-chart-2";
  if (score >= 50) return "text-amber-500";
  return "text-destructive";
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

const CustomersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDemoMode } = useDataMode();
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
      <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <DemoModeBadge />
        <KPISkeleton count={4} />
        <SectionSkeleton cards={3} columns={1} />
      </motion.div>
    );
  }

  const listContent = (
    <div className="space-y-2">
      {showAdd && (
        <SitaCard hover={false} className="p-4">
          <div className="flex justify-between items-center mb-3">
            <SitaCardTitle>New Customer</SitaCardTitle>
            <button onClick={() => setShowAdd(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Name *" className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm" />
            <input value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="Email" className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm" />
            <input value={formCompany} onChange={e => setFormCompany(e.target.value)} placeholder="Company" className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm" />
            <input value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="Phone" className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm" />
          </div>
          <SitaButton variant="primary" size="sm" className="mt-3" onClick={() => createCustomer.mutate({ name: formName, email: formEmail || null, company: formCompany || null, phone: formPhone || null, status: "active" } as any)} disabled={!formName.trim()}>Create Customer</SitaButton>
        </SitaCard>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-secondary/40 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          placeholder="Search customers..." />
      </div>

      <SitaTabs
        tabs={[
          { key: "all", label: "All", count: customers.length },
          { key: "active", label: "Active", count: customers.filter(c => c.status === "active").length },
          { key: "at-risk", label: "At Risk", count: atRisk },
          { key: "new", label: "New", count: customers.filter(c => c.status === "new" || c.relationship_type === "prospect").length },
          { key: "inactive", label: "Inactive", count: customers.filter(c => c.status === "inactive").length },
        ]}
        active={tab}
        onChange={k => setTab(k as Tab)}
      />

      {filtered.length === 0 && (
        <EmptyState icon={Users} title="No customers yet" description="Add your first customer to start tracking relationships" />
      )}

      {filtered.map((c) => {
        const health = c.health_score ?? 80;
        return (
          <SitaCard key={c.id} onClick={() => setSelectedId(c.id)} selected={selectedId === c.id}
            lane={health < 50 ? "action" : health >= 80 ? "opportunity" : undefined} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/8 font-display text-sm font-semibold text-primary shrink-0">{initials(c.name)}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                    <span className={`inline-flex items-center rounded-md border px-1.5 py-px text-[10px] font-medium capitalize ${c.status === "active" ? "bg-chart-2/10 text-chart-2 border-chart-2/20" : "bg-muted text-muted-foreground border-border"}`}>{c.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{c.company ? `${c.company} · ` : ""}{c.relationship_type || "Client"} · {timeAgo(c.last_contact_at)}</p>
                </div>
              </div>
              <div className="text-right shrink-0 space-y-1">
                <p className="font-display text-sm font-semibold text-foreground">${(c.lifetime_revenue || 0).toLocaleString()}</p>
                <div className="flex items-center justify-end gap-1.5">
                  <div className="h-1.5 w-8 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full rounded-full ${healthBg(health)}`} style={{ width: `${health}%` }} />
                  </div>
                  <span className={`text-[10px] font-bold ${healthColor(health)}`}>{health}%</span>
                </div>
              </div>
            </div>
          </SitaCard>
        );
      })}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <ModuleWorkspace
        domain="business"
        title="Customers"
        icon={Users}
        actions={
          <div className="flex gap-2">
            <SitaButton variant="ghost" size="sm" onClick={() => navigate("/business/integrations")}><Plug className="h-3.5 w-3.5" /> Integrations</SitaButton>
            <SitaButton variant="secondary" size="sm" onClick={() => { if (customers.length > 0) crmSync.syncCustomers.mutate(customers.map(c => ({ name: c.name, email: c.email || "unknown@example.com", phone: c.phone || undefined, company: c.company || undefined }))); }} disabled={crmSync.syncCustomers.isPending || customers.length === 0}><RefreshCw className={`h-3.5 w-3.5 ${crmSync.syncCustomers.isPending ? "animate-spin" : ""}`} /> Sync</SitaButton>
            <SitaButton variant="primary" size="sm" onClick={() => setShowAdd(true)}><Plus className="h-3.5 w-3.5" /> Add</SitaButton>
          </div>
        }
        kpiStrip={
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KPITile label="Total Customers" value={customers.length} icon={Users} />
            <KPITile label="Lifetime Revenue" value={`$${(totalRevenue / 1000).toFixed(0)}K`} trend="up" icon={DollarSign} />
            <KPITile label="Avg Health" value={`${avgHealth}%`} icon={Heart} sub={avgHealth >= 80 ? "Excellent" : avgHealth >= 50 ? "Good" : "Needs attention"} />
            <KPITile label="At Risk" value={atRisk} icon={AlertTriangle} sub={atRisk === 0 ? "All healthy" : "Needs attention"} />
          </div>
        }
        list={listContent}
        detail={selected ? <CustomerDetailPane customer={selected} onDelete={(id) => deleteCustomer.mutate(id)} /> : undefined}
        detailActive={!!selected}
        onCloseDetail={() => setSelectedId(null)}
        advisor={
          <DomainAdvisorCard
            domain="business"
            insights={[
              { id: "crm-1", text: customers.length > 0 ? `${atRisk} customer${atRisk !== 1 ? 's' : ''} at risk — prioritize re-engagement` : "Add your first customer to get started", confidence: 85, action: atRisk > 0 ? "View at-risk" : undefined, onAction: () => setTab("at-risk") },
              ...(customers.length > 5 ? [{ id: "crm-2", text: `Average health score ${avgHealth}% — ${avgHealth >= 80 ? 'excellent' : 'needs attention'}`, confidence: 90 }] : []),
            ]}
          />
        }
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
