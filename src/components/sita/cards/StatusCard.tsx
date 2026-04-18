import { cn } from "@/lib/utils";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type HealthStatus = "healthy" | "degraded" | "down" | "unknown";

interface StatusCardProps {
  label: string;
  status: HealthStatus;
  lastChecked?: string;
  confidence?: number; // 0-100
  icon?: ReactNode;
  className?: string;
}

const STATUS_DOT: Record<HealthStatus, string> = {
  healthy:  "bg-[hsl(152_55%_48%)] shadow-[0_0_6px_hsl(152_55%_48%/0.4)]",
  degraded: "bg-[hsl(38_85%_58%)] shadow-[0_0_6px_hsl(38_85%_58%/0.4)]",
  down:     "bg-[hsl(0_70%_55%)] shadow-[0_0_6px_hsl(0_70%_55%/0.4)]",
  unknown:  "bg-[hsl(0_0%_45%)]",
};

export function StatusCard({ label, status, lastChecked, confidence, icon, className }: StatusCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-3",
        "flex items-center gap-3",
        className
      )}
    >
      <div className={cn("w-2 h-2 rounded-full shrink-0", STATUS_DOT[status])} />
      {icon && <span className="shrink-0 text-[hsl(0_0%_60%)]">{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_85%)] truncate")}>{label}</p>
        {lastChecked && <p className={cn(SITA_TYPE.timelineMeta)}>{lastChecked}</p>}
      </div>
      {confidence !== undefined && (
        <div className="w-12 shrink-0">
          <div className="h-1 rounded-full bg-[hsl(0_0%_100%/0.06)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${confidence}%`,
                background: confidence > 80 ? "hsl(152 55% 48%)" : confidence > 50 ? "hsl(38 85% 58%)" : "hsl(0 70% 55%)",
              }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
