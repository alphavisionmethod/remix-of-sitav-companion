// ═══════════════════════════════════════════════════════════════
// SITA OS — Device Readiness Status Card
// Standalone check item with icon, label, and status
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { Check, AlertTriangle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ReadinessStatus = "checking" | "ready" | "warning" | "unavailable";

interface DeviceReadinessStatusCardProps {
  id: string;
  label: string;
  icon: LucideIcon;
  status: ReadinessStatus;
  detail?: string;
}

export function DeviceReadinessStatusCard({ id, label, icon: Icon, status, detail }: DeviceReadinessStatusCardProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/20 px-3 py-2.5">
      {status === "checking" ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Icon className="h-3.5 w-3.5 text-primary" />
        </motion.div>
      ) : status === "ready" ? (
        <Check className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" />
      ) : status === "unavailable" ? (
        <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
      ) : (
        <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--trust-warn))]" />
      )}
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "text-xs",
            status === "unavailable" ? "text-muted-foreground" : "text-foreground"
          )}
        >
          {label}
        </span>
        {detail && (
          <p className="text-[10px] text-muted-foreground truncate">{detail}</p>
        )}
      </div>
    </div>
  );
}
