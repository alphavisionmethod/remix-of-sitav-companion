import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useBills as useMoneyBills } from "@/hooks/use-money-data";
import { useAuth } from "@/contexts/AuthContext";
import { useAction } from "@/hooks/useAction";
import { DollarSign, Clock, AlertTriangle, CheckCircle, Calendar, CreditCard, Plus, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { format, differenceInDays, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { simulatePayment } from "@/lib/utils/payment-simulation";
import { useConfirmation } from "@/hooks/use-confirmation";
import { ConfirmationDialog } from "@/components/sita/ConfirmationDialog";
import { useQueryFreshness } from "@/hooks/use-query-freshness";

// New design system imports
import { HeroCard, QueueCard, ActionCard, StatusCard } from "@/components/sita/cards";
import { ExecutionBadge, FreshnessBadge } from "@/components/sita/badges";
import { SplitWorkspace } from "@/components/sita/surfaces/SplitWorkspace";
import { DetailDrawer } from "@/components/sita/surfaces/DetailDrawer";
import { AppSurface } from "@/components/sita/surfaces/AppSurface";
import { ListReveal, ListRevealItem } from "@/components/sita/motion/AppTransitions";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { CrossAppAction } from "@/components/sita/CrossAppAction";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";

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

const executionState = (status: string): "drafted" | "approved" | "executing" | "complete" | "failed" => {
  if (status === "paid") return "complete";
  if (status === "scheduled") return "approved";
  if (status === "overdue") return "failed";
  if (status === "due") return "executing";
  return "drafted";
};

const BillsWorkspace = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { confirmation, confirm } = useConfirmation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BillForm>(emptyForm);

  const moneyBills = useMoneyBills();
  const billsQuery = useQuery({
    queryKey: ["bills"],
    queryFn: async () => {
      const { data, error } = await fromTable("bills").select("*").order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    placeholderData: moneyBills.data as never,
  });
  const bills = billsQuery.data ?? [];
  const isLoading = billsQuery.isLoading;

  const createMutation = useAction<BillForm>("finance", "bill.create", {
    successMessage: "Bill created",
    invalidateKeys: [["bills"]],
    onSuccess: () => { setShowForm(false); setForm(emptyForm); },
  });

  const updateMutation = useAction<{ id: string; bill: BillForm }>("finance", "bill.update", {
    successMessage: "Bill updated",
    invalidateKeys: [["bills"]],
    onSuccess: () => { setShowForm(false); setEditId(null); setForm(emptyForm); },
  });

  const deleteMutation = useAction("finance", "bill.delete", {
    successMessage: "Bill deleted",
    invalidateKeys: [["bills"]],
    onSuccess: () => { setSelectedId(null); },
  });

  const markPaidMutation = useAction("finance", "bill.pay", {
    successMessage: "Marked as paid",
    invalidateKeys: [["bills"]],
  });

  const enriched = bills.map((b: any) => ({
    ...b,
    computedStatus: statusFromDue(b.due_date, b.status),
    daysLeft: differenceInDays(parseISO(b.due_date), new Date()),
  }));

  const selected = enriched.find((b: any) => b.id === selectedId);
  const totalDue7d = enriched.filter((b: any) => b.daysLeft > 0 && b.daysLeft <= 7).reduce((s: number, b: any) => s + Number(b.amount), 0);
  const overdueCount = enriched.filter((b: any) => b.computedStatus === "overdue").length;
  const autoPayCount = enriched.filter((b: any) => b.auto_pay).length;

  const openEdit = (b: any) => {
    setForm({ payee: b.payee, amount: String(b.amount), due_date: b.due_date, category: b.category || "", recurring: b.recurring || false, frequency: b.frequency || "monthly", auto_pay: b.auto_pay || false, notes: b.notes || "" });
    setEditId(b.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) updateMutation.mutate({ id: editId, bill: form });
    else createMutation.mutate(form);
  };

  // Queue items for the QueueCard
  const queueItems = enriched
    .filter((b: any) => b.computedStatus !== "paid")
    .slice(0, 8)
    .map((b: any) => ({
      id: b.id,
      label: `${b.payee} — $${Number(b.amount).toLocaleString()}`,
      meta: b.daysLeft < 0 ? `${Math.abs(b.daysLeft)}d overdue` : `${b.daysLeft}d`,
      urgency: b.computedStatus === "overdue" ? "critical" as const : b.daysLeft <= 3 ? "high" as const : "normal" as const,
      badge: <ExecutionBadge state={executionState(b.computedStatus)} />,
    }));

  // Build list pane
  const listPane = (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-semibold text-[hsl(0_0%_85%)]">Bills & Obligations</h3>
          <CrossAppAction to="/money/approvals" label="Approvals" variant="chip" context={{ entityType: "bill", entityId: "pending" }} />
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[hsl(152_55%_48%/0.12)] hover:bg-[hsl(152_55%_48%/0.18)] text-[hsl(152_55%_48%)] text-[11px] font-medium transition-colors"
        >
          <Plus className="h-3 w-3" /> Add Bill
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-2">
        <StatusCard label="Due 7d" status={totalDue7d > 2000 ? "degraded" : "healthy"} confidence={Math.min(100, Math.max(0, 100 - totalDue7d / 100))} />
        <StatusCard label="Overdue" status={overdueCount > 0 ? "down" : "healthy"} lastChecked={`${overdueCount} bills`} />
        <StatusCard label="Auto-Pay" status="healthy" lastChecked={`${autoPayCount} active`} />
      </div>

      {/* Queue */}
      <QueueCard
        title="PAYMENT QUEUE"
        items={queueItems}
        maxVisible={10}
        onItemClick={(id) => setSelectedId(id)}
      />

      {/* Bill Shock Prevention */}
      <AppSurface level={1} className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-3.5 w-3.5 text-[hsl(38_85%_58%)]" />
          <span className="text-[11px] font-semibold text-[hsl(0_0%_70%)] uppercase tracking-wider">Shock Prevention</span>
        </div>
        <div className="space-y-1.5">
          {(() => {
            const alerts: { label: string; detail: string }[] = [];
            const avg = enriched.length > 0 ? enriched.reduce((s: number, b: any) => s + Number(b.amount), 0) / enriched.length : 0;
            enriched.filter((b: any) => Number(b.amount) > avg * 2 && b.computedStatus !== "paid").forEach((b: any) => {
              alerts.push({ label: `Large: ${b.payee}`, detail: `$${Number(b.amount).toLocaleString()} — ${(Number(b.amount) / avg).toFixed(1)}x avg` });
            });
            const byDay: Record<string, any[]> = {};
            enriched.filter((b: any) => b.daysLeft >= 0 && b.daysLeft <= 15 && b.computedStatus !== "paid").forEach((b: any) => {
              if (!byDay[b.due_date]) byDay[b.due_date] = [];
              byDay[b.due_date].push(b);
            });
            Object.entries(byDay).filter(([, bs]) => bs.length >= 2).forEach(([date, bs]) => {
              const total = bs.reduce((s: number, b: any) => s + Number(b.amount), 0);
              alerts.push({ label: `Collision: ${format(parseISO(date), "MMM d")}`, detail: `${bs.length} bills · $${total.toLocaleString()}` });
            });
            if (alerts.length === 0) {
              return <p className="text-[11px] text-[hsl(152_55%_48%)] flex items-center gap-1.5"><CheckCircle className="h-3 w-3" /> No risks detected</p>;
            }
            return alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded-lg bg-[hsl(0_0%_100%/0.03)]">
                <AlertTriangle className="h-3 w-3 mt-0.5 text-[hsl(38_85%_58%)] shrink-0" />
                <div>
                  <p className="text-[11px] font-medium text-[hsl(0_0%_80%)]">{a.label}</p>
                  <p className="text-[10px] text-[hsl(0_0%_50%)]">{a.detail}</p>
                </div>
              </div>
            ));
          })()}
        </div>
      </AppSurface>
    </div>
  );

  // Build detail pane
  const detailPane = selected ? (
    <div className="p-4 space-y-4">
      <HeroCard
        title={selected.payee}
        metric={`$${Number(selected.amount).toLocaleString()}`}
        subtitle={selected.category || "Uncategorized"}
        accentFrom="hsl(152 55% 48%)"
        accentTo="hsl(190 60% 45%)"
      >
        <ExecutionBadge state={executionState(selected.computedStatus)} />
      </HeroCard>

      <AppSurface level={2} className="p-4 space-y-2.5">
        <div className="flex justify-between text-[12px]">
          <span className="text-[hsl(0_0%_50%)]">Due</span>
          <span className={selected.computedStatus === "overdue" ? "text-[hsl(0_70%_55%)] font-semibold" : "text-[hsl(0_0%_85%)]"}>
            {format(parseISO(selected.due_date), "MMM d, yyyy")}
          </span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[hsl(0_0%_50%)]">Freshness</span>
          <FreshnessBadge freshness={selected.daysLeft < 0 ? "expired" : selected.daysLeft <= 3 ? "stale" : selected.daysLeft <= 7 ? "aging" : "fresh"} label={selected.daysLeft < 0 ? `${Math.abs(selected.daysLeft)}d overdue` : `${selected.daysLeft}d left`} />
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[hsl(0_0%_50%)]">Recurring</span>
          <span className="text-[hsl(0_0%_85%)]">{selected.recurring ? selected.frequency || "Yes" : "No"}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[hsl(0_0%_50%)]">Auto-Pay</span>
          <span className="text-[hsl(0_0%_85%)]">{selected.auto_pay ? "Active" : "Off"}</span>
        </div>
        {selected.notes && (
          <div className="flex justify-between text-[12px]">
            <span className="text-[hsl(0_0%_50%)]">Notes</span>
            <span className="text-[hsl(0_0%_85%)] text-right max-w-[180px] truncate">{selected.notes}</span>
          </div>
        )}
      </AppSurface>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {selected.computedStatus !== "paid" && (
          <ActionCard
            title="Mark as Paid"
            description="Confirm this payment has been completed"
            accentColor="hsl(152 55% 48%)"
            onApprove={() => markPaidMutation.mutate({ id: selected.id })}
            className="flex-1"
          />
        )}
        {selected.computedStatus !== "paid" && (
          <ActionCard
            title="Simulate Payment"
            description="Check cash flow impact before paying"
            accentColor="hsl(265 55% 58%)"
            onApprove={() => {
              const sim = simulatePayment(
                { id: selected.id, amount: Number(selected.amount), currency: "USD", fromAccountId: "checking", recipientName: selected.payee, method: "ach", description: selected.payee },
                58570, 12000
              );
              const recLabel = sim.recommendation === "proceed" ? "✅ Safe" : sim.recommendation === "delay" ? "⏳ Delay" : sim.recommendation === "split" ? "✂️ Split" : "❌ Not recommended";
              toast.info(`${recLabel} — Balance after: $${sim.projectedBalance.toLocaleString()}`, { duration: 6000 });
            }}
            className="flex-1"
          />
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={() => openEdit(selected)} className="flex-1 px-3 py-2 rounded-lg bg-[hsl(0_0%_100%/0.06)] hover:bg-[hsl(0_0%_100%/0.10)] text-[hsl(0_0%_80%)] text-[12px] font-medium transition-colors">Edit</button>
        <button onClick={async () => { if (await confirm({ title: "Delete this bill?", description: "This bill will be permanently removed.", variant: "destructive" })) deleteMutation.mutate({ id: selected.id }); }}
          className="px-3 py-2 rounded-lg bg-[hsl(0_70%_55%/0.10)] hover:bg-[hsl(0_70%_55%/0.18)] text-[hsl(0_70%_55%)] text-[12px] font-medium transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <ModuleAdvisorInsight
        advisorName="Payment Intelligence"
        domain="finance"
        insight="2 bills could save $180/yr with early-pay discounts."
        confidence={72}
      />
    </div>
  ) : (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-2">
        <CreditCard className="h-8 w-8 mx-auto text-[hsl(0_0%_30%)]" />
        <p className="text-[13px] text-[hsl(0_0%_50%)]">Select a bill to view details</p>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-200px)] -m-4">
<ConfirmationDialog state={confirmation} />
      <SplitWorkspace
        list={listPane}
        detail={detailPane}
        hasSelection={!!selected}
        defaultSplit={42}
      />

      {/* Form Drawer */}
      <DetailDrawer
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditId(null); }}
        title={editId ? "Edit Bill" : "Add Bill"}
        domain="finance"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-medium text-[hsl(0_0%_50%)]">Payee *</label>
            <input className="mt-1 w-full rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2.5 text-sm text-[hsl(0_0%_90%)] focus:border-[hsl(152_55%_48%/0.4)] focus:outline-none focus:ring-2 focus:ring-[hsl(152_55%_48%/0.15)]" value={form.payee} onChange={e => setForm({ ...form, payee: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-[hsl(0_0%_50%)]">Amount *</label>
              <input type="number" step="0.01" className="mt-1 w-full rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2.5 text-sm text-[hsl(0_0%_90%)] focus:border-[hsl(152_55%_48%/0.4)] focus:outline-none" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div>
              <label className="text-[11px] font-medium text-[hsl(0_0%_50%)]">Due Date *</label>
              <input type="date" className="mt-1 w-full rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2.5 text-sm text-[hsl(0_0%_90%)] focus:border-[hsl(152_55%_48%/0.4)] focus:outline-none" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-medium text-[hsl(0_0%_50%)]">Category</label>
            <input className="mt-1 w-full rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2.5 text-sm text-[hsl(0_0%_90%)]" placeholder="e.g. Rent · Utilities" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-[12px] text-[hsl(0_0%_75%)]">
              <input type="checkbox" className="rounded" checked={form.recurring} onChange={e => setForm({ ...form, recurring: e.target.checked })} /> Recurring
            </label>
            <label className="flex items-center gap-2 text-[12px] text-[hsl(0_0%_75%)]">
              <input type="checkbox" className="rounded" checked={form.auto_pay} onChange={e => setForm({ ...form, auto_pay: e.target.checked })} /> Auto-Pay
            </label>
          </div>
          {form.recurring && (
            <div>
              <label className="text-[11px] font-medium text-[hsl(0_0%_50%)]">Frequency</label>
              <select className="mt-1 w-full rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2.5 text-sm text-[hsl(0_0%_90%)]" value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          )}
          <div>
            <label className="text-[11px] font-medium text-[hsl(0_0%_50%)]">Notes</label>
            <textarea className="mt-1 w-full rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2.5 text-sm text-[hsl(0_0%_90%)] resize-none" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg bg-[hsl(152_55%_48%)] hover:bg-[hsl(152_55%_42%)] text-foreground text-[13px] font-medium transition-colors">{editId ? "Update Bill" : "Create Bill"}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2.5 rounded-lg bg-[hsl(0_0%_100%/0.06)] hover:bg-[hsl(0_0%_100%/0.10)] text-[hsl(0_0%_70%)] text-[13px] transition-colors">Cancel</button>
          </div>
        </form>
      </DetailDrawer>
    </div>
  );
};

export default BillsWorkspace;
