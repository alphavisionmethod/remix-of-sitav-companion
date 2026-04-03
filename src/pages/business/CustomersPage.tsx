import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState, CustomerRow, TimelineItem } from "@/components/sita/SitaComponents";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { TrustBadge, TrustLevel } from "@/components/sita/TrustBadge";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users, Search, DollarSign, Heart, AlertTriangle, TrendingUp, Star, Phone, Mail,
  Building, Clock, CheckCircle, Plus, ArrowRight, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import CustomerAutopilotPanel from "@/components/autopilot/CustomerAutopilotPanel";

interface Customer {
  id: string; name: string; company: string | null; email: string | null; phone: string | null;
  status: string; relationship_type: string | null; health_score: number | null;
  lifetime_revenue: number | null; last_contact_at: string | null; created_at: string; notes: string | null;
}

const healthColor = (score: number | null) => {
  if (!score) return "text-muted-foreground";
  if (score >= 80) return "text-chart-2";
  if (score >= 50) return "text-amber-500";
  return "text-destructive";
};

const healthBg = (score: number | null) => {
  if (!score) return "bg-muted";
  if (score >= 80) return "bg-chart-2";
  if (score >= 50) return "bg-amber-500";
  return "bg-destructive";
};

const trustFromHealth = (score: number | null): TrustLevel => {
  if (!score) return "low-confidence";
  if (score >= 80) return "verified";
  if (score >= 50) return "review";
  return "degraded";
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

type Tab = "all" | "active" | "at-risk" | "new" | "inactive";

const CustomersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("customers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Customer[];
    },
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
      <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <SitaPageHeader title="Customers" subtitle="Your client relationships" />
        <div className="flex items-center justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
      </motion.div>
    );
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SitaPageHeader
        title="Customers"
        subtitle="Relationships, health scores, and revenue intelligence"
        actions={<SitaButton variant="primary"><Plus className="h-4 w-4" /> Add Customer</SitaButton>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPITile label="Total Customers" value={customers.length} icon={Users} />
        <KPITile label="Lifetime Revenue" value={`$${(totalRevenue / 1000).toFixed(0)}K`} trend="up" icon={DollarSign} />
        <KPITile label="Avg Health" value={`${avgHealth}%`} icon={Heart} sub={avgHealth >= 80 ? "Excellent" : avgHealth >= 50 ? "Good" : "Needs attention"} />
        <KPITile label="At Risk" value={atRisk} icon={AlertTriangle} sub={atRisk === 0 ? "All healthy" : "Needs attention"} />
        <KPITile label="Active" value={customers.filter(c => c.status === "active").length} icon={CheckCircle} />
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

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary/40 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Search customers..."
            />
          </div>

          {filtered.length === 0 && (
            <EmptyState icon={Users} title="No customers yet" description="Add your first customer to start tracking relationships" />
          )}

          {filtered.map((c) => {
            const health = c.health_score ?? 80;
            return (
              <SitaCard
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                selected={selectedId === c.id}
                lane={health < 50 ? "action" : health >= 80 ? "opportunity" : undefined}
                className="p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/8 font-display text-sm font-semibold text-primary shrink-0">{initials(c.name)}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                        <span className={`inline-flex items-center rounded-md border px-1.5 py-px text-[10px] font-medium capitalize ${c.status === "active" ? "bg-chart-2/10 text-chart-2 border-chart-2/20" : "bg-muted text-muted-foreground border-border"}`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {c.company ? `${c.company} · ` : ""}{c.relationship_type || "Client"} · {timeAgo(c.last_contact_at)}
                      </p>
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

        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              <SitaCard hover={false} glow className="text-center p-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-sita font-display text-xl font-bold text-primary-foreground">{initials(selected.name)}</div>
                <h3 className="mt-4 font-display text-lg font-bold text-foreground">{selected.name}</h3>
                {selected.company && <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Building className="h-3 w-3" />{selected.company}</p>}
                {selected.email && <p className="text-xs text-muted-foreground">{selected.email}</p>}
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize ${selected.status === "active" ? "bg-chart-2/10 text-chart-2 border-chart-2/20" : "bg-muted text-muted-foreground border-border"}`}>{selected.status}</span>
                  <TrustBadge level={trustFromHealth(selected.health_score)} size="sm" />
                </div>
                <div className="mt-4 flex gap-2">
                  <SitaButton variant="accent" size="sm" className="flex-1"><Phone className="h-3.5 w-3.5" /> Call</SitaButton>
                  <SitaButton variant="accent" size="sm" className="flex-1"><Mail className="h-3.5 w-3.5" /> Email</SitaButton>
                  <SitaButton variant="primary" size="sm" className="flex-1" onClick={() => navigate(`/business/customers/${selected.id}`)}><ArrowRight className="h-3.5 w-3.5" /> Detail</SitaButton>
                </div>
              </SitaCard>

              <SitaCard hover={false}>
                <SitaCardTitle>Relationship Summary</SitaCardTitle>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Lifetime Revenue</span><span className="font-semibold text-foreground">${(selected.lifetime_revenue || 0).toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Health Score</span><span className={`font-semibold ${healthColor(selected.health_score)}`}>{selected.health_score ?? 80}%</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Last Contact</span><span className="text-foreground">{timeAgo(selected.last_contact_at)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Type</span><span className="text-foreground capitalize">{selected.relationship_type || "Client"}</span></div>
                </div>
              </SitaCard>

              {selected.notes && (
                <SitaCard hover={false}>
                  <SitaCardTitle>Notes</SitaCardTitle>
                  <p className="mt-2 text-sm text-foreground leading-relaxed">{selected.notes}</p>
                </SitaCard>
              )}
            </>
          ) : (
            <EmptyState icon={Users} title="Select a customer" description="Click on a customer to see relationship details, health score, and revenue history" />
          )}

          {/* Advisor */}
          <LiveAdvisorCard
            advisor="business"
            intent="customer_health"
            context={{ customer_count: customers.length, total_revenue: totalRevenue, at_risk: atRisk }}
            demoName="Relationship Advisor"
            demoRole="Customer Intelligence"
            demoConfidence="High"
            demoRecommendation={customers.length > 0
              ? `You have ${customers.length} customers generating $${(totalRevenue / 1000).toFixed(0)}K in lifetime revenue. ${atRisk > 0 ? `${atRisk} customer${atRisk > 1 ? 's are' : ' is'} at risk — prioritize re-engagement.` : 'All relationships are healthy.'}`
              : "Start by adding your first customer to begin tracking relationships and revenue intelligence."
            }
            demoReasoning="Based on customer health scores, contact frequency, and revenue patterns."
          />
        </div>
      </div>

      {/* Revenue Autopilot Intelligence */}
      <CustomerAutopilotPanel customers={customers.map(c => ({
        id: c.id, name: c.name, status: c.status,
        health_score: c.health_score, lifetime_revenue: c.lifetime_revenue,
        last_contact_at: c.last_contact_at, company: c.company,
        email: c.email, phone: c.phone,
      }))} />
    </motion.div>
  );
};

export default CustomersPage;
