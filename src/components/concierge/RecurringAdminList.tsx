import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { RefreshCw, Zap, Calendar } from "lucide-react";

export interface RecurringAdminItem {
  id: string;
  title: string;
  frequency: string;
  category: string;
  nextDue?: string;
  automatable: boolean;
  simplificationHint?: string;
}

export const RecurringAdminList = ({ items, className }: { items: RecurringAdminItem[]; className?: string }) => (
  <motion.div
    className={cn("rounded-2xl border border-border/50 bg-card p-4", className)}
    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-center gap-2 mb-3">
      <RefreshCw className="h-4 w-4 text-accent" />
      <p className="text-xs font-semibold text-foreground">Recurring Admin</p>
      <span className="ml-auto text-[10px] text-muted-foreground">{items.length} items</span>
    </div>
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.id} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 bg-secondary/15 hover:bg-secondary/25 transition-colors">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-foreground truncate">{item.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] text-muted-foreground">{item.frequency}</span>
              <span className="text-[9px] text-muted-foreground">· {item.category}</span>
              {item.nextDue && (
                <span className="flex items-center gap-0.5 text-[9px] text-primary">
                  <Calendar className="h-2.5 w-2.5" />{item.nextDue}
                </span>
              )}
            </div>
            {item.simplificationHint && (
              <p className="text-[9px] text-accent mt-0.5">💡 {item.simplificationHint}</p>
            )}
          </div>
          {item.automatable && (
            <span className="flex items-center gap-0.5 rounded-full bg-chart-2/10 px-2 py-0.5 text-[8px] font-medium text-chart-2 shrink-0">
              <Zap className="h-2.5 w-2.5" />Auto
            </span>
          )}
        </div>
      ))}
    </div>
  </motion.div>
);
