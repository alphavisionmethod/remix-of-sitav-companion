import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useAction } from "@/hooks/useAction";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Clock, AlertTriangle, CheckCircle, Plus, X, FileText, Target } from "lucide-react";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import { useInvoiceGenerate, useInvoiceSend } from "@/hooks/use-backend-actions";
import { InvoiceDetailPane } from "@/modules/business/components/business/InvoiceDetailPane";
import { cn } from "@/lib/utils";
import { CrossAppAction } from "@/platform/sita/components/sita/CrossAppAction";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";
import { useDraftAutosave } from "@/hooks/useDraftAutosave";

// New design system
import { HeroCard, QueueCard, StatusCard } from "@/platform/sita/components/sita/cards";
import { ExecutionBadge, FreshnessBadge } from "@/platform/sita/components/sita/badges";
import { SplitWorkspace } from "@/platform/sita/components/sita/surfaces/SplitWorkspace";
import { DetailDrawer } from "@/platform/sita/components/sita/surfaces/DetailDrawer";
import { AppSurface } from "@/platform/sita/components/sita/surfaces/AppSurface";
import { ListReveal, ListRevealItem } from "@/platform/sita/components/sita/motion/AppTransitions";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const executionState = (status: string): "drafted" | "approved" | "executing" | "complete" | "failed" => {
  if (status === "paid") return "complete";
  if (status === "sent") return "approved";
  if (status === "overdue") return "failed";
  if (status === "partial") return "executing";
  return "drafted";
};

const InvoicesCollections = () => {
  const { user } = useAuth();
  const { primaryMode, adaptations } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const invoiceLabel = primaryMode === "ecommerce" ? "Orders & Payments" : primaryMode === "appointment-based" ? "Session Billing" : primaryMode === "membership" ? "Membership Billing" : "Invoices & Collections";
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const { draft, updateDraft, clearDraft } = useDraftAutosave<{ invoice_number: string; amount: string; due_date: string; notes: string }>("finance:invoice:new", "money");
  const [form, setForm] = useState({
    invoice_number: draft.invoice_number ?? "",
    amount: draft.amount ?? "",
    due_date: draft.due_date ?? "",
    notes: draft.notes ?? "",
  });
  const generatePdf = useInvoiceGenerate();
  const sendInvoice = useInvoiceSend();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await fromTable("invoices").select("*, customers(name)").eq("user_id", user.id).order("created_at", { ascending: false });
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

  const addInvoice = useAction("finance", "invoice.create", {
    successMessage: "Invoice created",
    invalidateKeys: [["invoices"]],
    onSuccess: () => { clearDraft(); setShowAdd(false); setForm({ invoice_number: "", amount: "", due_date: "", notes: "" }); },
  });

  const updateStatus = useAction("finance", "invoice.status", {
    successMessage: "Status updated",
    invalidateKeys: [["invoices"]],
  });

  const deleteInvoice = useAction("finance", "invoice.delete", {
    successMessage: "Deleted",
    invalidateKeys: [["invoices"]],
    onSuccess: () => { setSelectedId(null); },
  });

  const selected = invoices.find((i: any) => i.id === selectedId);
  const outstanding = invoices.filter((i: any) => !["paid", "draft"].includes(i.computedStatus)).reduce((s: number, i: any) => s + Number(i.amount), 0);
  const overdue = invoices.filter((i: any) => i.computedStatus === "overdue").reduce((s: number, i: any) => s + Number(i.amount), 0);

  const queueItems = invoices
    .filter((i: any) => i.computedStatus !== "paid")
    .map((inv: any) => ({
      id: inv.id,
      label: `#${inv.invoice_number} — ${inv.customers?.name || "Unknown"}`,
      meta: `$${Number(inv.amount).toLocaleString()}`,
      urgency: (inv.computedStatus === "overdue" ? "critical" : inv.computedStatus === "sent" ? "normal" : "low") as "critical" | "normal" | "low",
      badge: <ExecutionBadge state={executionState(inv.computedStatus)} />,
    }));

  const listPane = (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[13px] font-semibold text-[hsl(0_0%_85%)]">Invoices & Collections</h3>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[hsl(265_55%_58%/0.12)] hover:bg-[hsl(265_55%_58%/0.18)] text-[hsl(265_55%_70%)] text-[11px] font-medium transition-colors"
        >
          <Plus className="h-3 w-3" /> New Invoice
        </button>
      </div>

      {/* Cross-app links */}
      <div className="flex items-center gap-2 flex-wrap">
        <CrossAppAction to="/money/receivables" label="View in Finance" context={{ entityType: "invoice", entityId: "all", entityLabel: "Receivables" }} />
        <CrossAppAction to="/business/collections" label="Collections Center" context={{ entityType: "invoice", entityId: "overdue", entityLabel: "Overdue invoices" }} />
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-2">
        <StatusCard label="Outstanding" status={outstanding > 5000 ? "degraded" : "healthy"} lastChecked={outstanding > 0 ? `$${(outstanding / 1000).toFixed(1)}K` : "$0"} />
        <StatusCard label="Overdue" status={overdue > 0 ? "down" : "healthy"} lastChecked={overdue > 0 ? `$${(overdue / 1000).toFixed(1)}K` : "$0"} />
        <StatusCard label="Total" status="healthy" lastChecked={`${invoices.length}`} />
      </div>

      {/* Aging Buckets */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: "Current", count: invoices.filter((i: any) => i.daysOverdue === 0 && !["paid", "draft"].includes(i.status)).length, color: "hsl(152 55% 48%)" },
          { label: "1–14d", count: invoices.filter((i: any) => i.daysOverdue > 0 && i.daysOverdue <= 14).length, color: "hsl(210 60% 50%)" },
          { label: "15–30d", count: invoices.filter((i: any) => i.daysOverdue > 14 && i.daysOverdue <= 30).length, color: "hsl(38 85% 58%)" },
          { label: "30+", count: invoices.filter((i: any) => i.daysOverdue > 30).length, color: "hsl(0 70% 55%)" },
        ].map(b => (
          <AppSurface key={b.label} level={1} className="p-2 text-center border-t-2" style={{ borderTopColor: b.color }}>
            <p className="text-[16px] font-bold text-[hsl(0_0%_90%)] tabular-nums">{b.count}</p>
            <p className="text-[9px] text-[hsl(0_0%_50%)] uppercase tracking-wider">{b.label}</p>
          </AppSurface>
        ))}
      </div>

      {/* Queue */}
      <QueueCard
        title="ACTIVE INVOICES"
        items={queueItems}
        maxVisible={12}
        onItemClick={(id) => setSelectedId(id)}
      />
    </div>
  );

  const detailPane = selected ? (
    <div className="p-4">
      <InvoiceDetailPane
        invoice={selected}
        onMarkSent={() => updateStatus.mutate({ id: selected.id, status: "sent" })}
        onMarkPaid={() => updateStatus.mutate({ id: selected.id, status: "paid" })}
        onSendInvoice={() => sendInvoice.mutate({ action: "send", invoice_id: selected.id })}
        onGeneratePdf={() => generatePdf.mutate({ action: "generate", invoice_id: selected.id, format: "pdf" })}
        onDelete={() => deleteInvoice.mutate(selected.id)}
        sendPending={sendInvoice.isPending}
        pdfPending={generatePdf.isPending}
      />
    </div>
  ) : (
    <PremiumEmptyState
      variant="no-data"
      icon={FileText}
      domain="business"
      title="Select an invoice"
      description="Click on an invoice to view details, send reminders, or mark as paid."
    />
  );

  return (
    <div className="h-[calc(100vh-200px)] -m-4">
<SplitWorkspace
        list={listPane}
        detail={detailPane}
        hasSelection={!!selected}
        defaultSplit={42}
      />

      {/* Add Invoice Drawer */}
      <DetailDrawer
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="New Invoice"
        domain="business"
      >
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-medium text-[hsl(0_0%_50%)]">Invoice # *</label>
            <input value={form.invoice_number} onChange={e => { const v = e.target.value; setForm(f => ({ ...f, invoice_number: v })); updateDraft({ invoice_number: v }); }} className="mt-1 w-full rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2.5 text-sm text-[hsl(0_0%_90%)] focus:outline-none focus:ring-2 focus:ring-[hsl(265_55%_58%/0.2)]" />
          </div>
          <div>
            <label className="text-[11px] font-medium text-[hsl(0_0%_50%)]">Amount *</label>
            <input type="number" value={form.amount} onChange={e => { const v = e.target.value; setForm(f => ({ ...f, amount: v })); updateDraft({ amount: v }); }} className="mt-1 w-full rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2.5 text-sm text-[hsl(0_0%_90%)] focus:outline-none" />
          </div>
          <div>
            <label className="text-[11px] font-medium text-[hsl(0_0%_50%)]">Due Date *</label>
            <input type="date" value={form.due_date} onChange={e => { const v = e.target.value; setForm(f => ({ ...f, due_date: v })); updateDraft({ due_date: v }); }} className="mt-1 w-full rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2.5 text-sm text-[hsl(0_0%_90%)] focus:outline-none" />
          </div>
          <div>
            <label className="text-[11px] font-medium text-[hsl(0_0%_50%)]">Notes</label>
            <input value={form.notes} onChange={e => { const v = e.target.value; setForm(f => ({ ...f, notes: v })); updateDraft({ notes: v }); }} className="mt-1 w-full rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2.5 text-sm text-[hsl(0_0%_90%)]" />
          </div>
          <button
            onClick={() => addInvoice.mutate({ invoice_number: form.invoice_number.trim(), amount: parseFloat(form.amount), due_date: form.due_date, notes: form.notes || null, status: "draft" })}
            disabled={addInvoice.isPending || !form.invoice_number.trim() || !form.amount || !form.due_date}
            className="w-full px-4 py-2.5 rounded-lg bg-[hsl(265_55%_58%)] hover:bg-[hsl(265_55%_52%)] disabled:opacity-50 text-foreground text-[13px] font-medium transition-colors"
          >
            {addInvoice.isPending ? "Creating..." : "Create Invoice"}
          </button>
        </div>
      </DetailDrawer>
    </div>
  );
};

export default InvoicesCollections;
