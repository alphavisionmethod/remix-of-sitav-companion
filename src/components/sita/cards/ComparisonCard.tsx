import { cn } from "@/lib/utils";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

interface ComparisonSide { label: string; value: string; detail?: string; }

interface ComparisonCardProps {
  title: string;
  before: ComparisonSide;
  after: ComparisonSide;
  delta?: string;
  deltaPositive?: boolean;
  recommendation?: ReactNode;
  className?: string;
}

export function ComparisonCard({ title, before, after, delta, deltaPositive, recommendation, className }: ComparisonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-5",
        className
      )}
    >
      <h4 className={cn(SITA_TYPE.microLabel, "text-[hsl(0_0%_50%)] mb-4")}>{title}</h4>

      <div className="flex items-center gap-3">
        {/* Before */}
        <div className="flex-1 rounded-lg bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_100%/0.04)] p-3">
          <p className={cn(SITA_TYPE.microLabel, "text-[hsl(0_0%_40%)] mb-1")}>{before.label}</p>
          <p className={cn("text-[18px] font-semibold tabular-nums text-[hsl(0_0%_85%)]")}>{before.value}</p>
          {before.detail && <p className={cn(SITA_TYPE.timelineMeta, "mt-0.5")}>{before.detail}</p>}
        </div>

        {/* Arrow + Delta */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <ArrowRight className="h-4 w-4 text-[hsl(0_0%_40%)]" />
          {delta && (
            <span className={cn(SITA_TYPE.microLabel, deltaPositive ? "text-[hsl(152_55%_48%)]" : "text-[hsl(0_70%_55%)]")}>{delta}</span>
          )}
        </div>

        {/* After */}
        <div className="flex-1 rounded-lg bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_100%/0.04)] p-3">
          <p className={cn(SITA_TYPE.microLabel, "text-[hsl(0_0%_40%)] mb-1")}>{after.label}</p>
          <p className={cn("text-[18px] font-semibold tabular-nums text-[hsl(0_0%_85%)]")}>{after.value}</p>
          {after.detail && <p className={cn(SITA_TYPE.timelineMeta, "mt-0.5")}>{after.detail}</p>}
        </div>
      </div>

      {recommendation && <div className="mt-3 pt-3 border-t border-[hsl(0_0%_100%/0.04)]">{recommendation}</div>}
    </motion.div>
  );
}
