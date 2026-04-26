import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LeadScoreResult } from "@/domains/business";
import type { InboxItem } from "./mock-inbox-data";
import type { PriorityTier } from "@/domains/business";
import { PRIORITY_TIER_META } from "@/domains/engines/lead-scoring-engine";

interface Props {
  items: InboxItem[];
  scoreMap: Map<string, LeadScoreResult>;
  className?: string;
}

const formatValue = (v: number) => {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
};

export const LeadValuePipeline = ({ items, scoreMap, className }: Props) => {
  const tiers: PriorityTier[] = ["critical-now", "high-priority", "active-watch", "nurture", "recovery-candidate", "low-priority"];

  const tierData = tiers.map(tier => {
    const tierItems = items.filter(i => scoreMap.get(i.id)?.priorityTier === tier);
    const totalValue = tierItems.reduce((sum, i) => sum + (i.estimated_value || 0), 0);
    return { tier, count: tierItems.length, value: totalValue, meta: PRIORITY_TIER_META[tier] };
  }).filter(d => d.count > 0);

  const maxValue = Math.max(...tierData.map(d => d.value), 1);
  const totalPipeline = tierData.reduce((s, d) => s + d.value, 0);

  return (
    <div className={cn("rounded-2xl border border-border/40 bg-card p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-foreground">Value Pipeline</p>
        <p className="font-display text-lg font-bold text-foreground">{formatValue(totalPipeline)}</p>
      </div>
      <div className="space-y-3">
        {tierData.map((d, i) => (
          <div key={d.tier} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.meta.color }} />
                <span className="text-[10px] font-medium text-foreground">{d.meta.label}</span>
                <span className="text-[9px] text-muted-foreground">({d.count})</span>
              </div>
              <span className="text-[11px] font-bold text-foreground tabular-nums">{formatValue(d.value)}</span>
            </div>
            <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(4, (d.value / maxValue) * 100)}%` }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="h-full rounded-full"
                style={{ backgroundColor: d.meta.color, opacity: 0.75 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
