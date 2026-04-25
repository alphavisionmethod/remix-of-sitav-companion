// ═══════════════════════════════════════════════════════════════
// SITA OS — Priority Queue
// Ranked actionable items, clickable to module
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { ArrowRight, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { GlassCard } from "@/components/sita/PremiumPageComponents";
import type { LucideIcon } from "lucide-react";

export interface PriorityItem {
  id: string;
  title: string;
  subtitle: string;
  urgency: "critical" | "high" | "medium" | "low";
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

const urgencyStyles = {
  critical: { dot: "bg-[hsl(0_70%_55%)]", border: "border-[hsl(0_70%_55%/0.15)]", bg: "bg-[hsl(0_70%_55%/0.05)]" },
  high: { dot: "bg-destructive", border: "border-destructive/15", bg: "bg-destructive/5" },
  medium: { dot: "bg-[hsl(38_85%_55%)]", border: "border-[hsl(38_85%_55%/0.15)]", bg: "bg-[hsl(38_85%_55%/0.05)]" },
  low: { dot: "bg-[hsl(152_55%_48%)]", border: "border-[hsl(152_55%_48%/0.15)]", bg: "bg-[hsl(152_55%_48%/0.05)]" },
};

interface PriorityQueueProps {
  items: PriorityItem[];
  title?: string;
  maxItems?: number;
  accentColor?: string;
}

export function PriorityQueue({ items, title = "What Needs You", maxItems = 5, accentColor }: PriorityQueueProps) {
  const visible = items.slice(0, maxItems);
  if (visible.length === 0) return null;

  return (
    <GlassCard glow="none" className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="h-4 w-4" style={accentColor ? { color: accentColor } : undefined} />
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <span className="ml-auto text-[10px] rounded-full px-2 py-0.5 font-medium"
          style={accentColor ? { background: `${accentColor}15`, color: accentColor } : { background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}>
          {visible.length} item{visible.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="space-y-1.5">
        {visible.map((item, i) => {
          const style = urgencyStyles[item.urgency];
          const ItemIcon = item.icon;
          return (
            <motion.div
              key={item.id}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${style.bg} ${style.border}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className={`h-2 w-2 rounded-full shrink-0 ${style.dot}`} />
              {ItemIcon && <ItemIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-foreground truncate">{item.title}</p>
                <p className="text-[9px] text-muted-foreground truncate">{item.subtitle}</p>
              </div>
              {item.actionLabel && (
                <button
                  onClick={item.onAction}
                  className="shrink-0 flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
                >
                  {item.actionLabel} <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}
