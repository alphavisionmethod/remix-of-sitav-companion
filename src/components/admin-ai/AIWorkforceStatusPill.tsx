import { cn } from "@/lib/utils";

const INVOCATION_STATUS: Record<string, { label: string; cls: string }> = {
  queued: { label: "Queued", cls: "bg-muted text-muted-foreground" },
  running: { label: "Running", cls: "bg-blue-500/15 text-blue-400 animate-pulse" },
  success: { label: "Success", cls: "bg-green-500/15 text-green-400" },
  degraded: { label: "Degraded", cls: "bg-amber-500/15 text-amber-400" },
  fallback_success: { label: "Fallback", cls: "bg-orange-500/15 text-orange-400" },
  blocked_budget: { label: "Blocked", cls: "bg-red-500/15 text-red-400" },
  failed: { label: "Failed", cls: "bg-destructive/15 text-destructive" },
  awaiting_approval: { label: "Awaiting", cls: "bg-violet-500/15 text-violet-400" },
};

const RECOMMENDATION_STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: "New", cls: "bg-blue-500/15 text-blue-400" },
  reviewing: { label: "Reviewing", cls: "bg-amber-500/15 text-amber-400" },
  accepted: { label: "Accepted", cls: "bg-green-500/15 text-green-400" },
  rejected: { label: "Rejected", cls: "bg-red-500/15 text-red-400" },
  deferred: { label: "Deferred", cls: "bg-muted text-muted-foreground" },
  queued_for_execution: { label: "Queued", cls: "bg-violet-500/15 text-violet-400" },
};

const HEALTH_STATUS: Record<string, { label: string; cls: string }> = {
  healthy: { label: "Healthy", cls: "bg-green-500/15 text-green-400" },
  degraded: { label: "Degraded", cls: "bg-amber-500/15 text-amber-400" },
  budget_limited: { label: "Budget Limited", cls: "bg-orange-500/15 text-orange-400" },
  launch_gated: { label: "Launch Gated", cls: "bg-violet-500/15 text-violet-400" },
  misconfigured: { label: "Misconfigured", cls: "bg-red-500/15 text-red-400" },
  disabled: { label: "Disabled", cls: "bg-muted text-muted-foreground" },
};

type PillType = "invocation" | "recommendation" | "health";

export function StatusPill({ status, type = "invocation" }: { status: string; type?: PillType }) {
  const map = type === "invocation" ? INVOCATION_STATUS : type === "recommendation" ? RECOMMENDATION_STATUS : HEALTH_STATUS;
  const entry = map[status] || { label: status, cls: "bg-muted text-muted-foreground" };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", entry.cls)}>
      {entry.label}
    </span>
  );
}
