import { SitaPageHeader, SitaCard, SitaCardTitle, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { StateBadge } from "@/components/sita/StateBadge";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, DollarSign, Clock, CheckCircle, AlertTriangle, Send, Edit, X, Trash2 } from "lucide-react";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";


interface QuotesWorkspaceRow {
  customers?: Record<string, unknown> | null;
  id?: string;
  status?: string;
  total?: unknown;
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground border-border" },
  sent: { label: "Sent", color: "bg-primary/10 text-primary border-primary/20" },
  accepted: { label: "Accepted", color: "bg-trust-verified/10 text-trust-verified border-trust-verified/20" },
  declined: { label: "Declined", color: "bg-urgency-critical/10 text-urgency-critical border-urgency-critical/20" },
  expired: { label: "Expired", color: "bg-trust-degraded/10 text-trust-degraded border-trust-degraded/20" },
};

const initials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

const QuotesWorkspace = () => {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", total: "", expiry_date: "", notes: "" });

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["quotes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await fromTable("quotes").select("*, customers(name)").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addQuote = useMutation({
    mutationFn: async () => {
      if (!user || !form.title.trim()) throw new Error("Title required");
      const { error } = await fromTable("quotes").insert({
        user_id: user.id, title: form.title.trim(), total: form.total ? parseFloat(form.total) : null,
        expiry_date: form.expiry_date || null, notes: form.notes || null, status: "draft",
      });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["quotes"] }); setShowAdd(false); setForm({ title: "", total: "", expiry_date: "", notes: "" }); toast.success("Quote created"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await fromTable("quotes").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["quotes"] }); toast.success("Status updated"); },
  });

  const deleteQuote = useMutation({
    mutationFn: async (id: string) => { const { error } = await fromTable("quotes").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["quotes"] }); setSelectedId(null); toast.success("Deleted"); },
  });

  const selected = quotes.find((q: QuotesWorkspaceRow) => q.id === selectedId);

  const filtered = tab === "all" ? quotes
    : tab === "active" ? quotes.filter((q: QuotesWorkspaceRow) => !["accepted", "declined", "expired"].includes(q.status))
    : tab === "action" ? quotes.filter((q: QuotesWorkspaceRow) => q.status === "draft" || q.status === "sent")
    : quotes.filter((q: QuotesWorkspaceRow) => ["accepted", "declined", "expired"].includes(q.status));

  const totalValue = quotes.reduce((sum: number, q: any) => sum + (q.total || 0), 0);
  const activeCount = quotes.filter((q: QuotesWorkspaceRow) => !["accepted", "declined", "expired"].includes(q.status)).length;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <SitaPageHeader title="Quotes & Proposals" subtitle="Create, review, and track" actions={
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"><Plus className="h-3.5 w-3.5" /> New Quote</button>
      } />

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <SitaCard className="p-5">
              <div className="flex items-center justify-between mb-4"><SitaCardTitle>New Quote</SitaCardTitle><button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Quote title *" className="col-span-2 rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
                <input type="number" value={form.total} onChange={e => setForm({ ...form, total: e.target.value })} placeholder="Total ($)" className="rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
                <input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} className="rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes" rows={2} className="col-span-2 rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={() => addQuote.mutate()} disabled={addQuote.isPending || !form.title.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">{addQuote.isPending ? "Creating..." : "Create Quote"}</button>
              </div>
            </SitaCard>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" variants={stagger} initial="hidden" animate="show">
        {[
          { label: "Active Quotes", value: String(activeCount), icon: FileText },
          { label: "Total Value", value: totalValue > 0 ? `$${(totalValue / 1000).toFixed(0)}K` : "$0", icon: DollarSign },
          { label: "Drafts", value: String(quotes.filter((q: QuotesWorkspaceRow) => q.status === "draft").length), icon: Edit },
          { label: "Accepted", value: String(quotes.filter((q: QuotesWorkspaceRow) => q.status === "accepted").length), icon: CheckCircle },
        ].map(kpi => <motion.div key={kpi.label} variants={fadeUp}><KPITile {...kpi} /></motion.div>)}
      </motion.div>

      <SitaTabs tabs={[
        { key: "all", label: "All", count: quotes.length },
        { key: "active", label: "Active", count: activeCount },
        { key: "action", label: "Drafts & Sent", count: quotes.filter((q: QuotesWorkspaceRow) => ["draft", "sent"].includes(q.status)).length },
        { key: "closed", label: "Closed" },
      ]} active={tab} onChange={setTab} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-2">
          {isLoading ? <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}</div>
          : filtered.length === 0 ? <EmptyState icon={FileText} title="No quotes" description={quotes.length === 0 ? "Create your first quote to get started" : "Try a different filter"} />
          : (
            <motion.div className="space-y-2" variants={stagger} initial="hidden" animate="show">
              {filtered.map((q: QuotesWorkspaceRow) => {
                const st = statusLabels[q.status] || statusLabels.draft;
                const customerName = q.customers?.name;
                return (
                  <motion.div key={q.id} variants={fadeUp} layout>
                    <SitaCard onClick={() => setSelectedId(q.id)} selected={selectedId === q.id} lane={q.status === "draft" ? undefined : q.status === "accepted" ? "opportunity" : undefined} className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/8 font-display text-sm font-semibold text-primary shrink-0">{initials(q.title)}</div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{q.title}</p>
                            <p className="text-xs text-muted-foreground">{customerName || "No customer"} · {new Date(q.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-display text-sm font-semibold text-foreground">{q.total ? `$${Number(q.total).toLocaleString()}` : "—"}</p>
                          <span className={`inline-flex items-center rounded-md border px-1.5 py-px text-[10px] font-medium mt-1 ${st.color}`}>{st.label}</span>
                        </div>
                      </div>
                    </SitaCard>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              <SitaCard hover={false} glow className="p-5">
                <SitaCardTitle sub={`${selected.customers?.name || "No customer"} · Created ${new Date(selected.created_at).toLocaleDateString()}`}>{selected.title}</SitaCardTitle>
                <p className="mt-2 font-display text-2xl font-bold gradient-sita-text">{selected.total ? `$${Number(selected.total).toLocaleString()}` : "—"}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><span className={`inline-flex items-center rounded-md border px-1.5 py-px text-[10px] font-medium ${(statusLabels[selected.status] || statusLabels.draft).color}`}>{(statusLabels[selected.status] || statusLabels.draft).label}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Revisions</span><span className="text-foreground">{selected.revision_count || 0}</span></div>
                  {selected.expiry_date && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Expires</span><span className="text-foreground">{new Date(selected.expiry_date).toLocaleDateString()}</span></div>}
                  {selected.notes && <div className="text-sm"><span className="text-muted-foreground">Notes: </span><span className="text-foreground">{selected.notes}</span></div>}
                </div>
              </SitaCard>
              <div className="flex gap-2 flex-wrap">
                {selected.status === "draft" && <button onClick={() => updateStatus.mutate({ id: selected.id, status: "sent" })} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"><Send className="h-3.5 w-3.5" /> Mark Sent</button>}
                {selected.status === "sent" && <button onClick={() => updateStatus.mutate({ id: selected.id, status: "accepted" })} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"><CheckCircle className="h-3.5 w-3.5" /> Mark Accepted</button>}
                <button onClick={() => deleteQuote.mutate(selected.id)} className="rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </>
          ) : <EmptyState icon={FileText} title="Select a quote" description="Click on a quote to see details and actions" />}
        </div>
      </div>
      <LiveAdvisorCard
        advisor="business"
        intent="quote_optimization"
        demoName="Quote Intelligence"
        demoRole="Proposals Advisor"
        demoConfidence="Medium"
        demoRecommendation="2 quotes are aging past 7 days without response — win rate drops 40% after 10 days. Consider a brief follow-up call or revised offer."
        demoReasoning="Based on quote response time analysis and historical acceptance patterns."
      />
    </motion.div>
  );
};

export default QuotesWorkspace;
