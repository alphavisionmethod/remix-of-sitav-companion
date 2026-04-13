import { cn } from "@/lib/utils";
import { SITA_TYPE } from "@/lib/design-system/sita-design-tokens";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ReactNode } from "react";

interface KPI { label: string; value: string; trend?: "up" | "down" | "flat"; }

interface SummaryCardProps {
  title: string;
  kpis: KPI[];
  className?: string;
  icon?: ReactNode;
}

export function SummaryCard({ title, kpis, className, icon }: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4",
        "shadow-[0_1px_4px_hsl(0_0%_0%/0.06)]",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className={cn(SITA_TYPE.microLabel, "text-[hsl(0_0%_50%)]")}>{title}</h4>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {kpis.map(k => (
          <div key={k.label}>
            <p className={cn("text-[20px] font-semibold tabular-nums text-[hsl(0_0%_92%)]")}>{k.value}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {k.trend === "up" && <TrendingUp className="h-3 w-3 text-[hsl(152_55%_48%)]" />}
              {k.trend === "down" && <TrendingDown className="h-3 w-3 text-[hsl(0_70%_55%)]" />}
              {k.trend === "flat" && <Minus className="h-3 w-3 text-[hsl(0_0%_50%)]" />}
              <span className={cn(SITA_TYPE.timelineMeta)}>{k.label}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
