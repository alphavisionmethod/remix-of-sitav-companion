// ═══════════════════════════════════════════════════════════════
// SITA OS — Proposals & Contracts (Phase 3 — DB-wired)
// Real proposals lineage with quote/invoice transitions, plus the
// canonical "Templates / Clauses / Win-Loss" tabs as honestly
// future-facing surfaces (no fake mock data shown as live).
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSignature, Clock, CheckCircle, AlertCircle, Plus, Send, DollarSign,
  TrendingUp, Zap, BarChart3, FileText, BookOpen, ChevronRight, Timer,
  ArrowRight, X, Trash2, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useAction } from "@/hooks/use-action";
import { useDraftAutosave } from "@/hooks/useDraftAutosave";
import { setLinkedContext, consumeLinkedContext } from "@/platform/sita/components/sita/CrossAppAction";
import { useRequestSignature, useResendSignatureLink, usePendingSignatures } from "@/hooks/use-phase10-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RotateCw } from "lucide-react";

import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import HierarchyHint from "@/modules/business/components/business/shared/HierarchyHint";
import { ModuleAdvisorInsight } from "@/platform/sita/components/sita/domain-shared/ModuleAdvisorInsight";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
  draft: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted", label: "Draft" },
  sent: { icon: Send, color: "text-blue-500", bg: "bg-blue-500/15", label: "Sent" },
  accepted: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/15", label: "Accepted" },
  signed: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/15", label: "Signed" },
  rejected: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/15", label: "Rejected" },
  expired: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/15", label: "Expired" },
};

type Tab = "proposals" | "templates" | "clauses" | "analytics";

const ProposalsContracts = () => {
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const pageLabel = primaryMode === "agency" ? "Pitches & Contracts"
    : primaryMode === "service" ? "Proposals & Agreements"
    : primaryMode === "professional-practice" ? "Service Agreements"
    : "Proposals & Contracts";

  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("proposals");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const { draft, updateDraft, clearDraft } = useDraftAutosave<{ title: string; scope: string }>(
    "business:proposal:new", "business",
  );
  const [form, setForm] = useState({ title: draft.title ?? "", scope: draft.scope ?? "" });

  // ── Live data ──────────────────────────────────────────────
  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ["proposals", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await fromTable("proposals")
        .select("*, customers(display_name), crm_contacts(display_name), crm_companies(name), quotes(title, amount_cents)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((p: Record<string, any>) => ({
        ...p,
        customer_label:
          p.customers?.display_name ?? p.crm_contacts?.display_name ?? p.crm_companies?.name ?? null,
        source_quote_title: p.quotes?.title ?? null,
        amount_cents:
          (p.quotes?.amount_cents as number | null) ??
          ((p.content as Record<string, unknown> | null)?.source_quote_amount_cents as number | null) ??
          0,
      }));
    },
    enabled: !!user,
  });

  // ── Actions ─────────────────────────────────────────────────
  const addProposal = useAction("business", "proposal.create", {
    successMessage: "Proposal created",
    invalidateKeys: [["proposals"]],
    onSuccess: () => { clearDraft(); setShowAdd(false); setForm({ title: "", scope: "" }); },
  });
  const updateStatus = useAction("business", "proposal.status", {
    successMessage: "Proposal updated",
    invalidateKeys: [["proposals"]],
  });
  const deleteProposal = useAction("business", "proposal.delete", {
    successMessage: "Proposal deleted",
    invalidateKeys: [["proposals"]],
    onSuccess: () => setSelectedId(null),
  });
  const requestSig = useRequestSignature();
  const resendSig = useResendSignatureLink();
  const [signFor, setSignFor] = useState<{ id: string; email: string } | null>(null);
  const [resendFor, setResendFor] = useState<{
    signatureId: string;
    proposalId: string;
    proposalTitle: string;
    signerEmail: string;
  } | null>(null);
  const convertToInvoice = useAction("business", "proposal.convert-to-invoice", {
    successMessage: "Invoice drafted from proposal",
    invalidateKeys: [["proposals"], ["invoices"]],
    onSuccess: (data) => {
      const result = (data?.result ?? data) as Record<string, unknown> | null;
      const newId = (result?.id as string | undefined) ?? "new";
      setLinkedContext({ entityType: "invoice", entityId: newId, entityLabel: "Drafted from proposal" });
      navigate("/business/invoices");
    },
  });

  // Auto-select if we arrived via a CrossAppAction (e.g. quote → proposal).
  useEffect(() => {
    const linked = consumeLinkedContext();
    if (linked?.entityType === "proposal" && linked.entityId && linked.entityId !== "new") {
      setSelectedId(linked.entityId);
    }
  }, []);

  const selected = proposals.find((p: Record<string, any>) => p.id === selectedId);

  const totalValue = proposals.reduce(
    (s: number, p: Record<string, any>) => s + (Number(p.amount_cents) || 0),
    0,
  );
  const activeCount = proposals.filter(
    (p: Record<string, any>) => !["accepted", "signed", "rejected", "expired"].includes(p.status),
  ).length;
  const signedCount = proposals.filter(
    (p: Record<string, any>) => ["accepted", "signed"].includes(p.status),
  ).length;
  const winRate = proposals.length === 0 ? 0
    : Math.round((signedCount / proposals.length) * 100);

  const tabs: { key: Tab; label: string; icon: typeof FileSignature }[] = [
    { key: "proposals", label: "Proposals", icon: FileSignature },
    { key: "templates", label: "Templates", icon: BookOpen },
    { key: "clauses", label: "Clause Library", icon: FileText },
    { key: "analytics", label: "Win/Loss Analysis", icon: BarChart3 },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageTruthBanner truthState="live" />
      <HierarchyHint tier="workflow" surface="Proposals" description="Contracts and statements of work" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{pageLabel}</h1>
          <p className="text-sm text-muted-foreground">
            Convert accepted quotes into proposals, then into invoices — with full lineage.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Proposal
        </button>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: FileSignature, label: "Active Proposals", value: String(activeCount), sub: `${proposals.length} total`, color: "text-primary" },
          { icon: TrendingUp, label: "Win Rate", value: `${winRate}%`, sub: `${signedCount} signed`, color: "text-emerald-500" },
          { icon: Timer, label: "Drafts", value: String(proposals.filter((p: Record<string, any>) => p.status === "draft").length), sub: "Unsent", color: "text-blue-500" },
          { icon: DollarSign, label: "Pipeline Value", value: totalValue > 0 ? `$${(totalValue / 100000).toFixed(1)}K` : "$0", sub: `${proposals.length} proposals`, color: "text-amber-500" },
          { icon: BarChart3, label: "Sent (Awaiting)", value: String(proposals.filter((p: Record<string, any>) => p.status === "sent").length), sub: "Decision pending", color: "text-purple-500" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border/40 bg-card/50 p-4">
            <s.icon className={cn("h-4 w-4 mb-2", s.color)} />
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
            <p className="text-[10px] text-primary/60 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Add form ── */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="rounded-xl border border-border/40 bg-card/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">New Proposal</span>
                <button onClick={() => setShowAdd(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <input
                value={form.title}
                onChange={(e) => { const v = e.target.value; setForm(f => ({ ...f, title: v })); updateDraft({ title: v }); }}
                placeholder="Proposal title *"
                className="w-full rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <textarea
                value={form.scope}
                onChange={(e) => { const v = e.target.value; setForm(f => ({ ...f, scope: v })); updateDraft({ scope: v }); }}
                placeholder="Scope of work…"
                rows={3}
                className="w-full rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <button
                onClick={() => addProposal.mutate({ title: form.title.trim(), scope: form.scope || null, status: "draft" })}
                disabled={addProposal.isPending || !form.title.trim()}
                className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {addProposal.isPending ? "Creating…" : "Create Proposal"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tab Bar ── */}
      <div className="flex gap-1 border-b border-border/40 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
              activeTab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* ── Proposals tab ── */}
      {activeTab === "proposals" && (
        <div className="space-y-2">
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}</div>
          ) : proposals.length === 0 ? (
            <PremiumEmptyState
              variant="no-data"
              icon={FileSignature}
              domain="business"
              title="No proposals yet"
              description="Create one manually, or convert an accepted quote into a proposal."
            />
          ) : (
            proposals.map((p: Record<string, any>, i: number) => {
              const sc = statusConfig[p.status] ?? statusConfig.draft;
              const Icon = sc.icon;
              const isExpanded = selectedId === p.id;
              const amount = p.amount_cents ? `$${(p.amount_cents / 100).toLocaleString()}` : "—";
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl border border-border/40 bg-card/50 hover:border-primary/30 transition-colors overflow-hidden"
                >
                  <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setSelectedId(isExpanded ? null : p.id)}>
                    <FileSignature className="h-5 w-5 text-primary/60 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {p.customer_label ?? "No contact"} · {amount}
                      </p>
                    </div>
                    <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full capitalize", sc.bg, sc.color)}>
                      <Icon className="h-3 w-3" /> {sc.label}
                    </span>
                    <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", isExpanded && "rotate-90")} />
                  </div>

                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="border-t border-border/20 p-4 bg-muted/20 space-y-3">
                      {/* Lineage */}
                      {(p.source_quote_title || p.converted_invoice_id) && (
                        <div className="flex flex-wrap gap-2">
                          {p.source_quote_title && (
                            <button
                              onClick={() => { setLinkedContext({ entityType: "quote", entityId: p.quote_id, entityLabel: p.source_quote_title }); navigate("/business/quotes"); }}
                              className="text-[10px] text-primary hover:underline inline-flex items-center gap-1"
                            >
                              ← From quote: {p.source_quote_title}
                            </button>
                          )}
                          {p.converted_invoice_id && (
                            <button
                              onClick={() => { setLinkedContext({ entityType: "invoice", entityId: p.converted_invoice_id, entityLabel: "From proposal" }); navigate("/business/invoices"); }}
                              className="text-[10px] text-emerald-500 hover:underline inline-flex items-center gap-1"
                            >
                              → Invoice drafted
                            </button>
                          )}
                        </div>
                      )}

                      {p.scope && (
                        <p className="text-[11px] text-muted-foreground whitespace-pre-wrap">{p.scope}</p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {p.status === "draft" && (
                          <button
                            onClick={() => updateStatus.mutate({ id: p.id, status: "sent" })}
                            className="text-[10px] bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-medium hover:bg-primary/90"
                          >
                            <Send className="inline h-3 w-3 mr-1" /> Mark Sent
                          </button>
                        )}
                        {p.status === "sent" && (
                          <>
                            <button
                              onClick={() => updateStatus.mutate({ id: p.id, status: "accepted" })}
                              className="text-[10px] bg-emerald-500 text-foreground px-3 py-1.5 rounded-lg font-medium hover:opacity-90"
                            >
                              <CheckCircle className="inline h-3 w-3 mr-1" /> Mark Accepted
                            </button>
                            <button
                              onClick={() => updateStatus.mutate({ id: p.id, status: "rejected" })}
                              className="text-[10px] border border-destructive/40 text-destructive px-3 py-1.5 rounded-lg font-medium hover:bg-destructive/10"
                            >
                              Mark Rejected
                            </button>
                          </>
                        )}
                        {(p.status === "accepted" || p.status === "signed") && !p.converted_invoice_id && (
                          <button
                            onClick={() => convertToInvoice.mutate({ proposal_id: p.id })}
                            disabled={convertToInvoice.isPending}
                            className="text-[10px] bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-500/20 disabled:opacity-50"
                          >
                            <ArrowRight className="inline h-3 w-3 mr-1" /> {convertToInvoice.isPending ? "Drafting…" : "Convert to Invoice"}
                          </button>
                        )}
                        {["sent", "accepted"].includes(p.status) && p.status !== "signed" && (
                          <button
                            onClick={() => setSignFor({ id: p.id, email: "" })}
                            className="text-[10px] bg-primary/10 text-primary border border-primary/30 px-3 py-1.5 rounded-lg font-medium hover:bg-primary/20"
                          >
                            <FileSignature className="inline h-3 w-3 mr-1" /> Request Signature
                          </button>
                        )}
                        <button
                          onClick={() => deleteProposal.mutate({ id: p.id })}
                          className="text-[10px] text-muted-foreground border border-border/40 px-3 py-1.5 rounded-lg hover:text-destructive hover:border-destructive/30"
                        >
                          <Trash2 className="inline h-3 w-3 mr-1" /> Delete
                        </button>
                      </div>
                      {["sent", "accepted"].includes(p.status) && (
                        <ProposalPendingSignatures
                          proposalId={p.id}
                          onResend={(s) =>
                            setResendFor({
                              signatureId: s.id,
                              proposalId: p.id,
                              proposalTitle: p.title,
                              signerEmail: s.signer_email,
                            })
                          }
                          resending={resendSig.isPending}
                        />
                      )}
                      {signFor?.id === p.id && (
                        <div className="mt-2 rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Send sign request to
                          </label>
                          <input
                            type="email"
                            placeholder="signer@example.com"
                            value={signFor.email}
                            onChange={(e) => setSignFor({ id: p.id, email: e.target.value })}
                            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                requestSig.mutate(
                                  {
                                    document_type: "proposal",
                                    document_id: p.id,
                                    signer_email: signFor.email.trim(),
                                  },
                                  { onSuccess: () => setSignFor(null) },
                                )
                              }
                              disabled={!signFor.email.includes("@") || requestSig.isPending}
                              className="text-[10px] bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-medium disabled:opacity-50 inline-flex items-center gap-1"
                            >
                              {requestSig.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileSignature className="h-3 w-3" />}
                              Send link
                            </button>
                            <button
                              onClick={() => setSignFor(null)}
                              className="text-[10px] text-muted-foreground border border-border/40 px-3 py-1.5 rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* ── Templates / Clauses / Analytics — honestly future-facing ── */}
      {activeTab === "templates" && (
        <PremiumEmptyState
          variant="connect-to-activate"
          icon={BookOpen}
          domain="business"
          title="Template library — coming soon"
          description="Save proven proposal structures as reusable templates. This surface will be wired to a real template store in a follow-up release."
        />
      )}
      {activeTab === "clauses" && (
        <PremiumEmptyState
          variant="connect-to-activate"
          icon={FileText}
          domain="business"
          title="Clause library — coming soon"
          description="Reusable, vetted contract clauses (NDA, SLA, IP, payment terms). Coming after legal-content review."
        />
      )}
      {activeTab === "analytics" && (
        <PremiumEmptyState
          variant="no-data"
          icon={BarChart3}
          domain="business"
          title="Win/loss analytics — coming soon"
          description="Once you have at least 10 decided proposals, this surface will show why deals close (or don't)."
        />
      )}

      <ModuleAdvisorInsight
        advisorName="Proposal Advisor"
        domain="business"
        insight={proposals.length === 0
          ? "Convert your first accepted quote into a proposal to start the lineage."
          : `You have ${activeCount} active proposal${activeCount === 1 ? "" : "s"}. Sent proposals close 2× faster when followed up within 48h.`}
        confidence={proposals.length === 0 ? 60 : 84}
      />

      <AlertDialog
        open={!!resendFor}
        onOpenChange={(o) => { if (!o) setResendFor(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resend signature link?</AlertDialogTitle>
            <AlertDialogDescription>
              {resendFor
                ? `A new email will be sent to ${resendFor.signerEmail} with the secure signing link for "${resendFor.proposalTitle}". The existing link remains valid until expiry.`
                : "This sends a fresh email with the signing link."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!resendFor) return;
                resendSig.mutate(
                  {
                    signature_id: resendFor.signatureId,
                    document_type: "proposal",
                    document_id: resendFor.proposalId,
                    document_label: `proposal "${resendFor.proposalTitle}"`,
                  },
                  { onSettled: () => setResendFor(null) },
                );
              }}
            >
              Resend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProposalsContracts;

// ── Per-proposal pending signatures pane ────────────────────
interface PendingSignatureRow {
  id: string;
  signer_email: string;
  signer_name?: string | null;
  status: string;
  sent_at?: string | null;
}

function ProposalPendingSignatures({
  proposalId,
  onResend,
  resending,
}: {
  proposalId: string;
  onResend: (sig: PendingSignatureRow) => void;
  resending: boolean;
}) {
  const { data: sigs = [] } = usePendingSignatures("proposal", proposalId);
  if (!sigs.length) return null;
  return (
    <div className="mt-2 rounded-lg border border-urgency-medium/30 bg-urgency-medium/5 p-3 space-y-2">
      <div className="flex items-center gap-1.5">
        <FileSignature className="h-3 w-3 text-urgency-medium" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-urgency-medium">
          Pending signatures
        </span>
      </div>
      <ul className="space-y-1.5">
        {(sigs as PendingSignatureRow[]).map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-2 text-[11px]">
            <div className="min-w-0 flex-1">
              <p className="truncate text-foreground">{s.signer_email}</p>
              <p className="text-[10px] text-muted-foreground capitalize">
                {s.status}
                {s.sent_at && ` · sent ${new Date(s.sent_at).toLocaleDateString()}`}
              </p>
            </div>
            <button
              onClick={() => onResend(s)}
              disabled={resending}
              className="text-[10px] inline-flex items-center gap-1 border border-primary/30 bg-primary/10 text-primary px-2.5 py-1 rounded-md font-medium hover:bg-primary/20 disabled:opacity-50"
            >
              <RotateCw className="h-3 w-3" /> Resend link
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
