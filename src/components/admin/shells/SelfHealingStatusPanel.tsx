import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wrench, CheckCircle, Loader2, Shield, Undo2, Clock,
  AlertTriangle, ArrowRight
} from "lucide-react";

interface HealingTask {
  id: string;
  label: string;
  subsystem: string;
  status: "active" | "completed" | "pending-approval";
  safe: boolean;
  expectedEffect: string;
  undoAvailable: boolean;
  startedAt: string;
}

const HEALING_TASKS: HealingTask[] = [
  {
    id: "h1", label: "Fixing retry policy drift in sync-service",
    subsystem: "Sync", status: "active", safe: true,
    expectedEffect: "Reduce retry storms by ~40%",
    undoAvailable: true, startedAt: "2 min ago",
  },
  {
    id: "h2", label: "Rebalancing preview job queue",
    subsystem: "Jobs", status: "active", safe: true,
    expectedEffect: "Clear backlog in ~5 minutes",
    undoAvailable: true, startedAt: "4 min ago",
  },
  {
    id: "h3", label: "Reindexing delayed search segment",
    subsystem: "Storage", status: "completed", safe: true,
    expectedEffect: "Search latency reduced by 120ms",
    undoAvailable: false, startedAt: "12 min ago",
  },
  {
    id: "h4", label: "Cleaning stale rollout artifacts",
    subsystem: "Releases", status: "active", safe: true,
    expectedEffect: "Free 2.1 GB of artifact storage",
    undoAvailable: false, startedAt: "8 min ago",
  },
  {
    id: "h5", label: "Optimizing AI prompt cache hit rate",
    subsystem: "AI", status: "pending-approval", safe: true,
    expectedEffect: "Reduce AI spend by ~8%",
    undoAvailable: true, startedAt: "Queued",
  },
];

const STATUS_CFG = {
  active: { icon: Loader2, color: "text-blue-400", label: "Running", animate: true },
  completed: { icon: CheckCircle, color: "text-emerald-400", label: "Done", animate: false },
  "pending-approval": { icon: AlertTriangle, color: "text-amber-400", label: "Needs Approval", animate: false },
};

export function SelfHealingStatusPanel() {
  const activeCount = HEALING_TASKS.filter(t => t.status === "active").length;
  const pendingCount = HEALING_TASKS.filter(t => t.status === "pending-approval").length;

  return (
    <div className="space-y-3">
      {/* Header summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-[10px] text-blue-400 font-medium">
            Self-healing active · {activeCount} tasks running
          </span>
        </div>
        {pendingCount > 0 && (
          <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/20">
            {pendingCount} needs approval
          </Badge>
        )}
      </div>

      {/* Task list */}
      <div className="space-y-1.5">
        {HEALING_TASKS.map(task => {
          const cfg = STATUS_CFG[task.status];
          const StatusIcon = cfg.icon;
          return (
            <div key={task.id} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1.5">
              <div className="flex items-center gap-2">
                <StatusIcon className={cn("h-3 w-3", cfg.color, cfg.animate && "animate-spin")} />
                <span className="text-[11px] text-foreground flex-1">{task.label}</span>
                <Badge variant="outline" className="text-[8px] h-3.5">{task.subsystem}</Badge>
              </div>
              <div className="pl-5 flex items-center gap-3 text-[10px]">
                <span className="text-muted-foreground">
                  <ArrowRight className="h-2.5 w-2.5 inline mr-0.5" />
                  {task.expectedEffect}
                </span>
              </div>
              <div className="pl-5 flex items-center gap-2 text-[9px]">
                {task.safe && (
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <Shield className="h-2.5 w-2.5" /> Safe
                  </span>
                )}
                {task.undoAvailable && (
                  <span className="text-muted-foreground flex items-center gap-0.5">
                    <Undo2 className="h-2.5 w-2.5" /> Undoable
                  </span>
                )}
                <span className="text-muted-foreground flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" /> {task.startedAt}
                </span>
                {task.status === "pending-approval" && (
                  <Button variant="outline" size="sm" className="h-4 text-[8px] px-1.5 ml-auto">
                    Approve
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
