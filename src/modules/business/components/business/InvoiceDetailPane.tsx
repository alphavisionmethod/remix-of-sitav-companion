// ═══════════════════════════════════════════════════════════════
// Invoice Detail Pane — Right panel for ModuleWorkspace
// ═══════════════════════════════════════════════════════════════

import { Send, Receipt, FileText, Trash2, Loader2, CheckCircle } from "lucide-react";
import { SitaCard, SitaCardTitle, SitaButton } from "@/components/sita/SitaCard";
import { EmptyState } from "@/components/sita/SitaComponents";
import { DollarSign } from "lucide-react";

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
  onGeneratePdf?: () => void;
  onDelete?: () => void;
  sendPending?: boolean;
  pdfPending?: boolean;
}

export function InvoiceDetailPane({
  invoice, onMarkSent, onMarkPaid, onSendInvoice, onGeneratePdf, onDelete,
  sendPending, pdfPending,
}: InvoiceDetailPaneProps) {
  if (!invoice) {
    return <EmptyState icon={DollarSign} title="Select an invoice" description="Click on an invoice to see payment details and collection actions" />;
  }

  const st = statusConfig[invoice.computedStatus] || statusConfig.draft;

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
        {onGeneratePdf && (
          <SitaButton variant="secondary" size="sm" className="flex-1" onClick={onGeneratePdf} disabled={pdfPending}>
            {pdfPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
            Generate PDF
          </SitaButton>
        )}
        {onDelete && (
          <SitaButton variant="danger" size="sm" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </SitaButton>
        )}
      </div>
    </div>
  );
}
