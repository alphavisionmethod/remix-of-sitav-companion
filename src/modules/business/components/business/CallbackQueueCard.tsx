import { SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { Phone, Clock, AlertTriangle, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface CallbackItem {
  id: string;
  name: string;
  phone?: string;
  reason: string;
  scheduledFor: string;
  overdue: boolean;
  linkedEntity?: string;
  priority: "high" | "medium" | "low";
}

interface CallbackQueueCardProps {
  title?: string;
  items: CallbackItem[];
  onCall?: (id: string) => void;
  onDismiss?: (id: string) => void;
  maxItems?: number;
}

const priorityDot = {
  high: "bg-destructive",
  medium: "bg-amber-500",
  low: "bg-muted-foreground",
};

export function CallbackQueueCard({ title = "Callback Queue", items, onCall, onDismiss, maxItems = 6 }: CallbackQueueCardProps) {
  const visible = items.slice(0, maxItems);
  const overdueCount = items.filter(i => i.overdue).length;

  return (
    <SitaCard hover={false} className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-primary" />
          <SitaCardTitle>{title}</SitaCardTitle>
        </div>
        <div className="flex items-center gap-2">
          {overdueCount > 0 && (
            <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">{overdueCount} overdue</span>
          )}
          <span className="text-[10px] text-muted-foreground">{items.length} total</span>
        </div>
      </div>

      <div className="space-y-1.5">
        {visible.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`flex items-center gap-2.5 rounded-xl p-2.5 transition-all ${
              item.overdue ? "bg-destructive/5 border border-destructive/15" : "bg-secondary/30 border border-border/30"
            }`}
          >
            <div className={`h-2 w-2 rounded-full shrink-0 ${priorityDot[item.priority]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Clock className="h-2.5 w-2.5" />
                <span className={item.overdue ? "text-destructive font-medium" : ""}>{item.scheduledFor}</span>
                <span>·</span>
                <span className="truncate">{item.reason}</span>
              </div>
            </div>
            <button onClick={() => onCall?.(item.id)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2 hover:bg-chart-2/20 transition-colors shrink-0">
              <Phone className="h-3 w-3" />
            </button>
          </motion.div>
        ))}
      </div>

      {items.length > maxItems && (
        <p className="mt-2 text-center text-[10px] text-muted-foreground">+{items.length - maxItems} more callbacks</p>
      )}
    </SitaCard>
  );
}
