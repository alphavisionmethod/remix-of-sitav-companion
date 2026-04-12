import { SitaCard, SitaCardTitle, SitaButton } from "@/components/sita/SitaCard";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { DollarSign, Clock, AlertTriangle, Send, ArrowRight, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  customer: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  lastReminder?: string;
  reminderCount: number;
  sensitivity: "normal" | "sensitive" | "vip";
  readyToSend: boolean;
}

interface InvoiceCollectionsQueueProps {
  title?: string;
  items: InvoiceItem[];
  onSendReminder?: (id: string) => void;
  onView?: (id: string) => void;
  maxItems?: number;
}

export function InvoiceCollectionsQueue({ title = "Collections Queue", items, onSendReminder, onView, maxItems = 6 }: InvoiceCollectionsQueueProps) {
  const visible = items.slice(0, maxItems);
  const totalOverdue = items.reduce((sum, i) => sum + i.amount, 0);

  return (
    <SitaCard hover={false} lane="action" className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-amber-500" />
          <SitaCardTitle>{title}</SitaCardTitle>
        </div>
        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
          ${totalOverdue.toLocaleString()} overdue
        </span>
      </div>

      <div className="space-y-2">
        {visible.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onView?.(item.id)}
            className="flex items-center gap-3 rounded-xl border border-border/40 bg-secondary/20 p-2.5 cursor-pointer hover:bg-secondary/40 transition-all"
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
              item.daysOverdue > 30 ? "bg-destructive/10" : item.daysOverdue > 14 ? "bg-amber-500/10" : "bg-primary/10"
            }`}>
              <DollarSign className={`h-4 w-4 ${
                item.daysOverdue > 30 ? "text-destructive" : item.daysOverdue > 14 ? "text-amber-500" : "text-primary"
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-foreground truncate">{item.invoiceNumber}</p>
                <span className="font-display text-xs font-bold text-foreground">${item.amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{item.customer}</span>
                <span>·</span>
                <span className={item.daysOverdue > 30 ? "text-destructive font-medium" : item.daysOverdue > 14 ? "text-amber-500" : ""}>
                  {item.daysOverdue}d overdue
                </span>
                {item.reminderCount > 0 && <span>· {item.reminderCount} reminder{item.reminderCount > 1 ? "s" : ""}</span>}
                {item.sensitivity !== "normal" && (
                  <span className="text-chart-4 font-medium capitalize">{item.sensitivity}</span>
                )}
              </div>
            </div>
            {item.readyToSend && (
              <button onClick={(e) => { e.stopPropagation(); onSendReminder?.(item.id); }} className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0">
                <Send className="h-3 w-3" />
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {items.length > maxItems && (
        <p className="mt-2 text-center text-[10px] text-muted-foreground">+{items.length - maxItems} more overdue invoices</p>
      )}
    </SitaCard>
  );
}
