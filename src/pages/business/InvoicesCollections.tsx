import { SitaPageHeader, SitaCard, SitaCardTitle, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Clock, AlertTriangle, CheckCircle, Send, Phone, Receipt, Plus, X, Trash2, FileText, Loader2 } from "lucide-react";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useInvoiceGenerate, useInvoiceSend } from "@/hooks/use-backend-actions";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground border-border" },
  sent: { label: "Sent", color: "bg-primary/10 text-primary border-primary/20" },
  paid: { label: "Paid", color: "bg-trust-verified/10 text-trust-verified border-trust-verified/20" },
  overdue: { label: "Overdue", color: "bg-urgency-high/10 text-urgency-high border-urgency-high/20" },
  partial: { label: "Partial", color: "bg-accent/10 text-accent border-accent/20" },
  disputed: { label: "Disputed", color: "bg-urgency-critical/10 text-urgency-critical border-urgency-critical/20" },
};

const initials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

const InvoicesCollections = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ invoice_number: "", amount: "", due_date: "", notes: "" });
  const generatePdf = useInvoiceGenerate();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase as any).from("invoices").select("*, customers(name)").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data.map((inv: any) => {
        const due = new Date(inv.due_date);
        const now = new Date();
        const daysOverdue = inv.status !== "paid" ? Math.max(0, Math.floor((now.getTime() - due.getTime()) / 86400000)) : 0;
        const computedStatus = inv.status === "paid" ? "paid" : daysOverdue > 0 ? "overdue" : inv.status;
        return { ...inv, daysOverdue, computedStatus };
      });
    },
    enabled: !!user,
  });

  const addInvoice = useMutation({
    mutationFn: async () => {
      if (!user || !form.invoice_number.trim() || !form.amount || !form.due_date) throw new Error("Number, amount, and due date required");
      const { error } = await (supabase as any).from("invoices").insert({
        user_id: user.id, invoice_number: form.invoice_number.trim(), amount: parseFloat(form.amount),
        due_date: form.due_date, notes: form.notes || null, status: "draft",
      });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["invoices"] }); setShowAdd(false); setForm({ invoice_number: "", amount: "", due_date: "", notes: "" }); toast.success("Invoice created"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase as any).from("invoices").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["invoices"] }); toast.success("Status updated"); },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => { const { error } = await (supabase as any).from("invoices").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["invoices"] }); setSelectedId(null); toast.success("Deleted"); },
  });

  const selected = invoices.find((i: any) => i.id === selectedId);

  const filtered = tab === "all" ? invoices
    : tab === "due" ? invoices.filter((i: any) => i.computedStatus === "overdue" || i.computedStatus === "sent")
    : tab === "overdue" ? invoices.filter((i: any) => i.computedStatus === "overdue")
    : invoices.filter((i: any) => i.computedStatus === "paid");

  const outstanding = invoices.filter((i: any) => !["paid", "draft"].includes(i.computedStatus)).reduce((s: number, i: any) => s + Number(i.amount), 0);
  const overdue = invoices.filter((i: any) => i.computedStatus === "overdue").reduce((s: number, i: any) => s + Number(i.amount), 0);
  const paidThisMonth = invoices.filter((i: any) => i.status === "paid" && new Date(i.updated_at).getMonth() === new Date().getMonth()).reduce((s: number, i: any) => s + Number(i.amount), 0);

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <SitaPageHeader title="Invoices & Collections" subtitle="Track payments, recover revenue" actions={
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"><Plus className="h-3.5 w-3.5" /> New Invoice</button>
      } />

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <SitaCard className="p-5">
              <div className="flex items-center justify-between mb-4"><SitaCardTitle>New Invoice</SitaCardTitle><button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={form.invoice_number} onChange={e => setForm({ ...form, invoice_number: e.target.value })} placeholder="Invoice # *" className="rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
                <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="Amount ($) *" className="rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
                <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} className="rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
                <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={() => addInvoice.mutate()} disabled={addInvoice.isPending || !form.invoice_number.trim() || !form.amount || !form.due_date} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">{addInvoice.isPending ? "Creating..." : "Create Invoice"}</button>
              </div>
            </SitaCard>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" variants={stagger} initial="hidden" animate="show">
        {[
          { label: "Outstanding", value: outstanding > 0 ? `$${(outstanding / 1000).toFixed(1)}K` : "$0", icon: DollarSign },
          { label: "Overdue", value: overdue > 0 ? `$${(overdue / 1000).toFixed(1)}K` : "$0", icon: AlertTriangle },
          { label: "Paid This Month", value: paidThisMonth > 0 ? `$${paidThisMonth.toLocaleString()}` : "$0", icon: CheckCircle },
          { label: "Total Invoices", value: String(invoices.length), icon: Clock },
        ].map(kpi => <motion.div key={kpi.label} variants={fadeUp}><KPITile {...kpi} /></motion.div>)}
      </motion.div>

      {/* Aging Buckets */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Current", count: invoices.filter((i: any) => i.daysOverdue === 0 && !["paid", "draft"].includes(i.status)).length, color: "border-l-trust-verified" },
          { label: "1–14 Days Late", count: invoices.filter((i: any) => i.daysOverdue > 0 && i.daysOverdue <= 14).length, color: "border-l-trust-review" },
          { label: "15–30 Days Late", count: invoices.filter((i: any) => i.daysOverdue > 14 && i.daysOverdue <= 30).length, color: "border-l-urgency-high" },
          { label: "30+ Days Late", count: invoices.filter((i: any) => i.daysOverdue > 30).length, color: "border-l-urgency-critical" },
        ].map(b => (
          <div key={b.label} className={`rounded-xl border border-border bg-card p-3.5 border-l-4 ${b.color}`}>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{b.label}</p>
            <p className="mt-1 font-display text-xl font-bold text-foreground">{b.count}</p>
          </div>
        ))}
      </div>

      <SitaTabs tabs={[
        { key: "all", label: "All", count: invoices.length },
        { key: "due", label: "Action Needed", count: invoices.filter((i: any) => ["overdue", "sent"].includes(i.computedStatus)).length },
        { key: "overdue", label: "Overdue", count: invoices.filter((i: any) => i.computedStatus === "overdue").length },
        { key: "paid", label: "Paid", count: invoices.filter((i: any) => i.computedStatus === "paid").length },
      ]} active={tab} onChange={setTab} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-2">
          {isLoading ? <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}</div>
          : filtered.length === 0 ? <EmptyState icon={DollarSign} title="No invoices" description={invoices.length === 0 ? "Create your first invoice" : "Try a different filter"} />
          : (
            <motion.div className="space-y-2" variants={stagger} initial="hidden" animate="show">
              {filtered.map((inv: any) => {
                const st = statusConfig[inv.computedStatus] || statusConfig.draft;
                const customerName = inv.customers?.name;
                return (
                  <motion.div key={inv.id} variants={fadeUp} layout>
                    <SitaCard onClick={() => setSelectedId(inv.id)} selected={selectedId === inv.id} lane={inv.computedStatus === "overdue" ? "action" : undefined} className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/8 font-display text-sm font-semibold text-primary shrink-0">{initials(customerName || inv.invoice_number)}</div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">Invoice #{inv.invoice_number}</p>
                            <p className="text-xs text-muted-foreground">{customerName || "No customer"} · Due {new Date(inv.due_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-display text-sm font-semibold text-foreground">${Number(inv.amount).toLocaleString()}</p>
                          <span className={`inline-flex items-center rounded-md border px-1.5 py-px text-[10px] font-medium mt-1 ${st.color}`}>{st.label}</span>
                        </div>
                      </div>
                      {inv.daysOverdue > 0 && inv.status !== "paid" && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-urgency-high"><Clock className="h-3 w-3" /> {inv.daysOverdue} days overdue</div>
                      )}
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
                <SitaCardTitle sub={`${selected.customers?.name || "No customer"} · Due ${new Date(selected.due_date).toLocaleDateString()}`}>Invoice #{selected.invoice_number}</SitaCardTitle>
                <p className="mt-2 font-display text-2xl font-bold gradient-sita-text">${Number(selected.amount).toLocaleString()}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><span className={`inline-flex items-center rounded-md border px-1.5 py-px text-[10px] font-medium ${(statusConfig[selected.computedStatus] || statusConfig.draft).color}`}>{(statusConfig[selected.computedStatus] || statusConfig.draft).label}</span></div>
                  {selected.daysOverdue > 0 && selected.status !== "paid" && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Days Overdue</span><span className="text-urgency-high font-semibold">{selected.daysOverdue}</span></div>}
                  {selected.notes && <div className="text-sm"><span className="text-muted-foreground">Notes: </span><span className="text-foreground">{selected.notes}</span></div>}
                </div>
              </SitaCard>
              <div className="flex gap-2 flex-wrap">
                {selected.status === "draft" && <button onClick={() => updateStatus.mutate({ id: selected.id, status: "sent" })} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"><Send className="h-3.5 w-3.5" /> Mark Sent</button>}
                {selected.status !== "paid" && <button onClick={() => updateStatus.mutate({ id: selected.id, status: "paid" })} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"><Receipt className="h-3.5 w-3.5" /> Mark Paid</button>}
                <button
                  onClick={() => generatePdf.mutate({ action: "generate", invoice_id: selected.id, format: "pdf" })}
                  disabled={generatePdf.isPending}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                >
                  {generatePdf.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                  Generate PDF
                </button>
                <button onClick={() => deleteInvoice.mutate(selected.id)} className="rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </>
          ) : <EmptyState icon={DollarSign} title="Select an invoice" description="Click on an invoice to see payment details and collection actions" />}
        </div>
      </div>
      <LiveAdvisorCard
        advisor="business"
        intent="collections_strategy"
        demoName="Collections Intelligence"
        demoRole="Revenue Recovery Advisor"
        demoConfidence="High"
        demoRecommendation="$4,200 in overdue invoices need immediate attention. Consider a payment plan for the 30+ day accounts — it recovers 72% more than continued reminders."
        demoReasoning="Based on aging analysis, payment history patterns, and collections effectiveness data."
      />
    </motion.div>
  );
};

export default InvoicesCollections;
