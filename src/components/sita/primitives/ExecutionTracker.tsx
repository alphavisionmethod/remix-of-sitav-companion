// ═══════════════════════════════════════════════════════════════
// SITA OS — Post-Boardroom Execution Tracker
// Tracks action items decided during boardroom sessions
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ConfidenceBar } from "./ConfidenceBar";
import { StateBadge, type ExecutionState } from "../StateBadge";
import {
  CheckCircle, Clock, AlertTriangle, ArrowRight,
  Clipboard, Target, Zap, RotateCcw
} from "lucide-react";

interface TrackedAction {
  id: string;
  title: string;
  assignee: string;
  decidedAt: string;
  dueBy?: string;
  status: "pending" | "in-progress" | "completed" | "blocked" | "overdue";
  domain: "business" | "money" | "concierge";
  progress: number; // 0-100
  proofGenerated?: boolean;
}

interface ExecutionTrackerProps {
  sessionTitle?: string;
  sessionDate?: string;
  actions: TrackedAction[];
  className?: string;
}

const statusToExecutionState = (s: TrackedAction["status"]): ExecutionState => {
  const map: Record<string, ExecutionState> = {
    pending: "queued",
    "in-progress": "executing",
    completed: "completed",
    blocked: "escalated",
    overdue: "escalated",
  };
  return map[s] as ExecutionState || "proposed";
};

const statusIcon = (s: TrackedAction["status"]) => {
  switch (s) {
    case "completed": return <CheckCircle className="h-4 w-4 text-[hsl(var(--trust-safe))]" />;
    case "in-progress": return <Clock className="h-4 w-4 text-primary animate-pulse" />;
    case "blocked": return <AlertTriangle className="h-4 w-4 text-[hsl(var(--destructive))]" />;
    case "overdue": return <AlertTriangle className="h-4 w-4 text-[hsl(var(--sita-gold))]" />;
    default: return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const domainColors: Record<string, string> = {
  business: "bg-[hsl(var(--sita-purple))]/10 text-[hsl(var(--sita-purple))]",
  money: "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]",
  concierge: "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]",
};

export const ExecutionTracker = ({
  sessionTitle = "Boardroom Session",
  sessionDate,
  actions,
  className,
}: ExecutionTrackerProps) => {
  const completed = actions.filter(a => a.status === "completed").length;
  const blocked = actions.filter(a => a.status === "blocked" || a.status === "overdue").length;
  const overallProgress = actions.length > 0
    ? Math.round(actions.reduce((sum, a) => sum + a.progress, 0) / actions.length)
    : 0;

  return (
    <div className={cn("rounded-2xl border border-border bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/8 to-transparent px-5 py-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2">
              <Clipboard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-foreground">Post-Session Execution</h3>
              <p className="text-[11px] text-muted-foreground">{sessionTitle} {sessionDate ? `· ${sessionDate}` : ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-lg font-display font-bold text-foreground">{completed}/{actions.length}</p>
              <p className="text-[10px] text-muted-foreground">completed</p>
            </div>
            <ConfidenceBar value={overallProgress} size="sm" className="w-16" label="" />
          </div>
        </div>

        {/* Progress summary */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-primary"
            />
          </div>
          {blocked > 0 && (
            <span className="text-[10px] font-semibold text-[hsl(var(--destructive))] flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> {blocked} blocked
            </span>
          )}
        </div>
      </div>

      {/* Action items */}
      <div className="divide-y divide-border/50">
        {actions.map((action, i) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/20 transition-colors cursor-pointer group"
          >
            {statusIcon(action.status)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={cn("text-sm text-foreground", action.status === "completed" && "line-through text-muted-foreground")}>{action.title}</p>
                <span className={cn("rounded-full px-1.5 py-px text-[9px] font-medium capitalize", domainColors[action.domain])}>
                  {action.domain}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-muted-foreground">{action.assignee}</span>
                {action.dueBy && <span className="text-[10px] text-muted-foreground">· Due {action.dueBy}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {action.proofGenerated && (
                <span className="text-[9px] text-[hsl(var(--trust-safe))] font-medium flex items-center gap-0.5">
                  <CheckCircle className="h-2.5 w-2.5" /> Proof
                </span>
              )}
              <StateBadge state={statusToExecutionState(action.status)} size="sm" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
