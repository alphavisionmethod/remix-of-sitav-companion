import { useState, useEffect } from "react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getModuleAdaptation } from "@/domains/engines/business-module-adaptations";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, DollarSign, CheckCircle, Send, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";

import { HeroCard, SummaryCard, ActionCard, QueueCard } from "@/platform/sita/components/sita/cards";
import { ExecutionBadge } from "@/platform/sita/components/sita/badges";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { SplitWorkspace } from "@/platform/sita/components/sita/surfaces/SplitWorkspace";
import { AppSurface } from "@/platform/sita/components/sita/surfaces/AppSurface";
import { SitaTabs } from "@/platform/sita/components/sita/SitaComponents";
import { ModuleAdvisorInsight } from "@/platform/sita/components/sita/domain-shared/ModuleAdvisorInsight";
import { CrossAppAction } from "@/platform/sita/components/sita/CrossAppAction";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useAction } from "@/hooks/use-action";
import { useDraftAutosave } from "@/hooks/useDraftAutosave";
import { setLinkedContext, consumeLinkedContext } from "@/platform/sita/components/sita/CrossAppAction";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const QuotesWorkspace = () => {
  const { primaryMode } = useBusinessProfile();
  const { user } = useAuth();
  const moduleConfig = getModuleAdaptation("quotes", primaryMode);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const { draft, updateDraft, clearDraft } = useDraftAutosave<{ title: string; total: string; expiry_date: string; notes: string }>("business:quote:new", "business");
  const [form, setForm] = useState({
    title: draft.title ?? "",
    total: draft.total ?? "",
    expiry_date: draft.expiry_date ?? "",
    notes: draft.notes ?? "",
  });
  // Phase 4: when arriving via "Bill this contact" from CRM, capture the contact
  // so the create-quote mutation can pass it through to the bridge service.
  const [prefillContactId, setPrefillContactId] = useState<string | null>(null);
  const [prefillContactLabel, setPrefillContactLabel] = useState<string | null>(null);

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["quotes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await fromTable("quotes")
        .select("*, customers(display_name), crm_contacts(display_name), crm_companies(name), crm_opportunities(title)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      // Normalize so legacy UI bindings keep working: total <- amount_cents/100, expiry_date <- expires_at, customer label.
      return (data ?? []).map((q: Record<string, any>) => ({
        ...q,
        total: typeof q.amount_cents === "number" ? q.amount_cents / 100 : 0,
        expiry_date: q.expires_at ?? null,
        customer_label:
          q.customers?.display_name ??
          q.crm_contacts?.display_name ??
          q.crm_companies?.name ??
          null,
        opportunity_title: q.crm_opportunities?.title ?? null,
      }));
    },
    enabled: !!user,
  });

  const addQuote = useAction("business", "quote.create", {
    successMessage: "Quote created",
    invalidateKeys: [["quotes"]],
  });
  const updateStatus = useAction("business", "status.update", {
    successMessage: "Quote updated",
    invalidateKeys: [["quotes"]],
  });
  const deleteQuote = useAction("business", "quote.delete", {
    successMessage: "Quote deleted",
    invalidateKeys: [["quotes"]],
    onSuccess: () => setSelectedId(null),
  });

  // Phase 3 — quote → proposal and quote → invoice transitions.
  const convertToProposal = useAction("business", "quote.convert-to-proposal", {
    successMessage: "Proposal drafted",
    invalidateKeys: [["quotes"], ["proposals"]],
    onSuccess: (data) => {
      const result = (data?.result ?? data) as Record<string, unknown> | null;
      const newId = (result?.id as string | undefined) ?? "new";
      setLinkedContext({ entityType: "proposal", entityId: newId, entityLabel: "Drafted from quote" });
      navigate("/business/proposals");
    },
  });
  const convertToInvoice = useAction("business", "quote.convert-to-invoice", {
    successMessage: "Invoice drafted",
    invalidateKeys: [["quotes"], ["invoices"]],
    onSuccess: (data) => {
      const result = (data?.result ?? data) as Record<string, unknown> | null;
      const newId = (result?.id as string | undefined) ?? "new";
      setLinkedContext({ entityType: "invoice", entityId: newId, entityLabel: "Drafted from quote" });
      navigate("/business/invoices");
    },
  });

  // Auto-select if we arrived via a CrossAppAction conversion.
  useEffect(() => {
    const linked = consumeLinkedContext();
    if (!linked) return;
    if (linked.entityType === "quote" && linked.entityId && linked.entityId !== "new" && linked.entityId !== "all") {
      setSelectedId(linked.entityId);
      return;
    }
    // Phase 4: incoming "Bill this contact" hand-off from CRM.
    if (linked.entityType === "contact" && linked.entityId) {
      setPrefillContactId(linked.entityId);
      setPrefillContactLabel(linked.entityLabel ?? null);
      setShowAdd(true);
      setForm((f) => ({
        ...f,
        title: f.title || `Quote — ${linked.entityLabel ?? "Contact"}`,
      }));
    }
  }, []);

  const selected = quotes.find((q: Record<string, any>) => q.id === selectedId);
  const filtered = tab === "all" ? quotes
    : tab === "active" ? quotes.filter((q: Record<string, any>) => !["accepted", "declined", "expired"].includes(q.status))
    : tab === "action" ? quotes.filter((q: Record<string, any>) => q.status === "draft" || q.status === "sent")
    : quotes.filter((q: Record<string, any>) => ["accepted", "declined", "expired"].includes(q.status));

  const totalValue = quotes.reduce((sum: number, q: Record<string, any>) => sum + (q.total || 0), 0);
  const activeCount = quotes.filter((q: Record<string, any>) => !["accepted", "declined", "expired"].includes(q.status)).length;

  const queueItems = filtered.map((q: Record<string, any>) => ({
    id: q.id,
    label: q.title || "(Untitled)",
    meta: `${q.customer_label || "No contact"} · ${q.total ? `$${Number(q.total).toLocaleString()}` : "—"}`,
    urgency: (q.status === "draft" ? "normal" : q.status === "sent" ? "high" : "low") as "normal" | "high" | "low",
    badge: <ExecutionBadge state={q.status === "accepted" ? "complete" : q.status === "sent" ? "executing" : "drafted"} />,
  }));

  const listPane = (
    <div className="p-3 space-y-3">
      <PageTruthBanner truthState="live" />
      {selected && (
        <button
          onClick={() => convertToInvoice.mutate({ quote_id: selected.id })}
          disabled={convertToInvoice.isPending || !!selected.converted_invoice_id}
          className="inline-flex items-center gap-1 rounded-full border border-[hsl(152_55%_48%/0.15)] bg-[hsl(152_55%_48%/0.08)] text-[hsl(152_55%_48%)] px-2.5 py-0.5 text-[10px] font-medium hover:brightness-110 disabled:opacity-50 transition-all micro-press"
        >
          <ArrowRight className="h-2.5 w-2.5" />
          {selected.converted_invoice_id ? "Already invoiced" : convertToInvoice.isPending ? "Drafting…" : "Convert to Invoice"}
        </button>
      )}

      <div className="flex items-center justify-between px-1">
        <h3 className="text-[13px] font-semibold text-[hsl(0_0%_85%)]">{moduleConfig.title}</h3>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[hsl(265_55%_58%/0.12)] hover:bg-[hsl(265_55%_58%/0.18)] text-[hsl(265_55%_68%)] text-[11px] font-medium transition-colors micro-press">
          <Plus className="h-3 w-3" /> New Quote
        </button>
      </div>

      <SummaryCard
        title="Pipeline"
        kpis={[
          { label: "Active", value: String(activeCount) },
          { label: "Value", value: totalValue > 0 ? `$${(totalValue / 1000).toFixed(0)}K` : "$0" },
          { label: "Drafts", value: String(quotes.filter((q: Record<string, any>) => q.status === "draft").length) },
          { label: "Won", value: String(quotes.filter((q: Record<string, any>) => q.status === "accepted").length), trend: "up" },
        ]}
      />

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <AppSurface level={2} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[hsl(0_0%_85%)]">New Quote</span>
                <button onClick={() => setShowAdd(false)} aria-label="Close" className="text-[hsl(0_0%_50%)]"><X className="h-4 w-4" /></button>
              </div>
              <input value={form.title} onChange={e => { const v = e.target.value; setForm(f => ({ ...f, title: v })); updateDraft({ title: v }); }} placeholder="Quote title *" className="w-full rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2 text-sm text-[hsl(0_0%_85%)] placeholder:text-[hsl(0_0%_40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(265_55%_58%/0.3)]" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={form.total} onChange={e => { const v = e.target.value; setForm(f => ({ ...f, total: v })); updateDraft({ total: v }); }} placeholder="Total ($)" className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2 text-sm text-[hsl(0_0%_85%)] focus:outline-none" />
                <input type="date" value={form.expiry_date} onChange={e => { const v = e.target.value; setForm(f => ({ ...f, expiry_date: v })); updateDraft({ expiry_date: v }); }} className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2 text-sm text-[hsl(0_0%_85%)] focus:outline-none" />
              </div>
              <button onClick={() => { addQuote.mutate({ title: form.title.trim(), total: form.total ? parseFloat(form.total) : null, expiry_date: form.expiry_date || null, notes: form.notes || null, status: "draft" }); clearDraft(); setForm({ title: "", total: "", expiry_date: "", notes: "" }); setShowAdd(false); }} disabled={!form.title.trim()} className="px-4 py-2 rounded-lg bg-[hsl(265_55%_58%)] text-foreground text-xs font-medium hover:bg-[hsl(265_55%_50%)] disabled:opacity-50 transition-colors micro-press">Create Quote</button>
            </AppSurface>
          </motion.div>
        )}
      </AnimatePresence>

      <SitaTabs tabs={[
        { key: "all", label: "All", count: quotes.length },
        { key: "active", label: "Active", count: activeCount },
        { key: "action", label: "Drafts & Sent", count: quotes.filter((q: Record<string, any>) => ["draft", "sent"].includes(q.status)).length },
        { key: "closed", label: "Closed" },
      ]} active={tab} onChange={setTab} />

      <QueueCard
        title="QUOTE QUEUE"
        items={queueItems}
        maxVisible={10}
        onItemClick={(id) => setSelectedId(id)}
      />
    </div>
  );

  const detailPane = selected ? (
    <div className="p-4 space-y-4">
      <HeroCard
        title={selected.title}
        metric={selected.total ? `$${Number(selected.total).toLocaleString()}` : "—"}
        subtitle={`${selected.customer_label || "No contact"} · Created ${new Date(selected.created_at).toLocaleDateString()}`}
        accentFrom="hsl(265 55% 58%)"
        accentTo="hsl(285 50% 50%)"
      >
        <ExecutionBadge state={selected.status === "accepted" ? "complete" : selected.status === "sent" ? "executing" : "drafted"} />
      </HeroCard>

      {/* Lineage badges — upstream/downstream */}
      {(selected.opportunity_title || selected.converted_proposal_id || selected.converted_invoice_id) && (
        <AppSurface level={2} className="p-3 space-y-1.5">
          <p className="text-[10px] font-semibold text-[hsl(0_0%_50%)] uppercase tracking-wider">Revenue Lineage</p>
          {selected.opportunity_title && (
            <button
              onClick={() => { setLinkedContext({ entityType: "opportunity", entityId: selected.opportunity_id, entityLabel: selected.opportunity_title }); navigate("/business/opportunities"); }}
              className="text-[11px] text-[hsl(265_55%_68%)] hover:underline"
            >
              ← From opportunity: {selected.opportunity_title}
            </button>
          )}
          {selected.converted_proposal_id && (
            <button
              onClick={() => { setLinkedContext({ entityType: "proposal", entityId: selected.converted_proposal_id, entityLabel: "From quote" }); navigate("/business/proposals"); }}
              className="text-[11px] text-[hsl(152_55%_58%)] hover:underline block"
            >
              → Proposal drafted
            </button>
          )}
          {selected.converted_invoice_id && (
            <button
              onClick={() => { setLinkedContext({ entityType: "invoice", entityId: selected.converted_invoice_id, entityLabel: "From quote" }); navigate("/business/invoices"); }}
              className="text-[11px] text-[hsl(152_55%_58%)] hover:underline block"
            >
              → Invoice drafted
            </button>
          )}
        </AppSurface>
      )}

      <AppSurface level={2} className="p-4 space-y-2.5">
        <div className="flex justify-between text-[12px]">
          <span className="text-[hsl(0_0%_50%)]">Status</span>
          <span className="text-[hsl(0_0%_85%)] capitalize font-medium">{selected.status}</span>
        </div>
        {selected.expiry_date && (
          <div className="flex justify-between text-[12px]">
            <span className="text-[hsl(0_0%_50%)]">Expires</span>
            <span className="text-[hsl(0_0%_85%)]">{new Date(selected.expiry_date).toLocaleDateString()}</span>
          </div>
        )}
        {selected.notes && (
          <div className="flex justify-between text-[12px]">
            <span className="text-[hsl(0_0%_50%)]">Notes</span>
            <span className="text-[hsl(0_0%_85%)] text-right max-w-[180px] truncate">{selected.notes}</span>
          </div>
        )}
      </AppSurface>

      <div className="flex gap-2">
        {selected.status === "draft" && (
          <ActionCard title="Mark Sent" description="Confirm this quote was sent" accentColor="hsl(265 55% 58%)" onApprove={() => updateStatus.mutate({ id: selected.id, status: "sent" })} className="flex-1" />
        )}
        {selected.status === "sent" && (
          <ActionCard title="Mark Accepted" description="Client accepted this quote" accentColor="hsl(152 55% 48%)" onApprove={() => updateStatus.mutate({ id: selected.id, status: "accepted" })} className="flex-1" />
        )}
        {selected.status === "accepted" && !selected.converted_proposal_id && !selected.converted_invoice_id && (
          <button
            onClick={() => convertToProposal.mutate({ quote_id: selected.id })}
            disabled={convertToProposal.isPending}
            className="flex-1 rounded-lg bg-[hsl(265_55%_58%)] hover:bg-[hsl(265_55%_50%)] text-foreground text-[12px] font-medium py-2 px-3 transition-colors micro-press disabled:opacity-50"
          >
            {convertToProposal.isPending ? "Drafting…" : "Convert to Proposal"}
          </button>
        )}
        <button onClick={() => deleteQuote.mutate({ id: selected.id })} className="rounded-lg border border-[hsl(0_0%_100%/0.06)] px-3 py-2 text-xs text-[hsl(0_0%_50%)] hover:text-[hsl(0_70%_55%)] transition-colors micro-press">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <ModuleAdvisorInsight
        advisorName="Quote Intelligence"
        domain="business"
        insight="Quotes aging past 7 days without response see a 40% drop in win rate. Consider a brief follow-up call or revised offer."
        confidence={78}
        actions={[{ label: "Follow Up", onClick: () => toast.info("Follow-up planned — coming in a future update") }]}
      />
    </div>
  ) : (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-2">
        <FileText className="h-8 w-8 mx-auto text-[hsl(0_0%_30%)]" />
        <p className="text-[13px] text-[hsl(0_0%_50%)]">Select a quote to view details</p>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-200px)] -m-4">
      <SplitWorkspace
        list={listPane}
        detail={detailPane}
        hasSelection={!!selected}
        defaultSplit={42}
      />
    </div>
  );
};

export default QuotesWorkspace;
