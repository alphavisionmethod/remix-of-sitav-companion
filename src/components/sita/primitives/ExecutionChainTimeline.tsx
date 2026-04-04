// ═══════════════════════════════════════════════════════════════
// SITA OS — Execution Chain Timeline
// Visual representation of the canonical 8-step execution chain:
// Intent → Proposal → Simulation → Approval → Execution → Receipt → Verification → Timeline
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Lightbulb, FileText, FlaskConical, Lock, Play, Receipt, ShieldCheck, Clock,
  CheckCircle, XCircle, Loader2, AlertTriangle
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type ChainStepId = "intent" | "proposal" | "simulation" | "approval" | "execution" | "receipt" | "verification" | "timeline";
export type StepStatus = "pending" | "active" | "completed" | "failed" | "skipped";

interface ChainStep {
  id: ChainStepId;
  status: StepStatus;
  label?: string;
  detail?: string;
  timestamp?: string;
}

const STEP_META: Record<ChainStepId, { icon: typeof Lightbulb; label: string }> = {
  intent: { icon: Lightbulb, label: "Intent" },
  proposal: { icon: FileText, label: "Proposal" },
  simulation: { icon: FlaskConical, label: "Simulation" },
  approval: { icon: Lock, label: "Approval" },
  execution: { icon: Play, label: "Execution" },
  receipt: { icon: Receipt, label: "Receipt" },
  verification: { icon: ShieldCheck, label: "Verification" },
  timeline: { icon: Clock, label: "Timeline" },
};

const STATUS_STYLES: Record<StepStatus, { ring: string; bg: string; icon: string; connector: string }> = {
  completed: {
    ring: "border-[hsl(var(--trust-safe))]",
    bg: "bg-[hsl(var(--trust-safe)/0.12)]",
    icon: "text-[hsl(var(--trust-safe))]",
    connector: "bg-[hsl(var(--trust-safe)/0.4)]",
  },
  active: {
    ring: "border-[hsl(var(--primary))]",
    bg: "bg-[hsl(var(--primary)/0.12)]",
    icon: "text-[hsl(var(--primary))]",
    connector: "bg-border/50",
  },
  failed: {
    ring: "border-destructive",
    bg: "bg-destructive/10",
    icon: "text-destructive",
    connector: "bg-destructive/30",
  },
  skipped: {
    ring: "border-border/40",
    bg: "bg-transparent",
    icon: "text-muted-foreground/30",
    connector: "bg-border/30",
  },
  pending: {
    ring: "border-border/50",
    bg: "bg-secondary/30",
    icon: "text-muted-foreground/40",
    connector: "bg-border/30",
  },
};

const StatusIcon = ({ status, className }: { status: StepStatus; className?: string }) => {
  if (status === "completed") return <CheckCircle className={cn("h-3 w-3", className)} />;
  if (status === "failed") return <XCircle className={cn("h-3 w-3", className)} />;
  if (status === "active") return <Loader2 className={cn("h-3 w-3 animate-spin", className)} />;
  return null;
};

interface ExecutionChainTimelineProps {
  steps: ChainStep[];
  orientation?: "horizontal" | "vertical";
  compact?: boolean;
  className?: string;
}

export const ExecutionChainTimeline = ({
  steps,
  orientation = "horizontal",
  compact = false,
  className,
}: ExecutionChainTimelineProps) => {
  const isVertical = orientation === "vertical";

  return (
    <TooltipProvider>
      <div className={cn(
        "flex",
        isVertical ? "flex-col gap-0" : "flex-row items-start gap-0",
        className
      )}>
        {steps.map((step, i) => {
          const meta = STEP_META[step.id];
          const styles = STATUS_STYLES[step.status];
          const Icon = meta.icon;
          const isLast = i === steps.length - 1;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: isVertical ? -4 : 0, x: isVertical ? 0 : -4 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                "flex",
                isVertical ? "flex-row items-stretch gap-3" : "flex-col items-center gap-1.5"
              )}
            >
              {/* Node + connector */}
              <div className={cn(
                "flex items-center",
                isVertical ? "flex-col" : "flex-row"
              )}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      "relative flex items-center justify-center rounded-lg border-2 transition-all",
                      compact ? "h-7 w-7" : "h-9 w-9",
                      styles.ring, styles.bg,
                      step.status === "active" && "shadow-[0_0_16px_hsl(var(--primary)/0.25)]"
                    )}>
                      <Icon className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4", styles.icon)} />
                      {step.status === "active" && (
                        <motion.div
                          className="absolute inset-0 rounded-lg border-2 border-[hsl(var(--primary))]"
                          animate={{ opacity: [0.3, 0.7, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                      {(step.status === "completed" || step.status === "failed") && (
                        <div className="absolute -bottom-0.5 -right-0.5">
                          <StatusIcon status={step.status} className={styles.icon} />
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side={isVertical ? "right" : "bottom"}>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold">{step.label || meta.label}</p>
                      {step.detail && <p className="text-[10px] text-muted-foreground">{step.detail}</p>}
                      {step.timestamp && <p className="text-[10px] text-muted-foreground">{step.timestamp}</p>}
                    </div>
                  </TooltipContent>
                </Tooltip>

                {!isLast && (
                  <div className={cn(
                    "transition-colors",
                    isVertical ? "h-4 w-px min-h-[16px]" : "h-px w-6",
                    styles.connector
                  )} />
                )}
              </div>

              {/* Label (non-compact) */}
              {!compact && (
                <div className={cn(
                  isVertical ? "flex flex-col justify-center pb-3" : "flex flex-col items-center",
                  isVertical && isLast && "pb-0"
                )}>
                  <span className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider",
                    step.status === "active" ? "text-[hsl(var(--primary))]"
                      : step.status === "completed" ? "text-foreground/70"
                        : step.status === "failed" ? "text-destructive"
                          : "text-muted-foreground/40"
                  )}>
                    {step.label || meta.label}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

/** Helper: create a default chain from a current step */
export function buildDefaultChain(
  currentStep: ChainStepId,
  options?: { skipSimulation?: boolean; failed?: boolean }
): ChainStep[] {
  const allSteps: ChainStepId[] = ["intent", "proposal", "simulation", "approval", "execution", "receipt", "verification", "timeline"];
  const currentIdx = allSteps.indexOf(currentStep);

  return allSteps.map((id, i) => ({
    id,
    status: options?.skipSimulation && id === "simulation"
      ? "skipped" as StepStatus
      : i < currentIdx
        ? "completed" as StepStatus
        : i === currentIdx
          ? (options?.failed ? "failed" : "active") as StepStatus
          : "pending" as StepStatus,
  }));
}
