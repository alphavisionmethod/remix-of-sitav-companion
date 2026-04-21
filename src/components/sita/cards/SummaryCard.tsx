import { cn } from "@/lib/utils";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
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
        "rounded-2xl border border-border/50 bg-card p-5 card-vibrant",
        "shadow-card hover:shadow-card-hover transition-all duration-300",
        "group",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h4 className={cn(SITA_TYPE.microLabel, "text-muted-foreground group-hover:text-secondary-foreground transition-colors")}>{title}</h4>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {kpis.map(k => (
          <div key={k.label}>
            <p className="text-xl font-bold tabular-nums text-foreground">{k.value}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {k.trend === "up" && <TrendingUp className="h-3 w-3 text-trust-safe" />}
              {k.trend === "down" && <TrendingDown className="h-3 w-3 text-destructive" />}
              {k.trend === "flat" && <Minus className="h-3 w-3 text-muted-foreground" />}
              <span className={cn(SITA_TYPE.timelineMeta)}>{k.label}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
