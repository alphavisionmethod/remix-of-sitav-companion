// ═══════════════════════════════════════════════════════════════
// SITA OS — A/B Slot Visualization
// Interactive dual-slot status diagram
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { HardDrive, CheckCircle, AlertTriangle, XCircle, ArrowRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SystemSlot } from "@/lib/services/update-daemon";

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  active: { color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10 border-[hsl(var(--trust-safe))]/30", label: "Active" },
  inactive: { color: "text-muted-foreground", bg: "bg-muted/30 border-border", label: "Inactive" },
  staging: { color: "text-primary", bg: "bg-primary/10 border-primary/30", label: "Staging" },
  pending_boot: { color: "text-accent", bg: "bg-accent/10 border-accent/30", label: "Pending Boot" },
  trial_boot: { color: "text-accent", bg: "bg-accent/10 border-accent/30", label: "Trial Boot" },
  confirmed_good: { color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10 border-[hsl(var(--trust-safe))]/30", label: "Confirmed" },
  rollback_target: { color: "text-accent", bg: "bg-accent/10 border-accent/30", label: "Rollback Target" },
  invalid: { color: "text-destructive", bg: "bg-destructive/10 border-destructive/30", label: "Invalid" },
};

const healthIcon = (h: string) => {
  if (h === "healthy") return <CheckCircle className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" />;
  if (h === "degraded") return <AlertTriangle className="h-3.5 w-3.5 text-accent" />;
  if (h === "failed") return <XCircle className="h-3.5 w-3.5 text-destructive" />;
  return <Shield className="h-3.5 w-3.5 text-muted-foreground" />;
};

interface Props {
  slotA: SystemSlot;
  slotB: SystemSlot;
  compact?: boolean;
}

export function UpdateSlotVisualization({ slotA, slotB, compact }: Props) {
  const renderSlot = (slot: SystemSlot) => {
    const cfg = statusConfig[slot.status] || statusConfig.inactive;
    const isActive = slot.status === "active";

    return (
      <motion.div
        layout
        className={cn(
          "relative rounded-2xl border p-4 flex-1 transition-all",
          cfg.bg,
          isActive && "shadow-[0_0_20px_-4px_hsl(var(--trust-safe)/0.25)]"
        )}
      >
        {isActive && (
          <div className="absolute -top-2 left-4 px-2 py-0.5 rounded-full bg-[hsl(var(--trust-safe))] text-[9px] font-bold text-white uppercase tracking-wider">
            Active
          </div>
        )}

        <div className="flex items-center gap-3 mb-3 mt-1">
          <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center", isActive ? "bg-[hsl(var(--trust-safe))]/15" : "bg-muted/50")}>
            <HardDrive className={cn("h-4.5 w-4.5", cfg.color)} />
          </div>
          <div>
            <p className="text-sm font-bold font-mono text-foreground">Slot {slot.id}</p>
            <p className={cn("text-[10px] font-medium", cfg.color)}>{cfg.label}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Version</span>
            <span className="font-mono font-semibold text-foreground">{slot.version}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Build</span>
            <span className="font-mono text-muted-foreground">{slot.buildId}</span>
          </div>
          {!compact && (
            <>
              <div className="flex justify-between text-xs items-center">
                <span className="text-muted-foreground">Health</span>
                <span className="flex items-center gap-1.5">{healthIcon(slot.healthStatus)} <span className="capitalize text-foreground">{slot.healthStatus}</span></span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Boot Count</span>
                <span className="text-foreground">{slot.bootCount}</span>
              </div>
              <div className="flex justify-between text-xs items-center">
                <span className="text-muted-foreground">Integrity</span>
                {slot.integrityVerified
                  ? <span className="flex items-center gap-1 text-[hsl(var(--trust-safe))]"><CheckCircle className="h-3 w-3" /> Verified</span>
                  : <span className="flex items-center gap-1 text-destructive"><XCircle className="h-3 w-3" /> Unverified</span>
                }
              </div>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex items-stretch gap-3">
      {renderSlot(slotA)}
      <div className="flex items-center">
        <ArrowRight className="h-5 w-5 text-muted-foreground/40" />
      </div>
      {renderSlot(slotB)}
    </div>
  );
}
