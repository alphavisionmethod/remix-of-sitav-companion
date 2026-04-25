import { cn } from "@/lib/utils";

export type ExecutionState = "proposed" | "drafted" | "simulated" | "approval-requested" | "approved" | "queued" | "executing" | "completed" | "verified" | "failed" | "escalated" | "rolled-back";

const stateConfig: Record<ExecutionState, { label: string; class: string; dot: string }> = {
  proposed: { label: "Proposed", class: "text-state-proposed bg-state-proposed/10 border-state-proposed/20", dot: "bg-state-proposed" },
  drafted: { label: "Drafted", class: "text-state-drafted bg-state-drafted/10 border-state-drafted/20", dot: "bg-state-drafted" },
  simulated: { label: "Simulated", class: "text-state-simulated bg-state-simulated/10 border-state-simulated/20", dot: "bg-state-simulated" },
  "approval-requested": { label: "Approval Requested", class: "text-state-approval-requested bg-state-approval-requested/10 border-state-approval-requested/20", dot: "bg-state-approval-requested" },
  approved: { label: "Approved", class: "text-state-approved bg-state-approved/10 border-state-approved/20", dot: "bg-state-approved" },
  queued: { label: "Queued", class: "text-state-queued bg-state-queued/10 border-state-queued/20", dot: "bg-state-queued" },
  executing: { label: "Executing", class: "text-state-executing bg-state-executing/10 border-state-executing/20", dot: "bg-state-executing" },
  completed: { label: "Completed", class: "text-state-completed bg-state-completed/10 border-state-completed/20", dot: "bg-state-completed" },
  verified: { label: "Verified", class: "text-state-verified bg-state-verified/10 border-state-verified/20", dot: "bg-state-verified" },
  failed: { label: "Failed", class: "text-state-failed bg-state-failed/10 border-state-failed/20", dot: "bg-state-failed" },
  escalated: { label: "Escalated", class: "text-state-escalated bg-state-escalated/10 border-state-escalated/20", dot: "bg-state-escalated" },
  "rolled-back": { label: "Rolled Back", class: "text-state-rolled-back bg-state-rolled-back/10 border-state-rolled-back/20", dot: "bg-state-rolled-back" },
};

export const StateBadge = ({ state, className, size = "default" }: { state: ExecutionState; className?: string; size?: "sm" | "default" }) => {
  const c = stateConfig[state];
  return (
    <span role="status" aria-label={c.label} className={cn(
      "inline-flex items-center gap-1.5 rounded-md border font-medium",
      size === "sm" ? "px-1.5 py-px text-[10px]" : "px-2 py-0.5 text-[11px]",
      c.class, className
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
};

export const StateStep = ({ states, current }: { states: ExecutionState[]; current: ExecutionState }) => {
  const currentIdx = states.indexOf(current);
  return (
    <div className="flex items-center gap-1">
      {states.map((s, i) => {
        const c = stateConfig[s];
        const isPast = i < currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={s} className="flex items-center gap-1">
            <div className={cn(
              "h-2 w-2 rounded-full transition-colors",
              isCurrent ? c.dot : isPast ? "bg-trust-verified" : "bg-muted"
            )} title={c.label} />
            {i < states.length - 1 && (
              <div className={cn("h-px w-3", isPast ? "bg-trust-verified" : "bg-muted")} />
            )}
          </div>
        );
      })}
    </div>
  );
};
