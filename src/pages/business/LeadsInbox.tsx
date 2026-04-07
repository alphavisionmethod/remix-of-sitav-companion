import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { SectionSkeleton, KPISkeleton } from "@/components/sita/SectionSkeleton";
import { KPITile, CustomerRow, EmptyState, SitaTabs, AdvisorCard, TimelineItem, OpportunityCard } from "@/components/sita/SitaComponents";
import { TrustBadge, TrustLevel } from "@/components/sita/TrustBadge";
import { StateBadge, ExecutionState } from "@/components/sita/StateBadge";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Search, Plus, Phone, Mail, Clock, User, Filter, Sparkles, CheckCircle, FileText, Calendar,
  MessageSquare, Archive, Star, ArrowRight, LayoutList, Columns, Target, AlertTriangle, X, Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useConfirmation } from "@/hooks/use-confirmation";
import { ConfirmationDialog } from "@/components/sita/ConfirmationDialog";
import { DataFreshnessBadge } from "@/components/sita/DataFreshnessBadge";
import { useQueryFreshness } from "@/hooks/use-query-freshness";
import { useCRMSync } from "@/hooks/use-backend-actions";
import { RefreshCw } from "lucide-react";

interface Lead {
  id: string; name: string; company?: string | null; source: string | null; status: string;
  email?: string | null; phone?: string | null;
  likely_value: number | null; opportunity_score: number | null; next_action: string | null;
  last_contact_at: string | null; stale_risk: boolean | null; notes: string | null;
  urgency: string | null; created_at: string;
}

const statusLabel: Record<string, string> = {
  new: "New", contacted: "Contacted", warm: "Warm", "waiting-response": "Waiting on Them",
  "waiting-you": "Waiting on You", "callback-due": "Callback Due", stale: "Stale", qualified: "Qualified",
};

const statusColor: Record<string, string> = {
  new: "bg-primary/10 text-primary border-primary/20", contacted: "bg-state-drafted/10 text-state-drafted border-state-drafted/20",
  warm: "bg-accent/10 text-accent border-accent/20", "waiting-response": "bg-state-queued/10 text-state-queued border-state-queued/20",
  "waiting-you": "bg-urgency-high/10 text-urgency-high border-urgency-high/20", "callback-due": "bg-urgency-critical/10 text-urgency-critical border-urgency-critical/20",
  stale: "bg-trust-degraded/10 text-trust-degraded border-trust-degraded/20", qualified: "bg-trust-verified/10 text-trust-verified border-trust-verified/20",
};

const trustFromScore = (score: number | null): TrustLevel => {
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
  return `${days}d ago`;
};

type Tab = "all" | "urgent" | "new" | "warm" | "stale" | "qualified";

const LeadsInbox = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { confirmation, confirm } = useConfirmation();
  const [tab, setTab] = useState<Tab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "board">("list");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  // Form state for add/edit
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formSource, setFormSource] = useState("Website");
  const [formValue, setFormValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const leadsQuery = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
  });
  const leads = leadsQuery.data ?? [];
  const isLoading = leadsQuery.isLoading;
  const freshness = useQueryFreshness(leadsQuery);

  const addMutation = useMutation({
    mutationFn: async (lead: { name: string; email?: string; phone?: string; company?: string; source?: string; likely_value?: number }) => {
      const { error } = await (supabase as any).from("leads").insert({ ...lead, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["leads"] }); toast.success("Lead added"); resetForm(); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lead> & { id: string }) => {
      const { error } = await (supabase as any).from("leads").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["leads"] }); toast.success("Lead updated"); resetForm(); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["leads"] }); setSelectedId(null); toast.success("Lead deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  const resetForm = () => {
    setShowAdd(false); setEditingId(null);
    setFormName(""); setFormEmail(""); setFormPhone(""); setFormCompany(""); setFormSource("Website"); setFormValue("");
  };

  const openEdit = (lead: Lead) => {
    setEditingId(lead.id);
    setFormName(lead.name);
    setFormEmail(lead.email || "");
    setFormPhone(lead.phone || "");
    setFormCompany(lead.company || "");
    setFormSource(lead.source || "Website");
    setFormValue(lead.likely_value ? String(lead.likely_value) : "");
    setShowAdd(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formName,
      email: formEmail || undefined,
      phone: formPhone || undefined,
      company: formCompany || undefined,
      source: formSource || undefined,
      likely_value: formValue ? Number(formValue) : undefined,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  const selected = leads.find(l => l.id === selectedId);

  const filtered = leads
    .filter(l => !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.company?.toLowerCase().includes(search.toLowerCase()))
    .filter(l => {
      if (tab === "all") return true;
      if (tab === "urgent") return l.status === "callback-due" || l.status === "waiting-you" || l.stale_risk;
      if (tab === "new") return l.status === "new";
      if (tab === "warm") return l.status === "warm" || l.status === "qualified";
      if (tab === "stale") return l.stale_risk;
      if (tab === "qualified") return l.status === "qualified";
      return true;
    });

  const pipelineValue = leads.reduce((s, l) => s + (l.likely_value || 0), 0);
  const avgScore = leads.length ? Math.round(leads.reduce((s, l) => s + (l.opportunity_score || 0), 0) / leads.length) : 0;

  if (isLoading) {
    return (
      <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <ConfirmationDialog state={confirmation} />
        <SitaPageHeader title="Leads Inbox" subtitle="Capture, qualify, and convert" />
        <KPISkeleton count={4} />
        <SectionSkeleton cards={4} columns={2} />
      </motion.div>
    );
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SitaPageHeader
        title="Leads Inbox"
        subtitle="Capture, qualify, and convert"
        actions={<div className="flex items-center gap-3"><DataFreshnessBadge {...freshness} /><SitaButton variant="primary" onClick={() => { resetForm(); setShowAdd(true); }}><Plus className="h-4 w-4" /> Add Lead</SitaButton></div>}
      />

      {/* Add/Edit Modal */}
      {showAdd && (
        <SitaCard hover={false} className="p-5 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <SitaCardTitle>{editingId ? "Edit Lead" : "Add New Lead"}</SitaCardTitle>
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <input required value={formName} onChange={e => setFormName(e.target.value)} placeholder="Name *" className="rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none" />
            <input value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="Email" type="email" className="rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none" />
            <input value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="Phone" className="rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none" />
            <input value={formCompany} onChange={e => setFormCompany(e.target.value)} placeholder="Company" className="rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none" />
            <select value={formSource} onChange={e => setFormSource(e.target.value)} className="rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground focus:border-primary/40 focus:outline-none">
              <option>Website</option><option>Referral</option><option>Google Ads</option><option>LinkedIn</option><option>Cold Email</option><option>Other</option>
            </select>
            <input value={formValue} onChange={e => setFormValue(e.target.value)} placeholder="Estimated value ($)" type="number" className="rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none" />
            <div className="sm:col-span-2 flex gap-2 justify-end">
              <SitaButton variant="ghost" size="sm" onClick={resetForm}>Cancel</SitaButton>
              <SitaButton variant="primary" size="sm" type="submit">{editingId ? "Update" : "Add Lead"}</SitaButton>
            </div>
          </form>
        </SitaCard>
      )}

      {/* Lead Aging Detection */}
      {leads.filter(l => l.stale_risk).length > 0 && (
        <SitaCard hover={false} className="p-4 border-l-4 border-l-[hsl(var(--sita-gold))]">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="h-4 w-4 text-[hsl(var(--sita-gold))]" />
            <span className="text-sm font-semibold text-foreground">Lead Aging Alert</span>
            <span className="text-[10px] bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))] rounded-full px-2 py-0.5 font-medium">{leads.filter(l => l.stale_risk).length} going stale</span>
          </div>
          <div className="space-y-1.5">
            {leads.filter(l => l.stale_risk).slice(0, 3).map((lead) => {
              const daysSince = lead.last_contact_at ? Math.floor((Date.now() - new Date(lead.last_contact_at).getTime()) / 86400000) : 0;
              return (
                <div key={lead.id} onClick={() => setSelectedId(lead.id)} className="flex items-center gap-3 rounded-lg bg-secondary/30 px-3 py-2 cursor-pointer hover:bg-secondary/50 transition-colors">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold ${daysSince > 7 ? "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]" : "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]"}`}>
                    {daysSince}d
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-foreground truncate">{lead.name}{lead.company ? ` · ${lead.company}` : ""}</p>
                    <p className="text-[10px] text-muted-foreground">{lead.likely_value ? `$${lead.likely_value.toLocaleString()} at risk` : "No contact in " + daysSince + " days"}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{lead.next_action || "Follow up"}</span>
                </div>
              );
            })}
          </div>
        </SitaCard>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPITile label="Total Leads" value={leads.length} icon={User} />
        <KPITile label="Callbacks Due" value={leads.filter(l => l.status === "callback-due").length} icon={Phone} sub="Today" />
        <KPITile label="Stale Risk" value={leads.filter(l => l.stale_risk).length} icon={AlertTriangle} sub="Needs attention" />
        <KPITile label="Pipeline Value" value={`$${pipelineValue.toLocaleString()}`} trend="up" icon={Target} />
        <KPITile label="Avg Score" value={String(avgScore)} sub="Opportunity confidence" icon={Star} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <SitaTabs
          tabs={[
            { key: "all", label: "All", count: leads.length },
            { key: "urgent", label: "Urgent", count: leads.filter(l => l.status === "callback-due" || l.status === "waiting-you" || l.stale_risk).length },
            { key: "new", label: "New", count: leads.filter(l => l.status === "new").length },
            { key: "warm", label: "Warm", count: leads.filter(l => l.status === "warm" || l.status === "qualified").length },
            { key: "stale", label: "Stale", count: leads.filter(l => l.stale_risk).length },
          ]}
          active={tab}
          onChange={k => setTab(k as Tab)}
        />
        <div className="flex gap-1">
          <SitaButton variant={view === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setView("list")}><LayoutList className="h-3.5 w-3.5" /></SitaButton>
          <SitaButton variant={view === "board" ? "secondary" : "ghost"} size="sm" onClick={() => setView("board")}><Columns className="h-3.5 w-3.5" /></SitaButton>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary/40 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Search leads..."
            />
          </div>

          {filtered.length === 0 && (
            <EmptyState icon={User} title="No leads yet" description="Add your first lead to get started with your pipeline" />
          )}

          {filtered.map((lead) => {
            const score = lead.opportunity_score || 0;
            return (
              <SitaCard
                key={lead.id}
                onClick={() => setSelectedId(lead.id)}
                selected={selectedId === lead.id}
                lane={lead.stale_risk ? "action" : score >= 80 ? "opportunity" : undefined}
                className="p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/8 font-display text-sm font-semibold text-primary shrink-0">{initials(lead.name)}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                        <span className={`inline-flex items-center rounded-md border px-1.5 py-px text-[10px] font-medium ${statusColor[lead.status] || statusColor.new}`}>
                          {statusLabel[lead.status] || lead.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {lead.company ? `${lead.company} · ` : ""}{lead.source || "Direct"} · {timeAgo(lead.last_contact_at || lead.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <p className="font-display text-sm font-semibold text-foreground">${(lead.likely_value || 0).toLocaleString()}</p>
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-[10px] text-muted-foreground">Score</span>
                      <span className={`text-xs font-bold ${score >= 70 ? "text-trust-verified" : score >= 40 ? "text-trust-review" : "text-trust-degraded"}`}>{score}</span>
                    </div>
                  </div>
                </div>
                {lead.next_action && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-accent" />
                    <span>{lead.next_action}</span>
                  </div>
                )}
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
                {selected.company && <p className="text-xs text-muted-foreground">{selected.company}</p>}
                {selected.email && <p className="text-xs text-muted-foreground">{selected.email}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{selected.source || "Direct"} · {timeAgo(selected.created_at)}</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${statusColor[selected.status] || statusColor.new}`}>
                    {statusLabel[selected.status] || selected.status}
                  </span>
                  <TrustBadge level={trustFromScore(selected.opportunity_score)} size="sm" />
                </div>
                <div className="mt-4 flex gap-2">
                  <SitaButton variant="accent" size="sm" className="flex-1" onClick={() => openEdit(selected)}><FileText className="h-3.5 w-3.5" /> Edit</SitaButton>
                  <SitaButton variant="accent" size="sm" className="flex-1"><Mail className="h-3.5 w-3.5" /> Email</SitaButton>
                  <SitaButton variant="accent" size="sm" className="flex-1"><Clock className="h-3.5 w-3.5" /> Schedule</SitaButton>
                </div>
              </SitaCard>

              <SitaCard hover={false}>
                <SitaCardTitle>Opportunity Score</SitaCardTitle>
                <div className="mt-3 flex items-center gap-4">
                  <div className={`font-display text-3xl font-bold ${(selected.opportunity_score || 0) >= 70 ? "text-trust-verified" : (selected.opportunity_score || 0) >= 40 ? "text-trust-review" : "text-trust-degraded"}`}>
                    {selected.opportunity_score || 0}
                  </div>
                  <div className="flex-1">
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${(selected.opportunity_score || 0) >= 70 ? "bg-trust-verified" : (selected.opportunity_score || 0) >= 40 ? "bg-trust-review" : "bg-trust-degraded"}`} style={{ width: `${selected.opportunity_score || 0}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Estimated value: ${(selected.likely_value || 0).toLocaleString()}</p>
                  </div>
                </div>
              </SitaCard>

              {selected.next_action && (
                <SitaCard hover={false}>
                  <SitaCardTitle>Next Best Action</SitaCardTitle>
                  <div className="mt-3 rounded-xl bg-accent/5 border border-accent/10 p-4">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{selected.next_action}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Based on lead stage, source quality, and engagement patterns</p>
                      </div>
                    </div>
                  </div>
                </SitaCard>
              )}

              {selected.notes && (
                <SitaCard hover={false}>
                  <SitaCardTitle>Notes</SitaCardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">{selected.notes}</p>
                </SitaCard>
              )}

              <div className="flex gap-2 flex-wrap">
                <SitaButton variant="secondary" size="sm" onClick={() => openEdit(selected)}><FileText className="h-3.5 w-3.5" /> Edit Lead</SitaButton>
                <SitaButton variant="ghost" size="sm" onClick={async () => { if (await confirm({ title: "Delete this lead?", description: "This lead will be permanently removed.", variant: "destructive" })) deleteMutation.mutate(selected.id); }}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </SitaButton>
              </div>
            </>
          ) : (
            <EmptyState icon={User} title="Select a lead" description="Click on a lead to see their profile, opportunity score, and recommended next actions" />
          )}
        </div>
      </div>
      <LiveAdvisorCard
        advisor="business"
        intent="lead_management"
        demoName="Lead Intelligence"
        demoRole="Pipeline Advisor"
        demoConfidence="High"
        demoRecommendation="3 leads are going stale — prioritize callbacks for Sarah Chen and David Torres. Cold leads over 14 days lose 60% conversion probability."
        demoReasoning="Based on lead aging analysis, opportunity scores, and historical conversion data."
      />
    </motion.div>
  );
};

export default LeadsInbox;
