import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Wrench, Clock, ArrowRight } from "lucide-react";

export interface ServiceFollowUp {
  id: string;
  vendorName: string;
  reason: string;
  daysWaiting: number;
  urgency: "high" | "medium" | "low";
  linkedTasks?: string[];
}

const urgencyColor = { high: "text-destructive", medium: "text-amber-500", low: "text-muted-foreground" };
const urgencyBg = { high: "bg-destructive/8", medium: "bg-amber-500/8", low: "bg-secondary/30" };

export const ServiceFollowUpCard = ({ items, className }: { items: ServiceFollowUp[]; className?: string }) => (
  <motion.div
    className={cn("rounded-2xl border border-border/50 bg-card p-4", className)}
    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-center gap-2 mb-3">
      <Wrench className="h-4 w-4 text-accent" />
      <p className="text-xs font-semibold text-foreground">Service Follow-ups</p>
      <span className="ml-auto text-[10px] text-muted-foreground">{items.length} pending</span>
    </div>
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.id} className={cn("rounded-lg px-3 py-2.5", urgencyBg[item.urgency])}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-foreground">{item.vendorName}</p>
            <span className={cn("text-[9px] font-medium flex items-center gap-1", urgencyColor[item.urgency])}>
              <Clock className="h-2.5 w-2.5" />{item.daysWaiting}d waiting
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">{item.reason}</p>
          {item.linkedTasks && item.linkedTasks.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <ArrowRight className="h-2.5 w-2.5 text-primary" />
              <span className="text-[9px] text-primary">{item.linkedTasks.join(", ")}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  </motion.div>
);
