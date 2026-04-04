import { Check, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SetupPhaseId, SetupPhaseStatus } from "@/packages/contracts/specialized/setup-orchestration";

interface PremiumProgressRailProps {
  steppablePhases: SetupPhaseId[];
  currentIndex: number;
  allPhaseStates: Record<string, { status: SetupPhaseStatus; retryCount: number }>;
}

export function PremiumProgressRail({ steppablePhases, currentIndex, allPhaseStates }: PremiumProgressRailProps) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {steppablePhases.map((phaseId, i) => {
        const phaseState = allPhaseStates[phaseId];
        const status: SetupPhaseStatus = phaseState?.status ?? "idle";
        const isActive = i === currentIndex;
        const isCompleted = status === "completed" || status === "success";
        const isSkipped = status === "skipped";
        const isBlocked = status === "blocked";

        return (
          <div key={phaseId} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="flex items-center justify-center h-3">
              {isCompleted ? (
                <div className="h-2.5 w-2.5 rounded-full bg-trust-safe flex items-center justify-center">
                  <Check className="h-1.5 w-1.5 text-background" />
                </div>
              ) : isSkipped ? (
                <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40 flex items-center justify-center">
                  <SkipForward className="h-1.5 w-1.5 text-background" />
                </div>
              ) : isBlocked ? (
                <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
              ) : isActive ? (
                <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-muted" />
              )}
            </div>
            <div className={cn(
              "h-1 w-full rounded-full transition-all duration-500",
              isCompleted ? "bg-trust-safe" :
              isSkipped ? "bg-muted-foreground/30" :
              isBlocked ? "bg-destructive/40" :
              isActive ? "bg-primary/60" :
              "bg-muted"
            )} />
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block z-50">
              <div className="rounded-md bg-popover border border-border px-2 py-0.5 text-[9px] text-popover-foreground whitespace-nowrap shadow-lg">
                {phaseId.replace(/-/g, " ")} · <span className="capitalize">{status}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
