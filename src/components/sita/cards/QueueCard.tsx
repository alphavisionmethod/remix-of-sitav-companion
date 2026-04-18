import { cn } from "@/lib/utils";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface QueueItem {
  id: string;
  label: string;
  meta?: string;
  urgency?: "critical" | "high" | "normal" | "low";
  badge?: ReactNode;
}

interface QueueCardProps {
  title: string;
  items: QueueItem[];
  maxVisible?: number;
  onItemClick?: (id: string) => void;
  className?: string;
}

const URGENCY_DOT: Record<string, string> = {
  critical: "bg-[hsl(0_70%_55%)] shadow-[0_0_6px_hsl(0_70%_55%/0.5)]",
  high: "bg-[hsl(38_85%_58%)]",
  normal: "bg-[hsl(210_60%_50%)]",
  low: "bg-[hsl(0_0%_45%)]",
};

export function QueueCard({ title, items, maxVisible = 5, onItemClick, className }: QueueCardProps) {
  const visible = items.slice(0, maxVisible);
  const remaining = items.length - maxVisible;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-3",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2.5">
        <h4 className={cn(SITA_TYPE.microLabel, "text-[hsl(0_0%_50%)]")}>{title}</h4>
        <span className={cn(SITA_TYPE.microLabel, "text-[hsl(0_0%_40%)]")}>{items.length}</span>
      </div>
      <div className="space-y-0.5">
        {visible.map((item, i) => (
          <button
            key={item.id}
            onClick={() => onItemClick?.(item.id)}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left hover:bg-[hsl(0_0%_100%/0.04)] transition-colors"
          >
            <span className={cn(SITA_TYPE.microLabel, "text-[hsl(0_0%_35%)] w-4 text-center tabular-nums")}>{i + 1}</span>
            <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", URGENCY_DOT[item.urgency || "normal"])} />
            <span className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_85%)] truncate flex-1")}>{item.label}</span>
            {item.meta && <span className={cn(SITA_TYPE.timelineMeta, "shrink-0")}>{item.meta}</span>}
            {item.badge}
          </button>
        ))}
      </div>
      {remaining > 0 && (
        <p className={cn(SITA_TYPE.timelineMeta, "text-center mt-2")}>+{remaining} more</p>
      )}
    </motion.div>
  );
}
