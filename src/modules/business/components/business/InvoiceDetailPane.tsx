// ═══════════════════════════════════════════════════════════════
// Invoice Detail Pane — Right panel for ModuleWorkspace
// ═══════════════════════════════════════════════════════════════

import { Send, Receipt, FileText, Trash2, Loader2, Eye, FileDown, FileSignature } from "lucide-react";
import { SitaCard, SitaCardTitle, SitaButton } from "@/platform/sita/components/sita/SitaCard";
import { EmptyState } from "@/platform/sita/components/sita/SitaComponents";
import { DollarSign } from "lucide-react";
import { useState } from "react";
import {
  useGenerateInvoicePdf,
  useRequestSignature,
  useDispatchComm,
} from "@/hooks/use-phase10-actions";

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground border-border" },
  sent: { label: "Sent", color: "bg-primary/10 text-primary border-primary/20" },
  paid: { label: "Paid", color: "bg-trust-verified/10 text-trust-verified border-trust-verified/20" },
  overdue: { label: "Overdue", color: "bg-urgency-high/10 text-urgency-high border-urgency-high/20" },
  partial: { label: "Partial", color: "bg-accent/10 text-accent border-accent/20" },
  disputed: { label: "Disputed", color: "bg-urgency-critical/10 text-urgency-critical border-urgency-critical/20" },
};

interface InvoiceDetailPaneProps {
  invoice: any;
  onMarkSent?: () => void;
  onMarkPaid?: () => void;
  onSendInvoice?: () => void;
  onRenderHtml?: () => void;
  onDelete?: () => void;
  sendPending?: boolean;
  renderPending?: boolean;
}

export function InvoiceDetailPane({
  invoice, onMarkSent, onMarkPaid, onSendInvoice, onRenderHtml, onDelete,
  sendPending, renderPending,
}: InvoiceDetailPaneProps) {
  if (!invoice) {
    return <EmptyState icon={DollarSign} title="Select an invoice" description="Click on an invoice to see payment details and collection actions" />;
  }

  const st = statusConfig[invoice.computedStatus] || statusConfig.draft;
  const generatePdf = useGenerateInvoicePdf();
  const requestSig = useRequestSignature();
  const dispatch = useDispatchComm();
  const [signerEmail, setSignerEmail] = useState("");
  const [signerOpen, setSignerOpen] = useState(false);

  const recipient =
    invoice?.customers?.email ??
    invoice?.crm_contacts?.email ??
    invoice?.metadata?.recipient_email ??
    null;

  return (
    <div className="space-y-4">
      <SitaCard hover={false} glow className="p-5">
        <SitaCardTitle sub={`${invoice.customers?.name || "No customer"} · Due ${new Date(invoice.due_date).toLocaleDateString()}`}>
          Invoice #{invoice.invoice_number}
        </SitaCardTitle>
        <p className="mt-2 font-display text-2xl font-bold gradient-sita-text">
          ${Number(invoice.amount).toLocaleString()}
        </p>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className={`inline-flex items-center rounded-md border px-1.5 py-px text-[10px] font-medium ${st.color}`}>{st.label}</span>
          </div>
          {invoice.daysOverdue > 0 && invoice.status !== "paid" && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Days Overdue</span>
              <span className="text-urgency-high font-semibold">{invoice.daysOverdue}</span>
            </div>
          )}
          {invoice.notes && (
            <div className="text-sm">
              <span className="text-muted-foreground">Notes: </span>
              <span className="text-foreground">{invoice.notes}</span>
            </div>
          )}
        </div>
      </SitaCard>

      <div className="flex gap-2 flex-wrap">
        {invoice.status === "draft" && onMarkSent && (
          <SitaButton variant="primary" size="sm" className="flex-1" onClick={onMarkSent}>
            <Send className="h-3.5 w-3.5" /> Mark Sent
          </SitaButton>
        )}
        {["draft", "sent"].includes(invoice.status) && onSendInvoice && (
          <SitaButton variant="secondary" size="sm" className="flex-1" onClick={onSendInvoice} disabled={sendPending}>
            {sendPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Send Invoice
          </SitaButton>
        )}
        {invoice.status !== "paid" && onMarkPaid && (
          <SitaButton variant="primary" size="sm" className="flex-1" onClick={onMarkPaid}>
            <Receipt className="h-3.5 w-3.5" /> Mark Paid
          </SitaButton>
        )}
        {onRenderHtml && (
          <SitaButton variant="secondary" size="sm" className="flex-1" onClick={onRenderHtml} disabled={renderPending}>
            {renderPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
            Preview HTML
          </SitaButton>
        )}
        <SitaButton
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => generatePdf.mutate(invoice.id)}
          disabled={generatePdf.isPending}
          title="Generate a verifiable PDF on the server"
        >
          {generatePdf.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
          Generate PDF
        </SitaButton>
        <SitaButton
          variant="secondary"
          size="sm"
          onClick={() => setSignerOpen((v) => !v)}
          title="Request an e-signature on this invoice"
        >
          <FileSignature className="h-3.5 w-3.5" /> E-sign
        </SitaButton>
        {recipient && (
          <SitaButton
            variant="secondary"
            size="sm"
            onClick={() =>
              dispatch.mutate({
                channel: "email",
                recipient,
                subject: `Invoice #${invoice.invoice_number}`,
                message_text: `Your invoice #${invoice.invoice_number} for $${Number(invoice.amount).toLocaleString()} is ready.`,
                subject_type: "invoice",
                subject_id: invoice.id,
              })
            }
            disabled={dispatch.isPending}
            title={`Email invoice to ${recipient}`}
          >
            {dispatch.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Email
          </SitaButton>
        )}
        {onDelete && (
          <SitaButton variant="danger" size="sm" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </SitaButton>
        )}
      </div>

      {signerOpen && (
        <div className="rounded-lg border border-border/40 bg-card/40 p-3 space-y-2">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Send sign request to
          </label>
          <input
            type="email"
            placeholder="signer@example.com"
            value={signerEmail}
            onChange={(e) => setSignerEmail(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs"
          />
          <div className="flex gap-2">
            <SitaButton
              variant="primary"
              size="sm"
              onClick={() =>
                requestSig.mutate(
                  {
                    document_type: "invoice",
                    document_id: invoice.id,
                    signer_email: signerEmail.trim(),
                  },
                  { onSuccess: () => { setSignerEmail(""); setSignerOpen(false); } },
                )
              }
              disabled={!signerEmail.includes("@") || requestSig.isPending}
            >
              {requestSig.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSignature className="h-3.5 w-3.5" />}
              Send link
            </SitaButton>
            <SitaButton variant="secondary" size="sm" onClick={() => setSignerOpen(false)}>
              Cancel
            </SitaButton>
          </div>
        </div>
      )}

      <InvoiceProofBadges invoiceId={invoice.id} />
    </div>
  );
}

// ─── Real proof badge: reads back receipts written by invoice-generate ───
import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";

function InvoiceProofBadges({ invoiceId }: { invoiceId: string }) {
  const { data: receipts = [] } = useQuery({
    queryKey: ["invoice-receipts", invoiceId],
    queryFn: async () => {
      const { data, error } = await fromTable("receipts")
        .select("id, action_key, outcome, created_at, evidence")
        .eq("subject_type", "invoice")
        .eq("subject_id", invoiceId)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) return [];
      return data ?? [];
    },
    enabled: !!invoiceId,
    staleTime: 5_000,
  });
  if (!receipts.length) return null;
  return (
    <div className="rounded-lg border border-border/40 bg-card/40 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Receipt className="h-3 w-3 text-trust-verified" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Proof Trail</span>
      </div>
      <ul className="space-y-1">
        {receipts.map((r: any) => {
          const deferred = r?.evidence?.delivery_pending === true || r?.outcome === "deferred";
          return (
            <li key={r.id} className="flex items-center justify-between text-[11px]">
              <span className="font-mono text-foreground/80">{r.action_key}</span>
              <span className={`rounded-md border px-1.5 py-px text-[9px] font-medium ${
                deferred
                  ? "bg-accent/10 text-accent border-accent/20"
                  : "bg-trust-verified/10 text-trust-verified border-trust-verified/20"
              }`}>
                {deferred ? "Logged · Provider deferred" : r.outcome}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
