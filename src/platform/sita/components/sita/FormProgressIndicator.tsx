// ═══════════════════════════════════════════════════════════════
// SITA OS — Form Progress Indicator
// Shows save status and auto-save indicator for forms
// ═══════════════════════════════════════════════════════════════

import { Cloud, CloudOff, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type SaveStatus = "idle" | "saving" | "saved" | "error" | "offline";

const STATUS_CONFIG: Record<SaveStatus, { icon: typeof Cloud; label: string; color: string }> = {
  idle: { icon: Cloud, label: "Ready", color: "text-muted-foreground/50" },
  saving: { icon: Loader2, label: "Saving...", color: "text-primary" },
  saved: { icon: Check, label: "Saved", color: "text-trust-safe" },
  error: { icon: CloudOff, label: "Save failed", color: "text-destructive" },
  offline: { icon: CloudOff, label: "Offline — will sync", color: "text-amber-400" },
};

export function FormProgressIndicator({ status, className }: { status: SaveStatus; className?: string }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className={cn("inline-flex items-center gap-1.5 text-[11px] font-medium", config.color, className)}>
      <Icon className={cn("h-3 w-3", status === "saving" && "animate-spin")} />
      {config.label}
    </div>
  );
}
