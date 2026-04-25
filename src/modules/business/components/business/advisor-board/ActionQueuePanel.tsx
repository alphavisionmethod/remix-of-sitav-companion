import { motion } from "framer-motion";
import { Check, X, Play, Undo, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BusinessAction } from "@/domains/engines/business-action-pipeline";

interface Props {
  actions: BusinessAction[];
  onSimulate: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onExecute: (id: string) => void;
  onRollback: (id: string) => void;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  proposed: { color: "200 60% 55%", label: "Proposed" },
  simulated: { color: "265 55% 58%", label: "Simulated" },
  "approval-ready": { color: "38 85% 58%", label: "Awaiting Approval" },
  approved: { color: "152 55% 48%", label: "Approved" },
  executing: { color: "265 55% 58%", label: "Executing" },
  completed: { color: "152 55% 48%", label: "Completed" },
  verified: { color: "152 55% 48%", label: "Verified" },
  rejected: { color: "0 65% 50%", label: "Rejected" },
  "rolled-back": { color: "38 85% 58%", label: "Rolled Back" },
};

export function ActionQueuePanel({ actions, onSimulate, onApprove, onReject, onExecute, onRollback }: Props) {
  if (actions.length === 0) {
    return (
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-6 text-center">
        <Clock className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
        <p className="text-xs text-muted-foreground">No actions in queue</p>
        <p className="text-[9px] text-muted-foreground/60 mt-1">Convert advisor recommendations to actions</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {actions.slice(0, 10).map((action, i) => {
        const cfg = statusConfig[action.status] ?? { color: "0 0% 50%", label: action.status };
        return (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(${cfg.color})` }} />
                  <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: `hsl(${cfg.color})` }}>
                    {cfg.label}
                  </span>
                  <span className="text-[8px] text-muted-foreground/60">by {action.advisorName}</span>
                </div>
                <p className="text-xs font-medium text-foreground truncate">{action.title}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">{action.description}</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {action.status === "proposed" && (
                  <>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onSimulate(action.id)}>
                      <Eye className="h-3 w-3 text-muted-foreground" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onApprove(action.id)}>
                      <Check className="h-3 w-3 text-[hsl(152_55%_48%)]" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onReject(action.id, "Not needed")}>
                      <X className="h-3 w-3 text-[hsl(0_65%_50%)]" />
                    </Button>
                  </>
                )}
                {action.status === "simulated" && (
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onApprove(action.id)}>
                    <Check className="h-3 w-3 text-[hsl(152_55%_48%)]" />
                  </Button>
                )}
                {(action.status === "approval-ready" || action.status === "approved") && (
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onExecute(action.id)}>
                    <Play className="h-3 w-3 text-[hsl(265_55%_58%)]" />
                  </Button>
                )}
                {action.status === "completed" && action.rollbackAvailable && (
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onRollback(action.id)}>
                    <Undo className="h-3 w-3 text-[hsl(38_85%_58%)]" />
                  </Button>
                )}
              </div>
            </div>

            {action.simulationResult && (
              <div className="mt-2 p-2 rounded bg-[hsl(265_55%_58%/0.05)] border border-[hsl(265_55%_58%/0.1)]">
                <p className="text-[9px] text-[hsl(265_55%_70%)]">{action.simulationResult.predictedOutcome}</p>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
