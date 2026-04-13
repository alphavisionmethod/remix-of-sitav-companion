// ═══════════════════════════════════════════════════════════════
// Bill Detail Pane — Right panel for Finance Bills ModuleWorkspace
// ═══════════════════════════════════════════════════════════════

import { CheckCircle, Trash2, Zap, CreditCard } from "lucide-react";
import { SitaCard, SitaCardTitle, SitaButton } from "@/components/sita/SitaCard";
import { EmptyState } from "@/components/sita/SitaComponents";
import { format, parseISO } from "date-fns";

const statusConfig: Record<string, { label: string; color: string }> = {
  due: { label: "Due", color: "bg-urgency-high/10 text-urgency-high border-urgency-high/20" },
  upcoming: { label: "Upcoming", color: "bg-state-queued/10 text-state-queued border-state-queued/20" },
  overdue: { label: "Overdue", color: "bg-urgency-critical/10 text-urgency-critical border-urgency-critical/20" },
  paid: { label: "Paid", color: "bg-trust-verified/10 text-trust-verified border-trust-verified/20" },
  scheduled: { label: "Scheduled", color: "bg-state-approved/10 text-state-approved border-state-approved/20" },
};

interface BillDetailPaneProps {
  bill: any;
  onMarkPaid?: () => void;
  onSimulate?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function BillDetailPane({ bill, onMarkPaid, onSimulate, onEdit, onDelete }: BillDetailPaneProps) {
  if (!bill) {
    return <EmptyState icon={CreditCard} title="Select a bill" description="Click on a bill to see details, payment history, and available actions" />;
  }

  const st = statusConfig[bill.computedStatus] || statusConfig.upcoming;

  return (
    <div className="space-y-4">
      <SitaCard hover={false} glow className="p-5">
        <SitaCardTitle sub={bill.category || "Uncategorized"}>{bill.payee}</SitaCardTitle>
        <p className="mt-2 font-display text-2xl font-bold gradient-sita-text">
          ${Number(bill.amount).toLocaleString()}
        </p>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Due</span>
            <span className={bill.computedStatus === "overdue" ? "text-urgency-critical font-semibold" : "text-foreground"}>
              {format(parseISO(bill.due_date), "MMM d, yyyy")}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className={`inline-flex items-center rounded-md border px-1.5 py-px text-[10px] font-medium ${st.color}`}>{st.label}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Recurring</span>
            <span className="text-foreground">{bill.recurring ? bill.frequency || "Yes" : "No"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Auto-Pay</span>
            <span className="text-foreground">{bill.auto_pay ? "Active" : "Off"}</span>
          </div>
          {bill.notes && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Notes</span>
              <span className="text-foreground text-right max-w-[180px] truncate">{bill.notes}</span>
            </div>
          )}
        </div>
      </SitaCard>

      <div className="flex gap-2 flex-wrap">
        {bill.computedStatus !== "paid" && onMarkPaid && (
          <SitaButton variant="primary" size="sm" className="flex-1" onClick={onMarkPaid}>
            <CheckCircle className="h-3.5 w-3.5" /> Mark Paid
          </SitaButton>
        )}
        {bill.computedStatus !== "paid" && onSimulate && (
          <SitaButton variant="secondary" size="sm" onClick={onSimulate}>
            <Zap className="h-3.5 w-3.5" /> Simulate
          </SitaButton>
        )}
        {onEdit && (
          <SitaButton variant="secondary" size="sm" onClick={onEdit}>Edit</SitaButton>
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
