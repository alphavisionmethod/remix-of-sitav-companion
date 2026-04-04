// ═══════════════════════════════════════════════════════════════
// SITA OS — Autonomy Ladder
// Vertical stepped trust visualization: observe → autonomous
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Eye, MessageSquare, CheckCircle, Repeat, Zap, Crown, Lock, ArrowUp, ArrowDown, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type AutonomyRung =
  | "observe"
  | "suggest"
  | "approve-execute"
  | "delegated-single"
  | "delegated-recurring"
  | "fully-autonomous";

interface RungConfig {
  icon: typeof Eye;
  label: string;
  description: string;
  color: string;
  glow: string;
}

const RUNGS: Record<AutonomyRung, RungConfig> = {
  observe: {
    icon: Eye,
    label: "Observe",
    description: "System watches and learns — no action taken",
    color: "text-muted-foreground",
    glow: "shadow-[0_0_12px_hsl(var(--muted-foreground)/0.3)]",
  },
  suggest: {
    icon: MessageSquare,
    label: "Suggest",
    description: "System recommends actions — you decide",
    color: "text-[hsl(var(--state-proposed))]",
    glow: "shadow-[0_0_12px_hsl(var(--state-proposed)/0.3)]",
  },
  "approve-execute": {
    icon: CheckCircle,
    label: "Approve & Execute",
    description: "System prepares — executes on your approval",
    color: "text-[hsl(var(--trust-approval))]",
    glow: "shadow-[0_0_12px_hsl(var(--trust-approval)/0.3)]",
  },
  "delegated-single": {
    icon: Zap,
    label: "Delegated (Single)",
    description: "System executes one-off actions autonomously",
    color: "text-[hsl(var(--sita-gold))]",
    glow: "shadow-[0_0_12px_hsl(var(--sita-gold)/0.3)]",
  },
  "delegated-recurring": {
    icon: Repeat,
    label: "Delegated (Recurring)",
    description: "System handles recurring tasks without prompting",
    color: "text-[hsl(var(--trust-safe))]",
    glow: "shadow-[0_0_16px_hsl(var(--trust-safe)/0.3)]",
  },
  "fully-autonomous": {
    icon: Crown,
    label: "Fully Autonomous",
    description: "System operates independently within policy bounds",
    color: "text-[hsl(var(--primary))]",
    glow: "shadow-[0_0_20px_hsl(var(--primary)/0.4)]",
  },
};

const RUNG_ORDER: AutonomyRung[] = [
  "fully-autonomous",
  "delegated-recurring",
  "delegated-single",
  "approve-execute",
  "suggest",
  "observe",
];

interface AutonomyLadderProps {
  currentRung: AutonomyRung;
  capabilityName?: string;
  evidenceForPromotion?: string[];
  incidentForDowngrade?: string;
  inShadowMode?: boolean;
  className?: string;
  compact?: boolean;
}

export const AutonomyLadder = ({
  currentRung,
  capabilityName,
  evidenceForPromotion,
  incidentForDowngrade,
  inShadowMode,
  className,
  compact = false,
}: AutonomyLadderProps) => {
  const currentIdx = RUNG_ORDER.indexOf(currentRung);

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col gap-1", className)}>
        {capabilityName && (
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Autonomy Level
            </span>
            {inShadowMode && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--state-simulated)/0.3)] bg-[hsl(var(--state-simulated)/0.08)] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--state-simulated))]">
                <Eye className="h-2.5 w-2.5" /> Shadow
              </span>
            )}
          </div>
        )}

        <div className="relative flex flex-col">
          {RUNG_ORDER.map((rung, i) => {
            const config = RUNGS[rung];
            const Icon = config.icon;
            const isPast = i > currentIdx;
            const isCurrent = i === currentIdx;
            const isFuture = i < currentIdx;
            const isLast = i === RUNG_ORDER.length - 1;

            if (compact && !isCurrent && Math.abs(i - currentIdx) > 1) return null;

            return (
              <div key={rung} className="flex items-stretch gap-3">
                {/* Vertical connector line + node */}
                <div className="relative flex flex-col items-center" style={{ width: 32 }}>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "relative z-10 flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-300",
                      isCurrent
                        ? cn("border-transparent bg-card", config.glow, config.color)
                        : isPast
                          ? "border-[hsl(var(--trust-safe)/0.3)] bg-[hsl(var(--trust-safe)/0.08)] text-[hsl(var(--trust-safe))]"
                          : "border-border bg-secondary/40 text-muted-foreground/40"
                    )}
                  >
                    {isCurrent ? (
                      <Icon className="h-4 w-4" />
                    ) : isPast ? (
                      <CheckCircle className="h-3.5 w-3.5" />
                    ) : (
                      <Lock className="h-3 w-3" />
                    )}
                    {isCurrent && (
                      <motion.div
                        className={cn("absolute inset-0 rounded-lg border-2", config.color.replace("text-", "border-"))}
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>

                  {/* Connector line */}
                  {!isLast && (
                    <div className={cn(
                      "w-px flex-1 min-h-[12px]",
                      isPast ? "bg-[hsl(var(--trust-safe)/0.3)]" : "bg-border/50"
                    )} />
                  )}
                </div>

                {/* Label + description */}
                <div className={cn("flex flex-col justify-center pb-3", isLast && "pb-0")}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className={cn(
                        "text-sm font-semibold leading-tight transition-colors",
                        isCurrent ? config.color : isPast ? "text-foreground/70" : "text-muted-foreground/40"
                      )}>
                        {config.label}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[200px]">
                      <p className="text-xs">{config.description}</p>
                    </TooltipContent>
                  </Tooltip>
                  {isCurrent && !compact && (
                    <span className="mt-0.5 text-[11px] text-muted-foreground">{config.description}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Promotion / downgrade hints */}
        {(evidenceForPromotion?.length || incidentForDowngrade) && (
          <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
            {evidenceForPromotion && evidenceForPromotion.length > 0 && (
              <div className="flex items-start gap-2 rounded-lg bg-[hsl(var(--trust-safe)/0.06)] p-2">
                <ArrowUp className="mt-0.5 h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" />
                <div>
                  <p className="text-[11px] font-semibold text-[hsl(var(--trust-safe))]">To promote</p>
                  {evidenceForPromotion.map((e, i) => (
                    <p key={i} className="text-[10px] text-muted-foreground">• {e}</p>
                  ))}
                </div>
              </div>
            )}
            {incidentForDowngrade && (
              <div className="flex items-start gap-2 rounded-lg bg-[hsl(var(--destructive)/0.06)] p-2">
                <ArrowDown className="mt-0.5 h-3.5 w-3.5 text-destructive" />
                <div>
                  <p className="text-[11px] font-semibold text-destructive">Downgrade risk</p>
                  <p className="text-[10px] text-muted-foreground">{incidentForDowngrade}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
