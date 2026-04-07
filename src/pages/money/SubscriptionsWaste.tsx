import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { SectionSkeleton, KPISkeleton } from "@/components/sita/SectionSkeleton";
import { KPITile, SitaTabs, EmptyState, ContextDrawer, OpportunityCard } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { SubscriptionTrendsChart, SubscriptionCategoryChart } from "@/components/sita/SitaCharts";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { CreditCard, AlertTriangle, TrendingDown, CheckCircle, XCircle, Eye, Sparkles, Calendar, DollarSign, Plus, Trash2, Pencil, Pause, Play } from "lucide-react";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useConfirmation } from "@/hooks/use-confirmation";
import { ConfirmationDialog } from "@/components/sita/ConfirmationDialog";
import { DataFreshnessBadge } from "@/components/sita/DataFreshnessBadge";
import { useQueryFreshness } from "@/hooks/use-query-freshness";

interface SubForm {
  service_name: string;
  amount: string;
  billing_cycle: string;
  category: string;
  renewal_date: string;
  usage_level: string;
  waste_flag: boolean;
  duplicate_of: string;
  notes: string;
}

const emptyForm: SubForm = { service_name: "", amount: "", billing_cycle: "monthly", category: "", renewal_date: "", usage_level: "unknown", waste_flag: false, duplicate_of: "", notes: "" };

const usageLabelMap: Record<string, { label: string; color: string }> = {
  high: { label: "High", color: "text-trust-verified" },
  medium: { label: "Medium", color: "text-foreground" },
  low: { label: "Low", color: "text-urgency-high" },
  none: { label: "Very Low", color: "text-urgency-critical" },
  unknown: { label: "Unknown", color: "text-muted-foreground" },
};

const SubscriptionsWaste = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { confirmation, confirm } = useConfirmation();
  const [tab, setTab] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<SubForm>(emptyForm);

  const subsQuery = useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const { data, error } = await fromTable("subscriptions").select("*").order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
  const subscriptions = subsQuery.data ?? [];
  const isLoading = subsQuery.isLoading;
  const freshness = useQueryFreshness(subsQuery);

  const createMutation = useMutation({
    mutationFn: async (sub: SubForm) => {
      const { error } = await fromTable("subscriptions").insert([{
        name: sub.service_name,
        amount: parseFloat(sub.amount),
        frequency: sub.billing_cycle,
        category: sub.category || null,
        next_billing_date: sub.renewal_date || null,
        notes: sub.notes || null,
        user_id: user!.id,
      }]);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["subscriptions"] }); setShowForm(false); setForm(emptyForm); toast.success("Subscription added"); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, sub }: { id: string; sub: SubForm }) => {
      const { error } = await fromTable("subscriptions").update({
        name: sub.service_name,
        amount: parseFloat(sub.amount),
        frequency: sub.billing_cycle,
        category: sub.category || null,
        next_billing_date: sub.renewal_date || null,
        notes: sub.notes || null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["subscriptions"] }); setShowForm(false); setEditId(null); setForm(emptyForm); toast.success("Subscription updated"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await fromTable("subscriptions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["subscriptions"] }); setSelectedId(null); toast.success("Subscription deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await fromTable("subscriptions").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["subscriptions"] }); toast.success("Status updated"); },
    onError: (e: any) => toast.error(e.message),
  });

  const active = subscriptions.filter(s => s.status === "active");
  const totalMonthly = active.reduce((s, sub) => s + Number(sub.amount), 0);
  const wasteSubs = subscriptions.filter(s => (s as any).waste_flag && s.status === "active");
  const wasteMonthly = wasteSubs.reduce((s, sub) => s + Number(sub.amount), 0);
  const duplicates = subscriptions.filter(s => (s as any).duplicate_of);

  const filtered = tab === "all" ? subscriptions
    : tab === "waste" ? wasteSubs
    : tab === "paused" ? subscriptions.filter(s => s.status === "paused" || s.status === "cancelled")
    : duplicates;

  const selected = subscriptions.find(s => s.id === selectedId);

  const openEdit = (s: typeof subscriptions[0]) => {
    setForm({
      service_name: s.name,
      amount: String(s.amount),
      billing_cycle: s.frequency || "monthly",
      category: s.category || "",
      renewal_date: s.next_billing_date || "",
      usage_level: String(s.usage_score ?? "unknown"),
      waste_flag: (s as any).waste_flag || false,
      duplicate_of: (s as any).duplicate_of || "",
      notes: s.notes || "",
    });
    setEditId(s.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) updateMutation.mutate({ id: editId, sub: form });
    else createMutation.mutate(form);
  };

  const annualized = (amount: number, cycle: string | null) => {
    const multiplier = cycle === "weekly" ? 52 : cycle === "quarterly" ? 4 : cycle === "annually" ? 1 : 12;
    return amount * multiplier;
  };

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <ConfirmationDialog state={confirmation} />
      <SitaPageHeader
        title="Subscriptions & Waste"
        subtitle="Track, optimize, and reduce waste"
        actions={<div className="flex items-center gap-3"><DataFreshnessBadge {...freshness} /><SitaButton variant="primary" onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}><Plus className="h-4 w-4" /> Add Subscription</SitaButton></div>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Active Subscriptions" value={active.length} icon={CreditCard} />
        <KPITile label="Monthly Total" value={`$${totalMonthly.toFixed(0)}`} icon={DollarSign} sub={`$${(totalMonthly * 12).toFixed(0)}/yr`} />
        <KPITile label="Estimated Waste" value={`$${wasteMonthly.toFixed(0)}/mo`} icon={AlertTriangle} sub={`$${(wasteMonthly * 12).toFixed(0)} annual savings`} />
        <KPITile label="Flagged" value={wasteSubs.length} icon={Eye} sub="Review recommended" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SubscriptionTrendsChart />
        <SubscriptionCategoryChart />
      </div>

      {wasteSubs.length > 0 && (
        <OpportunityCard
          title={`Save up to $${(wasteMonthly * 12).toFixed(0)}/year by canceling ${wasteSubs.length} flagged subscriptions`}
          description="SITA detected low-usage, duplicate, and potentially unnecessary services"
          action="Review All Flagged"
        />
      )}

      <SitaTabs
        tabs={[
          { key: "all", label: "All", count: subscriptions.length },
          { key: "waste", label: "Likely Waste", count: wasteSubs.length },
          { key: "paused", label: "Paused/Cancelled", count: subscriptions.filter(s => s.status === "paused" || s.status === "cancelled").length },
          { key: "duplicates", label: "Duplicates", count: duplicates.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {isLoading ? (
        <><KPISkeleton count={4} /><SectionSkeleton cards={3} columns={1} /></>
      ) : subscriptions.length === 0 ? (
        <EmptyState icon={CreditCard} title="No subscriptions yet" description="Add your subscriptions to track spending, detect waste, and find savings" action={<SitaButton variant="primary" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Add Subscription</SitaButton>} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-2">
            {filtered.map((sub) => {
              const usage = usageLabelMap[sub.usage_level || "unknown"] || usageLabelMap.unknown;
              return (
                <SitaCard key={sub.id} onClick={() => setSelectedId(sub.id)} selected={selectedId === sub.id}
                  lane={sub.waste_flag ? "action" : undefined} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground">{sub.service_name}</p>
                        {sub.status === "paused" && <span className="text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-px">Paused</span>}
                        {sub.status === "cancelled" && <span className="text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-px line-through">Cancelled</span>}
                        {sub.waste_flag && <span className="inline-flex items-center gap-1 rounded-md bg-urgency-high/10 border border-urgency-high/20 px-1.5 py-px text-[10px] font-medium text-urgency-high"><AlertTriangle className="h-2.5 w-2.5" /> Waste</span>}
                        {sub.duplicate_of && <span className="text-[10px] text-trust-review bg-trust-review/10 rounded px-1.5 py-px">Duplicate</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{sub.category || "Uncategorized"} · Usage: {usage.label}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display text-sm font-bold text-foreground">${Number(sub.amount).toFixed(2)}/{sub.billing_cycle === "annually" ? "yr" : "mo"}</p>
                      <p className="text-[10px] text-muted-foreground">${annualized(Number(sub.amount), sub.billing_cycle).toFixed(0)}/yr</p>
                    </div>
                  </div>
                </SitaCard>
              );
            })}
            {filtered.length === 0 && <EmptyState icon={Eye} title="No subscriptions in this view" description="Try switching tabs or adding a subscription" />}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selected ? (
              <>
                <SitaCard hover={false} glow className="p-5">
                  <SitaCardTitle sub={selected.category || "Uncategorized"}>{selected.service_name}</SitaCardTitle>
                  <p className="mt-2 font-display text-2xl font-bold gradient-sita-text">${Number(selected.amount).toFixed(2)}/{selected.billing_cycle === "annually" ? "yr" : "mo"}</p>
                  <p className="text-xs text-muted-foreground">${annualized(Number(selected.amount), selected.billing_cycle).toFixed(0)}/year</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Usage</span><span className={`font-medium ${(usageLabelMap[selected.usage_level || "unknown"] || usageLabelMap.unknown).color}`}>{(usageLabelMap[selected.usage_level || "unknown"] || usageLabelMap.unknown).label}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Billing Cycle</span><span className="text-foreground capitalize">{selected.billing_cycle || "Monthly"}</span></div>
                    {selected.renewal_date && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Renewal</span><span className="text-foreground">{format(parseISO(selected.renewal_date), "MMM d, yyyy")}</span></div>}
                    {selected.duplicate_of && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Overlaps With</span><span className="text-trust-review">{selected.duplicate_of}</span></div>}
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><span className="text-foreground capitalize">{selected.status}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Waste Risk</span>{selected.waste_flag ? <TrustBadge level="degraded" label="High" size="sm" /> : <TrustBadge level="verified" label="Low" size="sm" />}</div>
                    {selected.notes && <div className="pt-2 border-t border-border"><p className="text-xs text-muted-foreground">{selected.notes}</p></div>}
                  </div>
                </SitaCard>

                {selected.waste_flag && (
                  <SitaCard hover={false}>
                    <SitaCardTitle>Recommended Action</SitaCardTitle>
                    <div className="mt-3 rounded-xl bg-accent/5 border border-accent/10 p-4">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Cancel {selected.service_name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Save ${annualized(Number(selected.amount), selected.billing_cycle).toFixed(0)}/year. {selected.duplicate_of ? `Use ${selected.duplicate_of} instead.` : "Usage doesn't justify the cost."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </SitaCard>
                )}

                <div className="flex gap-2 flex-wrap">
                  {selected.status === "active" && (
                    <>
                      <SitaButton variant="danger" size="sm" className="flex-1" onClick={() => statusMutation.mutate({ id: selected.id, status: "cancelled" })}><XCircle className="h-3.5 w-3.5" /> Cancel</SitaButton>
                      <SitaButton variant="secondary" size="sm" onClick={() => statusMutation.mutate({ id: selected.id, status: "paused" })}><Pause className="h-3.5 w-3.5" /> Pause</SitaButton>
                    </>
                  )}
                  {(selected.status === "paused" || selected.status === "cancelled") && (
                    <SitaButton variant="primary" size="sm" className="flex-1" onClick={() => statusMutation.mutate({ id: selected.id, status: "active" })}><Play className="h-3.5 w-3.5" /> Reactivate</SitaButton>
                  )}
                  <SitaButton variant="secondary" size="sm" onClick={() => openEdit(selected)}><Pencil className="h-3.5 w-3.5" /> Edit</SitaButton>
                  <SitaButton variant="danger" size="sm" onClick={async () => { if (await confirm({ title: "Delete this subscription?", description: "This subscription record will be permanently removed.", variant: "destructive" })) deleteMutation.mutate(selected.id); }}><Trash2 className="h-3.5 w-3.5" /></SitaButton>
                </div>
              </>
            ) : (
              <EmptyState icon={CreditCard} title="Select a subscription" description="Click on a subscription to see usage analysis, waste risk, and recommended actions" />
            )}
          </div>
        </div>
      )}

      {/* Form Drawer */}
      <ContextDrawer open={showForm} onClose={() => { setShowForm(false); setEditId(null); }} title={editId ? "Edit Subscription" : "Add Subscription"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Service Name *</label>
            <input className="mt-1 w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20" value={form.service_name} onChange={e => setForm({ ...form, service_name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Amount *</label>
              <input type="number" step="0.01" className="mt-1 w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Billing Cycle</label>
              <select className="mt-1 w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground focus:border-primary/40 focus:outline-none" value={form.billing_cycle} onChange={e => setForm({ ...form, billing_cycle: e.target.value })}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <input className="mt-1 w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Communication" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Renewal Date</label>
              <input type="date" className="mt-1 w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20" value={form.renewal_date} onChange={e => setForm({ ...form, renewal_date: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Usage Level</label>
            <select className="mt-1 w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground focus:border-primary/40 focus:outline-none" value={form.usage_level} onChange={e => setForm({ ...form, usage_level: e.target.value })}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="none">Very Low / None</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Duplicate Of</label>
            <input className="mt-1 w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Google Meet (free)" value={form.duplicate_of} onChange={e => setForm({ ...form, duplicate_of: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" className="rounded" checked={form.waste_flag} onChange={e => setForm({ ...form, waste_flag: e.target.checked })} /> Flag as likely waste
          </label>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Notes</label>
            <textarea className="mt-1 w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex gap-2 pt-2">
            <SitaButton type="submit" variant="primary" className="flex-1">{editId ? "Update Subscription" : "Add Subscription"}</SitaButton>
            <SitaButton type="button" variant="ghost" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</SitaButton>
          </div>
        </form>
      </ContextDrawer>

      <LiveAdvisorCard
        advisor="money"
        intent="subscription_audit"
        demoName="Waste Detection AI"
        demoRole="Subscription Advisor"
        demoConfidence="High"
        demoRecommendation="2 subscriptions flagged as likely waste — low usage and available free alternatives. Canceling both saves $336/year. Review Zoom Pro before Apr 6 renewal."
        demoReasoning="Based on usage analytics, cost-to-value ratio, duplicate detection, and renewal timing."
      />
    </motion.div>
  );
};

export default SubscriptionsWaste;
