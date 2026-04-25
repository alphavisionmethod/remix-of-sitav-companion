import { motion } from "framer-motion";
import { GlassCard } from "@/platform/sita/components/sita/PremiumPageComponents";
import { Package, CheckCircle } from "lucide-react";

export interface PrepItem {
  id: string;
  title: string;
  done: boolean;
}

export interface PrepBundle {
  id: string;
  label: string;
  context: string;
  items: PrepItem[];
  dueLabel?: string;
}

export function GroupedPrepBundleCard({ bundle }: { bundle: PrepBundle }) {
  const doneCount = bundle.items.filter((i) => i.done).length;
  const pct = bundle.items.length > 0 ? Math.round((doneCount / bundle.items.length) * 100) : 0;

  return (
    <GlassCard glow="none" className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <Package className="h-4 w-4 text-accent" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">{bundle.label}</p>
          <p className="text-[9px] text-muted-foreground">{bundle.context}</p>
        </div>
        <span className="text-[10px] font-medium text-primary shrink-0">{pct}%</span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-secondary/40 overflow-hidden mb-3">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="space-y-1">
        {bundle.items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 py-1">
            <CheckCircle className={`h-3 w-3 shrink-0 ${item.done ? "text-chart-2" : "text-muted-foreground/30"}`} />
            <span className={`text-[11px] ${item.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{item.title}</span>
          </div>
        ))}
      </div>

      {bundle.dueLabel && <p className="text-[9px] text-muted-foreground mt-2 pt-2 border-t border-border/20">Due: {bundle.dueLabel}</p>}
    </GlassCard>
  );
}
