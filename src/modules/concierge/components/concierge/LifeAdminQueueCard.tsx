import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { FileText, Zap, Clock } from "lucide-react";

export interface AdminQueueItem {
  id: string;
  title: string;
  category: string;
  urgency: "high" | "medium" | "low";
  effort: "quick" | "medium" | "heavy";
  daysOverdue?: number;
}

const urgencyDot = { high: "bg-destructive", medium: "bg-amber-500", low: "bg-chart-2" };
const effortBadge = {
  quick: { label: "Quick win", class: "bg-chart-2/10 text-chart-2" },
  medium: { label: "~15 min", class: "bg-amber-500/10 text-amber-600" },
  heavy: { label: "30+ min", class: "bg-secondary text-muted-foreground" },
};

export const LifeAdminQueueCard = ({ items, className }: { items: AdminQueueItem[]; className?: string }) => (
  <motion.div
    className={cn("rounded-2xl border border-border/50 bg-card p-4", className)}
    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-center gap-2 mb-3">
      <FileText className="h-4 w-4 text-accent" />
      <p className="text-xs font-semibold text-foreground">Life Admin Queue</p>
      <span className="ml-auto text-[10px] text-muted-foreground">{items.length} items</span>
    </div>
    <div className="space-y-1.5">
      {items.map(item => (
        <div key={item.id} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-secondary/30 transition-colors">
          <div className={cn("h-2 w-2 rounded-full shrink-0", urgencyDot[item.urgency])} />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-foreground truncate">{item.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] text-muted-foreground">{item.category}</span>
              {item.daysOverdue && item.daysOverdue > 0 && (
                <span className="text-[9px] text-destructive font-medium">{item.daysOverdue}d overdue</span>
              )}
            </div>
          </div>
          <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-medium shrink-0", effortBadge[item.effort].class)}>
            {item.effort === "quick" && <Zap className="h-2.5 w-2.5 inline mr-0.5" />}
            {effortBadge[item.effort].label}
          </span>
        </div>
      ))}
    </div>
  </motion.div>
);
