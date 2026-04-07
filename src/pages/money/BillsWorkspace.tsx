import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { SectionSkeleton, KPISkeleton } from "@/components/sita/SectionSkeleton";
import { KPITile, SitaTabs, EmptyState, ContextDrawer } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBills as useMoneyBills } from "@/hooks/use-money-data";
import { useAuth } from "@/contexts/AuthContext";
import { DollarSign, Clock, AlertTriangle, CheckCircle, Calendar, Receipt, Bell, FileText, CreditCard, Plus, Trash2, Zap } from "lucide-react";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { toast } from "sonner";
import { format, differenceInDays, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { simulatePayment, type PaymentSimulation } from "@/lib/core-services/payment-execution";
import { initiatePayment } from "@/lib/api/payment-api";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useConfirmation } from "@/hooks/use-confirmation";
import { ConfirmationDialog } from "@/components/sita/ConfirmationDialog";
import { DataFreshnessBadge } from "@/components/sita/DataFreshnessBadge";
import { useQueryFreshness } from "@/hooks/use-query-freshness";

interface BillForm {
  payee: string;
  amount: string;
  due_date: string;
  category: string;
  recurring: boolean;
  frequency: string;
  auto_pay: boolean;
  notes: string;
}

const emptyForm: BillForm = { payee: "", amount: "", due_date: "", category: "", recurring: false, frequency: "monthly", auto_pay: false, notes: "" };

const statusFromDue = (due: string, dbStatus: string): string => {
  if (dbStatus === "paid") return "paid";
  if (dbStatus === "scheduled") return "scheduled";
  const days = differenceInDays(parseISO(due), new Date());
  if (days < 0) return "overdue";
  if (days <= 3) return "due";
  return "upcoming";
};

const statusConfig: Record<string, { label: string; color: string }> = {
  due: { label: "Due", color: "bg-urgency-high/10 text-urgency-high border-urgency-high/20" },
  upcoming: { label: "Upcoming", color: "bg-state-queued/10 text-state-queued border-state-queued/20" },
  overdue: { label: "Overdue", color: "bg-urgency-critical/10 text-urgency-critical border-urgency-critical/20" },
  paid: { label: "Paid", color: "bg-trust-verified/10 text-trust-verified border-trust-verified/20" },
  scheduled: { label: "Scheduled", color: "bg-state-approved/10 text-state-approved border-state-approved/20" },
};

const BillsWorkspace = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { confirmation, confirm } = useConfirmation();
  const [tab, setTab] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BillForm>(emptyForm);

  // Use canonical hook for bill reads (wired from use-money-data)
  const moneyBills = useMoneyBills();
  const billsQuery = useQuery({
    queryKey: ["bills"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bills").select("*").order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    // Fallback to moneyBills data if this query hasn't loaded yet
    placeholderData: moneyBills.data as any,
  });
  const bills = billsQuery.data ?? [];
  const isLoading = billsQuery.isLoading;
  const freshness = useQueryFreshness(billsQuery);

  const createMutation = useMutation({
    mutationFn: async (bill: BillForm) => {
      const { error } = await supabase.from("bills").insert({
        payee: bill.payee,
        amount: parseFloat(bill.amount),
        due_date: bill.due_date,
        category: bill.category || null,
        recurring: bill.recurring,
        frequency: bill.recurring ? bill.frequency : null,
        auto_pay: bill.auto_pay,
        notes: bill.notes || null,
        user_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["bills"] }); setShowForm(false); setForm(emptyForm); toast.success("Bill created"); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, bill }: { id: string; bill: BillForm }) => {
      const { error } = await supabase.from("bills").update({
        payee: bill.payee,
        amount: parseFloat(bill.amount),
        due_date: bill.due_date,
        category: bill.category || null,
        recurring: bill.recurring,
        frequency: bill.recurring ? bill.frequency : null,
        auto_pay: bill.auto_pay,
        notes: bill.notes || null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["bills"] }); setShowForm(false); setEditId(null); setForm(emptyForm); toast.success("Bill updated"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bills").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["bills"] }); setSelectedId(null); toast.success("Bill deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  const markPaidMutation = useMutation({
    mutationFn: async (id: string) => {
      const bill = enriched.find(b => b.id === id);
      if (bill && user) {
        // Fire payment-process edge function for audit trail & approval
        await initiatePayment({
          amount_cents: Math.round(Number(bill.amount || 0) * 100),
          account_id: bill.account_id || user.id,
          description: `Bill payment: ${bill.payee || "Unknown"}`,
          recipient: bill.payee,
          category: bill.category || "bills",
        }).catch(() => { /* non-blocking — bill still marked paid locally */ });
      }
      const { error } = await supabase.from("bills").update({ status: "paid" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["bills"] }); toast.success("Marked as paid"); },
    onError: (e: any) => toast.error(e.message),
  });

  const enriched = bills.map(b => ({
    ...b,
    computedStatus: statusFromDue(b.due_date, b.status),
    daysLeft: differenceInDays(parseISO(b.due_date), new Date()),
  }));

  const filtered = tab === "all" ? enriched
    : tab === "due" ? enriched.filter(b => ["due", "overdue"].includes(b.computedStatus))
    : tab === "upcoming" ? enriched.filter(b => b.computedStatus === "upcoming")
    : enriched.filter(b => ["paid", "scheduled"].includes(b.computedStatus));

  const selected = enriched.find(b => b.id === selectedId);
  const totalDue7d = enriched.filter(b => b.daysLeft > 0 && b.daysLeft <= 7).reduce((s, b) => s + Number(b.amount), 0);
  const monthlyTotal = enriched.filter(b => b.recurring).reduce((s, b) => s + Number(b.amount), 0);

  const openEdit = (b: typeof enriched[0]) => {
    setForm({ payee: b.payee, amount: String(b.amount), due_date: b.due_date, category: b.category || "", recurring: b.recurring || false, frequency: b.frequency || "monthly", auto_pay: b.auto_pay || false, notes: b.notes || "" });
    setEditId(b.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) updateMutation.mutate({ id: editId, bill: form });
    else createMutation.mutate(form);
  };

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <ConfirmationDialog state={confirmation} />
      <SitaPageHeader
        title="Bills & Due Soon"
        subtitle="Track, schedule, and never miss a payment"
        actions={<div className="flex items-center gap-3"><DataFreshnessBadge {...freshness} /><SitaButton variant="primary" onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}><Plus className="h-4 w-4" /> Add Bill</SitaButton></div>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Due This Week" value={`$${totalDue7d >= 1000 ? (totalDue7d / 1000).toFixed(1) + "K" : totalDue7d}`} icon={Clock} sub={`${enriched.filter(b => b.daysLeft > 0 && b.daysLeft <= 7).length} bills`} />
        <KPITile label="Overdue" value={enriched.filter(b => b.computedStatus === "overdue").length} icon={AlertTriangle} sub="Needs attention" />
        <KPITile label="Auto-Pay Active" value={enriched.filter(b => b.auto_pay).length} icon={CheckCircle} sub="Set and forget" />
        <KPITile label="Monthly Total" value={`$${monthlyTotal >= 1000 ? (monthlyTotal / 1000).toFixed(1) + "K" : monthlyTotal}`} icon={DollarSign} sub="All recurring" />
      </div>

      {/* Stress Window */}
      <SitaCard hover={false} className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Calendar className="h-4 w-4 text-primary" />
          <SitaCardTitle>Payment Timeline — Next 15 Days</SitaCardTitle>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 15 }, (_, i) => {
            const day = i + 1;
            const dayBills = enriched.filter(b => b.daysLeft === day);
            const total = dayBills.reduce((s, b) => s + Number(b.amount), 0);
            const isStress = total > 2000;
            return (
              <div key={day} className="flex-1 text-center">
                <div className={`mx-auto h-12 rounded-lg flex items-end justify-center pb-1 text-[9px] font-bold transition-all ${isStress ? "bg-urgency-high/20 text-urgency-high" : total > 0 ? "bg-primary/10 text-primary" : "bg-secondary/30 text-muted-foreground"}`}
                  style={{ paddingTop: `${Math.max(4, 48 - (total / 100))}px` }}>
                  {total > 0 ? `$${total >= 1000 ? (total / 1000).toFixed(1) + "K" : total}` : ""}
                </div>
                <p className="mt-1 text-[9px] text-muted-foreground">{day}</p>
              </div>
            );
          })}
        </div>
      </SitaCard>

      <SitaTabs
        tabs={[
          { key: "all", label: "All", count: enriched.length },
          { key: "due", label: "Due & Overdue", count: enriched.filter(b => ["due", "overdue"].includes(b.computedStatus)).length },
          { key: "upcoming", label: "Upcoming", count: enriched.filter(b => b.computedStatus === "upcoming").length },
          { key: "completed", label: "Paid/Scheduled", count: enriched.filter(b => ["paid", "scheduled"].includes(b.computedStatus)).length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {isLoading ? (
        <><KPISkeleton count={4} /><SectionSkeleton cards={3} columns={1} /></>
      ) : enriched.length === 0 ? (
        <EmptyState icon={CreditCard} title="No bills yet" description="Add your first bill to start tracking payments and due dates" action={<SitaButton variant="primary" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Add Bill</SitaButton>} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-2">
            {filtered.map((bill) => (
              <SitaCard key={bill.id} onClick={() => setSelectedId(bill.id)} selected={selectedId === bill.id}
                lane={bill.computedStatus === "overdue" ? "action" : bill.daysLeft <= 2 && bill.computedStatus !== "scheduled" && bill.computedStatus !== "paid" ? "action" : undefined} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="rounded-xl bg-primary/8 p-2.5"><CreditCard className="h-4 w-4 text-primary" /></div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{bill.payee}</p>
                      <p className="text-xs text-muted-foreground">{bill.category || "Uncategorized"} · {bill.recurring ? bill.frequency || "Recurring" : "One-time"}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-sm font-bold text-foreground">${Number(bill.amount).toLocaleString()}</p>
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                      <span className={`inline-flex items-center rounded-md border px-1.5 py-px text-[10px] font-medium ${(statusConfig[bill.computedStatus] || statusConfig.upcoming).color}`}>{(statusConfig[bill.computedStatus] || statusConfig.upcoming).label}</span>
                      {bill.auto_pay && <span className="text-[10px] text-trust-verified">Auto</span>}
                    </div>
                  </div>
                </div>
                {bill.computedStatus === "overdue" && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-urgency-critical">
                    <AlertTriangle className="h-3 w-3" /> {Math.abs(bill.daysLeft)} days overdue
                  </div>
                )}
              </SitaCard>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selected ? (
              <>
                <SitaCard hover={false} glow className="p-5">
                  <SitaCardTitle sub={selected.category || "Uncategorized"}>{selected.payee}</SitaCardTitle>
                  <p className="mt-2 font-display text-2xl font-bold gradient-sita-text">${Number(selected.amount).toLocaleString()}</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Due</span><span className={selected.computedStatus === "overdue" ? "text-urgency-critical font-semibold" : "text-foreground"}>{format(parseISO(selected.due_date), "MMM d, yyyy")}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><span className={`inline-flex items-center rounded-md border px-1.5 py-px text-[10px] font-medium ${(statusConfig[selected.computedStatus] || statusConfig.upcoming).color}`}>{(statusConfig[selected.computedStatus] || statusConfig.upcoming).label}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Recurring</span><span className="text-foreground">{selected.recurring ? selected.frequency || "Yes" : "No"}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Auto-Pay</span><span className="text-foreground">{selected.auto_pay ? "Active" : "Off"}</span></div>
                    {selected.notes && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Notes</span><span className="text-foreground text-right max-w-[180px] truncate">{selected.notes}</span></div>}
                  </div>
                </SitaCard>
                <div className="flex gap-2 flex-wrap">
                  {selected.computedStatus !== "paid" && <SitaButton variant="primary" size="sm" className="flex-1" onClick={() => markPaidMutation.mutate(selected.id)}><CheckCircle className="h-3.5 w-3.5" /> Mark Paid</SitaButton>}
                  {selected.computedStatus !== "paid" && (
                    <SitaButton variant="secondary" size="sm" onClick={() => {
                      const sim = simulatePayment(
                        { id: selected.id, amount: Number(selected.amount), currency: "USD", fromAccountId: "checking", recipientName: selected.payee, method: "ach", description: selected.payee },
                        58570,
                        12000
                      );
                      const recLabel = sim.recommendation === "proceed" ? "✅ Safe to pay" : sim.recommendation === "delay" ? "⏳ Consider delaying" : sim.recommendation === "split" ? "✂️ Consider splitting" : "❌ Not recommended";
                      toast.info(`${recLabel} — Balance after: $${sim.projectedBalance.toLocaleString()}${sim.riskFlags.length > 0 ? ` ⚠️ ${sim.riskFlags[0]}` : ""}`, { duration: 6000 });
                    }}><Zap className="h-3.5 w-3.5" /> Simulate</SitaButton>
                  )}
                  <SitaButton variant="secondary" size="sm" onClick={() => openEdit(selected)}>Edit</SitaButton>
                  <SitaButton variant="danger" size="sm" onClick={async () => { if (await confirm({ title: "Delete this bill?", description: "This bill will be permanently removed.", variant: "destructive" })) deleteMutation.mutate(selected.id); }}><Trash2 className="h-3.5 w-3.5" /></SitaButton>
                </div>
              </>
            ) : (
              <EmptyState icon={CreditCard} title="Select a bill" description="Click on a bill to see details, payment history, and available actions" />
            )}
          </div>
        </div>
      )}

      {/* Form Drawer */}
      <ContextDrawer open={showForm} onClose={() => { setShowForm(false); setEditId(null); }} title={editId ? "Edit Bill" : "Add Bill"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Payee *</label>
            <input className="mt-1 w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20" value={form.payee} onChange={e => setForm({ ...form, payee: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Amount *</label>
              <input type="number" step="0.01" className="mt-1 w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Due Date *</label>
              <input type="date" className="mt-1 w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <input className="mt-1 w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Business · Rent" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" className="rounded" checked={form.recurring} onChange={e => setForm({ ...form, recurring: e.target.checked })} /> Recurring
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" className="rounded" checked={form.auto_pay} onChange={e => setForm({ ...form, auto_pay: e.target.checked })} /> Auto-Pay
            </label>
          </div>
          {form.recurring && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Frequency</label>
              <select className="mt-1 w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground focus:border-primary/40 focus:outline-none" value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Notes</label>
            <textarea className="mt-1 w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex gap-2 pt-2">
            <SitaButton type="submit" variant="primary" className="flex-1">{editId ? "Update Bill" : "Create Bill"}</SitaButton>
            <SitaButton type="button" variant="ghost" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</SitaButton>
          </div>
        </form>
      </ContextDrawer>

      <LiveAdvisorCard
        advisor="money"
        intent="bill_optimization"
        demoName="Payment Intelligence"
        demoRole="Bills Advisor"
        demoConfidence="Medium"
        demoRecommendation="2 bills could save $180/yr with early-pay discounts. Consider scheduling the $2,449 rent payment after Apr 5 when the Apex Corp receivable lands."
        demoReasoning="Based on payment timing analysis, cash flow projections, and vendor discount opportunities."
      />
    </motion.div>
  );
};

export default BillsWorkspace;
